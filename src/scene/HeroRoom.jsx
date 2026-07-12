import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { heroState } from './heroState'
// (heroState is also read inside Bulb for the leaving-dim)

// ============================================================
// The entrance — a real 3D room. Wood floor and plaster walls
// lit by a swinging bulb, a web strung in the corner catching
// light, a spider with actual anatomy hanging on its thread,
// and a doorway in the back wall the camera walks through as
// the visitor scrolls out (first-person exit).
// ============================================================

// ---------- procedural textures (generated once, no downloads) ----------
function makeWoodTexture() {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 512
  const g = c.getContext('2d')
  g.fillStyle = '#241708'
  g.fillRect(0, 0, 512, 512)
  const plankW = 512 / 6
  for (let p = 0; p < 6; p++) {
    const x0 = p * plankW
    const base = 30 + Math.random() * 14
    for (let y = 0; y < 512; y += 2) {
      const n = Math.sin(y * 0.045 + p * 7) * 7 + Math.sin(y * 0.21 + p * 13) * 3.5
      const v = base + n + (Math.random() - 0.5) * 7
      g.fillStyle = `rgb(${v + 12}, ${v * 0.72 + 6}, ${v * 0.4})`
      g.fillRect(x0 + 1.5, y, plankW - 3, 2)
    }
    // dark seam + occasional knot
    g.fillStyle = 'rgba(0,0,0,0.68)'
    g.fillRect(x0, 0, 1.8, 512)
    if (Math.random() > 0.4) {
      const ky = Math.random() * 512
      g.beginPath()
      g.ellipse(x0 + plankW / 2, ky, 5.5, 9, 0, 0, 7)
      g.fillStyle = 'rgba(12,7,2,0.8)'
      g.fill()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(3, 2)
  return t
}

function makePlasterTexture() {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 256
  const g = c.getContext('2d')
  g.fillStyle = '#171209'
  g.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 2600; i++) {
    const v = Math.random() * 26
    g.fillStyle = `rgba(${34 + v}, ${27 + v * 0.8}, ${15 + v * 0.5}, ${0.16 + Math.random() * 0.2})`
    g.fillRect(Math.random() * 256, Math.random() * 256, 1.6, 1.6)
  }
  // water stains
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * 256, y = Math.random() * 200
    const r = 18 + Math.random() * 40
    const grad = g.createRadialGradient(x, y, 2, x, y, r)
    grad.addColorStop(0, 'rgba(8,5,2,0.35)')
    grad.addColorStop(1, 'rgba(8,5,2,0)')
    g.fillStyle = grad
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 2)
  return t
}

// ---------- web geometry: radial threads + sagging spiral ----------
function buildWeb(cx, cy, cz) {
  const pts = []
  const SP = 9 // spokes
  const spokes = []
  for (let i = 0; i <= SP; i++) {
    // quarter web tucked into the corner: spans wall-corner angle
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
      // sag the connecting thread toward the corner's gravity
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - r * 0.075
      pts.push(x1, y1, cz + 0.06, mx, my, cz + 0.06)
      pts.push(mx, my, cz + 0.06, x2, y2, cz + 0.06)
    }
  }
  // a few broken loose ends
  pts.push(cx + 0.4, cy - 1.9, cz + 0.1, cx + 0.55, cy - 2.5, cz + 0.22)
  pts.push(cx + 1.3, cy - 1.5, cz + 0.1, cx + 1.5, cy - 2.1, cz + 0.25)
  return new Float32Array(pts)
}

