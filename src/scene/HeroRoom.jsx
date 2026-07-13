import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { heroState } from './heroState'
import {
  RubbleField, BrickShell, BrokenWindow, WebSheets, AnchorStrands, Critters,
} from './RoomDressing'

// ============================================================
// The entrance — a collapsed brick room. Daylight through a
// broken window, the floor buried in rubble, gauzy webs draped
// over everything. Camera sits LOW among the debris (like the
// reference photograph) and pulls backward out of the space as
// the visitor scrolls.
// ============================================================

// ---------- radial corner web (kept from v1, thickened) ----------
function buildWeb(cx, cy, cz) {
  const pts = []
  const SP = 9
  const spokes = []
  for (let i = 0; i <= SP; i++) {
    const a = Math.PI * 1.0 + (i / SP) * Math.PI * 0.52
    spokes.push(a)
    const len = 2.1 + Math.sin(i * 2.7) * 0.25
    pts.push(cx, cy, cz, cx + Math.cos(a) * len, cy + Math.sin(a) * len, cz + 0.12)
  }
  for (let r = 0.35; r < 2.05; r += 0.34) {
    for (let i = 0; i < SP; i++) {
      const a1 = spokes[i], a2 = spokes[i + 1]
      const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r
      const x2 = cx + Math.cos(a2) * r, y2 = cy + Math.sin(a2) * r
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - r * 0.075
      pts.push(x1, y1, cz + 0.06, mx, my, cz + 0.06)
      pts.push(mx, my, cz + 0.06, x2, y2, cz + 0.06)
    }
  }
  return new Float32Array(pts)
}

// ---------- hanging spider (unchanged anatomy, window backdrop) ----------
function SpiderLegs() {
  const legs = useMemo(() => {
    const arr = []
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        arr.push({
          yaw: side * (0.55 + i * 0.42),
          pitch: 0.55 + (i % 2) * 0.12,
          upper: 0.30, lower: 0.36,
          side,
        })
      }
    }
    return arr
  }, [])

  return (
    <group>
      {legs.map((l, i) => (
        <group key={i} rotation={[0, l.yaw, 0]} position={[0, 0.02, 0]}>
          <group rotation={[0, 0, l.side * l.pitch]} name={`legU${i}`}>
            <mesh position={[l.side * l.upper / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.011, 0.016, l.upper, 5]} />
              <meshStandardMaterial color="#1c1610" roughness={0.9} />
            </mesh>
            <group position={[l.side * l.upper, 0, 0]} rotation={[0, 0, -l.side * (l.pitch + 0.9)]}>
              <mesh position={[l.side * l.lower / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.006, 0.011, l.lower, 5]} />
                <meshStandardMaterial color="#181209" roughness={0.9} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
    </group>
  )
}

function Spider({ anchor }) {
  const rig = useRef()
  const threadRef = useRef()
  const restY = anchor[1] - 1.45
  const state = useRef({ y: restY, flee: 0 })
  const { camera } = useThree()
  const proj = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    if (!rig.current) return
    const t = clock.elapsedTime
    const s = state.current

    proj.set(anchor[0], s.y, anchor[2]).project(camera)
    const dx = proj.x - heroState.mouse.x
    const dy = proj.y - heroState.mouse.y
    const near = Math.hypot(dx, dy) < 0.22
    s.flee += ((near ? 1 : 0) - s.flee) * (near ? 0.14 : 0.015)

    const bob = Math.sin(t * 1.7) * 0.045
    s.y = restY + bob + s.flee * 1.15
    rig.current.position.set(anchor[0], s.y, anchor[2])
    rig.current.rotation.z = Math.sin(t * 0.9) * 0.05
    rig.current.rotation.y = Math.sin(t * 0.35) * 0.2

    rig.current.traverse((o) => {
      if (o.name?.startsWith('legU')) {
        const i = Number(o.name.slice(4))
        o.rotation.x = Math.sin(t * 2.3 + i * 1.7) * 0.05
      }
    })

    const pos = threadRef.current.geometry.attributes.position
    pos.setXYZ(0, anchor[0], anchor[1], anchor[2])
    pos.setXYZ(1, anchor[0], s.y + 0.22, anchor[2])
    pos.needsUpdate = true
  })

  return (
    <>
      <line ref={threadRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([anchor[0], anchor[1], anchor[2], anchor[0], restY + 0.22, anchor[2]])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3a352c" opacity={0.85} transparent />
      </line>
      <group ref={rig} scale={1.15}>
        <mesh position={[0, -0.16, 0]} scale={[1, 1.3, 1.1]} castShadow>
          <sphereGeometry args={[0.15, 20, 16]} />
          <meshStandardMaterial color="#1c160e" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshStandardMaterial color="#241d12" roughness={0.7} />
        </mesh>
        <SpiderLegs />
      </group>
    </>
  )
}

// ---------- swinging bulb: a warm counterpoint to the cold daylight ----------
function Bulb({ lit }) {
  const pivot = useRef()
  const lightRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (pivot.current) {
      pivot.current.rotation.z = Math.sin(t * 0.62) * 0.075
      pivot.current.rotation.x = Math.sin(t * 0.41 + 1) * 0.045
    }
    if (lightRef.current) {
      const flick = 0.9 + Math.sin(t * 11) * 0.02 + Math.sin(t * 23.7) * 0.03 + (Math.random() > 0.992 ? -0.35 : 0)
      const leaving = 1 - Math.min(1, Math.max(0, (heroState.p - 0.45) / 0.4)) * 0.75
      lightRef.current.intensity = lit ? 3.2 * flick * leaving : 0
    }
  })

  return (
    <group ref={pivot} position={[2.6, 3.4, -1.8]}>
      <mesh position={[0, -0.95, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 1.9, 4]} />
        <meshBasicMaterial color="#0a0806" />
      </mesh>
      <mesh position={[0, -1.95, 0]}>
        <cylinderGeometry args={[0.045, 0.055, 0.09, 8]} />
        <meshStandardMaterial color="#2a2118" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, -2.11, 0]}>
        <sphereGeometry args={[0.095, 18, 14]} />
        <meshStandardMaterial
          color={lit ? '#f5cd85' : '#26201a'}
          emissive={lit ? '#e8ab55' : '#000000'}
          emissiveIntensity={lit ? 1.2 : 0}
          roughness={0.35}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, -2.11, 0]} color="#ffbe70" distance={12} decay={1.9} />
    </group>
  )
}