// ---------- spider: two body segments + 8 jointed legs ----------
function SpiderLegs() {
  // legs as pairs of segments; per-leg base rotation around the body
  const legs = useMemo(() => {
    const arr = []
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        arr.push({
          yaw: side * (0.55 + i * 0.42),
          pitch: 0.55 + (i % 2) * 0.12,
          upper: 0.30, lower: 0.36,
          phase: i * 1.7 + (side > 0 ? 0.9 : 0),
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
          {/* upper segment: out and up */}
          <group rotation={[0, 0, l.side * l.pitch]} name={`legU${i}`}>
            <mesh position={[l.side * l.upper / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.011, 0.016, l.upper, 5]} />
              <meshStandardMaterial color="#1c1610" roughness={0.9} />
            </mesh>
            {/* lower segment: bends down from the knee */}
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
  const restY = anchor[1] - 1.55
  const state = useRef({ y: restY, flee: 0 })
  const { camera } = useThree()
  const proj = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }, dt) => {
    if (!rig.current) return
    const t = clock.elapsedTime
    const s = state.current

    // cursor proximity in screen space → climb the thread
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

    // leg micro-steps
    rig.current.traverse((o) => {
      if (o.name?.startsWith('legU')) {
        const i = Number(o.name.slice(4))
        o.rotation.x = Math.sin(t * 2.3 + i * 1.7) * 0.05
      }
    })

    // thread follows
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
        <lineBasicMaterial color="#cfc8b4" transparent opacity={0.4} />
      </line>
      <group ref={rig} scale={1.15}>
        {/* abdomen */}
        <mesh position={[0, -0.16, 0]} scale={[1, 1.3, 1.1]}>
          <sphereGeometry args={[0.15, 20, 16]} />
          <meshStandardMaterial color="#241d14" roughness={0.75} />
        </mesh>
        {/* cephalothorax */}
        <mesh position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshStandardMaterial color="#2c241a" roughness={0.7} />
        </mesh>
        <SpiderLegs />
      </group>
    </>
  )
}

// ---------- swinging bulb that actually lights the room ----------
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
      // filament flutter; dims as the visitor is drawn out of the room
      const flick = 0.9 + Math.sin(t * 11) * 0.02 + Math.sin(t * 23.7) * 0.03 + (Math.random() > 0.992 ? -0.35 : 0)
      const leaving = 1 - Math.min(1, Math.max(0, (heroState.p - 0.45) / 0.4)) * 0.75
      lightRef.current.intensity = lit ? 14 * flick * leaving : 0
    }
  })

  return (
    <group ref={pivot} position={[0.6, 3.4, -2.4]}>
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
      <pointLight ref={lightRef} position={[0, -2.11, 0]} color="#ffbe70" distance={16} decay={1.9} />
    </group>
  )
}

// ---------- the room ----------
export default function HeroRoom({ lit }) {
  const group = useRef()
  const doorRef = useRef()
  const spillRef = useRef()
  const { camera } = useThree()

  const wood = useMemo(makeWoodTexture, [])
  const plaster = useMemo(makePlasterTexture, [])
  const webGeo = useMemo(() => buildWeb(-6.2, 3.3, -5.82), [])

  // camera path for the walk-out: drift right → doorway → through
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.25, 7.4),
    new THREE.Vector3(1.6, 0.1, 3.4),
    new THREE.Vector3(3.1, -0.1, -1.6),
    new THREE.Vector3(3.2, -0.2, -5.6),
    new THREE.Vector3(3.2, -0.25, -8.6),
  ]), [])
  const lookTarget = useMemo(() => new THREE.Vector3(), [])
  const camPos = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    if (!group.current) return
    const p = heroState.p
    const active = heroState.active
    group.current.visible = active

    if (!active) return

    // the opening is already ajar — it just gives way as you're drawn out
    const openT = THREE.MathUtils.smoothstep(p, 0.5, 0.82)
    if (doorRef.current) doorRef.current.rotation.y = -(0.55 + openT * 1.5)
    if (spillRef.current) {
      spillRef.current.intensity = 0.4 + openT * 3.4
    }

    // camera: idle look-around → drawn out through the opening.
    // The exit reads as motion through an aperture: accelerating dolly,
    // fov widening (zoom-out feel), light spill growing, then darkness
    // swallows the frame — not a staged look-at-the-door moment.
    const walk = THREE.MathUtils.smoothstep(p, 0.42, 1)
    if (walk <= 0) {
      camPos.set(
        0 + heroState.mouse.x * 0.55,
        0.25 + heroState.mouse.y * 0.3,
        7.4
      )
      camera.position.lerp(camPos, 0.06)
      lookTarget.set(heroState.mouse.x * 1.4, 0.05 + heroState.mouse.y * 0.7, -2)
      if (camera.fov !== 55) { camera.fov += (55 - camera.fov) * 0.08; camera.updateProjectionMatrix() }
    } else {
      path.getPointAt(Math.min(walk, 0.999), camPos)
      // faint head-bob early in the pull, gone by the end
      camPos.y += Math.sin(walk * 26) * 0.03 * (1 - walk)
      camera.position.lerp(camPos, 0.12)
      // fov opens as you pass through — the "zooming out of a space" feel
      const targetFov = 55 + THREE.MathUtils.smoothstep(walk, 0.45, 1) * 22
      camera.fov += (targetFov - camera.fov) * 0.1
      camera.updateProjectionMatrix()
      const gaze = Math.min(1, walk * 1.6)
      lookTarget.set(
        THREE.MathUtils.lerp(heroState.mouse.x * 1.2, 3.2, gaze),
        THREE.MathUtils.lerp(0.05, -0.25, gaze),
        THREE.MathUtils.lerp(-2, -9, gaze)
      )
    }
    camera.lookAt(lookTarget)
  })

  return (
    <group ref={group}>
      {/* lighting: near-nothing in the dark (the torch does the work),
          warm and moody once the switch is on */}
      <ambientLight intensity={lit ? 0.22 : 0.09} color="#c9baa0" />
      <ambientLight intensity={lit ? 0.1 : 0.05} color="#8a94b8" />
      <Bulb lit={lit} />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, -0.5]}>
        <planeGeometry args={[18, 15]} />
        <meshStandardMaterial map={wood} roughness={0.85} />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.45, -0.5]}>
        <planeGeometry args={[18, 15]} />
        <meshStandardMaterial map={plaster} color="#5e564a" roughness={1} />
      </mesh>
      {/* back wall — split around the doorway (opening x 2.4..4.0, top y 0.9) */}
      <mesh position={[-2.8, 0.625, -6]}>
        <planeGeometry args={[10.4, 5.65]} />
        <meshStandardMaterial map={plaster} roughness={1} />
      </mesh>
      <mesh position={[6.5, 0.625, -6]}>
        <planeGeometry args={[5, 5.65]} />
        <meshStandardMaterial map={plaster} roughness={1} />
      </mesh>
      <mesh position={[3.2, 2.175, -6]}>
        <planeGeometry args={[1.6, 2.55]} />
        <meshStandardMaterial map={plaster} roughness={1} />
      </mesh>
      {/* side walls */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-8, 0.625, -0.5]}>
        <planeGeometry args={[15, 5.65]} />
        <meshStandardMaterial map={plaster} roughness={1} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[8, 0.625, -0.5]}>
        <planeGeometry args={[15, 5.65]} />
        <meshStandardMaterial map={plaster} roughness={1} />
      </mesh>

      {/* doorway: jambs, lintel, swinging door, warm spill behind */}
      <group position={[3.2, 0, -6]}>
        <mesh position={[-0.86, -0.65, 0]}>
          <boxGeometry args={[0.14, 3.1, 0.22]} />
          <meshStandardMaterial color="#1d1610" roughness={0.8} />
        </mesh>
        <mesh position={[0.86, -0.65, 0]}>
          <boxGeometry args={[0.14, 3.1, 0.22]} />
          <meshStandardMaterial color="#1d1610" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.97, 0]}>
          <boxGeometry args={[1.86, 0.16, 0.22]} />
          <meshStandardMaterial color="#1d1610" roughness={0.8} />
        </mesh>
        {/* door leaf, hinged left */}
        <group position={[-0.78, -0.65, 0]}>
          <group ref={doorRef}>
            <mesh position={[0.78, 0, -0.02]}>
              <boxGeometry args={[1.56, 3.0, 0.06]} />
              <meshStandardMaterial color="#221a10" roughness={0.75} />
            </mesh>
            <mesh position={[1.42, -0.05, 0.05]}>
              <sphereGeometry args={[0.045, 10, 8]} />
              <meshStandardMaterial color="#8a6f38" metalness={0.7} roughness={0.35} />
            </mesh>
          </group>
        </group>
        <pointLight ref={spillRef} position={[0.2, -0.4, -2.2]} color="#ffb35e" distance={11} decay={2} intensity={0.4} />
        {/* darkness beyond the door so the pass-through ends black */}
        <mesh position={[0, 0, -4.4]}>
          <planeGeometry args={[10, 8]} />
          <meshBasicMaterial color="#050403" />
        </mesh>
      </group>

      {/* the web, strung into the top-left corner */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={webGeo} count={webGeo.length / 3} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#d8d2c0" transparent opacity={0.38} />
      </lineSegments>
      <Spider anchor={[-5.1, 2.7, -5.45]} />
    </group>
  )
}