// ---------- the room ----------
export default function HeroRoom({ lit }) {
  const group = useRef()
  const fadeRef = useRef()
  const { camera } = useThree()

  const webGeo = useMemo(() => buildWeb(-7.6, 3.3, -5.82), [])

  // exit: pull BACKWARD and up — the room recedes and shrinks away
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.55, 6.6),
    new THREE.Vector3(0.25, -0.1, 9.6),
    new THREE.Vector3(0.45, 0.7, 12.6),
    new THREE.Vector3(0.6, 1.4, 15.8),
  ]), [])
  const lookTarget = useMemo(() => new THREE.Vector3(), [])
  const camPos = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    if (!group.current) return
    const p = heroState.p
    const active = heroState.active
    group.current.visible = active
    if (!active) return

    const walk = THREE.MathUtils.smoothstep(p, 0.42, 1)
    if (walk <= 0) {
      // LOW idle framing: camera sits just above the rubble line
      camPos.set(
        heroState.mouse.x * 0.5,
        -0.55 + heroState.mouse.y * 0.28,
        6.6
      )
      camera.position.lerp(camPos, 0.06)
      lookTarget.set(heroState.mouse.x * 1.2, -0.45 + heroState.mouse.y * 0.5, -2.6)
      if (camera.fov !== 58) { camera.fov += (58 - camera.fov) * 0.08; camera.updateProjectionMatrix() }
    } else {
      path.getPointAt(Math.min(walk, 0.999), camPos)
      camera.position.lerp(camPos, 0.12)
      const targetFov = 58 + THREE.MathUtils.smoothstep(walk, 0.3, 1) * 10
      camera.fov += (targetFov - camera.fov) * 0.1
      camera.updateProjectionMatrix()
      lookTarget.set(
        heroState.mouse.x * 0.4 * (1 - walk),
        THREE.MathUtils.lerp(-0.45, -1.8, walk),
        -2.8
      )
    }
    camera.lookAt(lookTarget)

    if (fadeRef.current) {
      fadeRef.current.material.opacity = THREE.MathUtils.smoothstep(p, 0.78, 0.98)
    }
  })

  return (
    <group ref={group}>
      {/* daylight fill: pale sky bounce + dark ground bounce */}
      <hemisphereLight args={['#c2ccbe', '#443e33', lit ? 0.85 : 0.3]} />
      <Bulb lit={lit} />

      <BrickShell />
      <BrokenWindow lit={lit} />
      <RubbleField />
      <WebSheets />
      <AnchorStrands />

      {/* radial web in the dark left corner */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={webGeo} count={webGeo.length / 3} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#d8d2c0" transparent opacity={0.45} />
      </lineSegments>

      {/* the hanging spider silhouettes against the window light */}
      <Spider anchor={[-1.15, 2.85, -5.4]} />
      <Critters />

      {/* darkness closes over the receding room at the end of the pull */}
      <mesh ref={fadeRef} position={[0.4, 0.6, 8.2]}>
        <planeGeometry args={[46, 26]} />
        <meshBasicMaterial color="#060504" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
