import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { heroState } from './heroState'
import { Piece, preloadPieces } from './toonify'
import { WebSheets, AnchorStrands, Critters, SpiderModel } from './RoomDressing'

// ============================================================
// The entrance — a ruined manor hall, built from authored kit
// assets (KayKit Dungeon Remastered, CC0) regraded through the
// toon pipeline. Cold moonlight through the arched window, one
// candle already burning, torches that answer the switch.
// Camera sits low and pulls backward out as the visitor scrolls.
// ============================================================

const S = 1.275            // kit walls are 4u; scaled to a 5.1u module
const FT = -2.33           // floor-tile top surface

preloadPieces([
  'wall', 'wall_cracked', 'wall_broken', 'wall_archedwindow_open', 'wall_shelves',
  'floor_wood_large_dark', 'pillar', 'column',
  'rubble_large', 'rubble_half', 'table_medium_broken', 'chair', 'stool',
  'trunk_large_A', 'box_stacked', 'barrel_large', 'keg', 'crates_stacked', 'chest',
  'shelf_large', 'bottle_A_green', 'bottle_B_brown', 'plate_stack',
  'candle_lit', 'candle_melted', 'candle_triple', 'torch_mounted', 'sword_shield_broken',
])

// ---------- radial corner web: uneven spokes, sagging rings, torn gaps ----------
function buildWeb(cx, cy, cz) {
  const pts = []
  const SP = 9
  const h = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x) }
  const spokes = []
  for (let i = 0; i <= SP; i++) {
    const a = Math.PI * 1.0 + (i / SP) * Math.PI * 0.52 + (h(i + 1) - 0.5) * 0.05
    spokes.push(a)
    const len = 2.1 + Math.sin(i * 2.7) * 0.25 + (h(i + 20) - 0.5) * 0.3
    pts.push(cx, cy, cz, cx + Math.cos(a) * len, cy + Math.sin(a) * len, cz + 0.12)
  }
  let ri = 0
  for (let r = 0.35; r < 2.05; r += 0.28 + h(ri++) * 0.14) {
    for (let i = 0; i < SP; i++) {
      if (h(ri * 31 + i * 7) < 0.13) continue
      const rr1 = r * (0.94 + h(ri * 13 + i * 3) * 0.12)
      const rr2 = r * (0.94 + h(ri * 13 + (i + 1) * 3) * 0.12)
      const a1 = spokes[i], a2 = spokes[i + 1]
      const x1 = cx + Math.cos(a1) * rr1, y1 = cy + Math.sin(a1) * rr1
      const x2 = cx + Math.cos(a2) * rr2, y2 = cy + Math.sin(a2) * rr2
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - r * 0.075
      pts.push(x1, y1, cz + 0.06, mx, my, cz + 0.06)
      pts.push(mx, my, cz + 0.06, x2, y2, cz + 0.06)
    }
  }
  return new Float32Array(pts)
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
    rig.current.rotation.y = Math.sin(t * 0.35) * 0.35
    rig.current.traverse((o) => {
      const u = o.userData
      if (u && u.legIdx !== undefined) {
        o.rotation.y =
          u.baseYaw +
          Math.sin(t * 1.8 + u.legIdx * 1.3) * 0.055 +
          s.flee * Math.sin(t * 16 + u.legIdx) * 0.12
      }
    })

    const pos = threadRef.current.geometry.attributes.position
    pos.setXYZ(0, anchor[0], anchor[1], anchor[2])
    pos.setXYZ(1, anchor[0], s.y + 0.2, anchor[2])
    pos.needsUpdate = true
  })

  return (
    <>
      <line ref={threadRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([anchor[0], anchor[1], anchor[2], anchor[0], restY + 0.2, anchor[2]])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3a352c" opacity={0.85} transparent />
      </line>
      {/* hangs head-down from the dragline — silk leaves the spinnerets,
          so the abdomen points up and the legs fan around the thread */}
      <group ref={rig} scale={0.8}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <SpiderModel raise={0.55} curl={1.5} />
        </group>
      </group>
    </>
  )
}

// ---------- the manor shell, assembled from the kit ----------
function ManorShell() {
  const backX = [-7.65, 2.55, 7.65]
  const backKind = ['wall_cracked', 'wall', 'wall_broken']
  const floorX = [-7.65, -2.55, 2.55, 7.65]
  const floorZ = [-3.45, 1.65, 6.75]
  return (
    <group>
      {backKind.map((k, i) => (
        <Piece key={k + i} file={k} position={[backX[i], -2.4, -6]} scale={S} tint="#cfc4b2" />
      ))}
      <Piece file="wall_archedwindow_open" position={[-2.55, -2.4, -6]} scale={S} tint="#cfc4b2" />
      {/* sides */}
      <Piece file="wall" position={[-8, -2.4, -3.45]} rotation={[0, Math.PI / 2, 0]} scale={S} tint="#b8ad9c" />
      <Piece file="wall_cracked" position={[-8, -2.4, 1.65]} rotation={[0, Math.PI / 2, 0]} scale={S} tint="#b8ad9c" />
      <Piece file="wall_shelves" position={[8, -2.4, -3.45]} rotation={[0, -Math.PI / 2, 0]} scale={S} tint="#c4b8a4" />
      <Piece file="wall" position={[8, -2.4, 1.65]} rotation={[0, -Math.PI / 2, 0]} scale={S} tint="#c4b8a4" />
      {/* pillars framing the window */}
      <Piece file="pillar" position={[-5.35, -2.4, -5.55]} scale={S} tint="#c9beac" />
      <Piece file="pillar" position={[0.25, -2.4, -5.55]} scale={S} tint="#c9beac" />
      {/* wood floor */}
      {floorX.map((x) =>
        floorZ.map((z) => (
          <Piece key={`${x}:${z}`} file="floor_wood_large_dark" position={[x, -2.4, z]} scale={S} tint="#b5a690" />
        ))
      )}
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.72, 0.4]}>
        <planeGeometry args={[18, 15]} />
        <meshStandardMaterial color="#191510" roughness={1} />
      </mesh>
    </group>
  )
}

// ---------- what the family left behind ----------
function Dressing() {
  return (
    <group>
      {/* collapse tucked in the left corner, clear of the window
          (rubble_large is 8u wide raw — keep it small) */}
      <Piece file="rubble_large" position={[-6.9, FT, -4.9]} scale={0.3} tint="#cfc6b4" />
      <Piece file="rubble_large" position={[-5.7, FT, -3.6]} rotation={[0, 1.2, 0]} scale={0.22} tint="#c2b8a5" />
      <Piece file="column" position={[-5.3, FT + 0.42, -4.3]} rotation={[0, 0.3, 1.32]} scale={0.9} tint="#c9beac" anchor="none" />
      <Piece file="rubble_half" position={[-3.6, FT, -1.4]} scale={0.28} tint="#c2b8a5" />
      <Piece file="rubble_half" position={[0.8, FT, -4.2]} rotation={[0, 2.1, 0]} scale={0.24} tint="#cfc6b4" />
      <Piece file="rubble_half" position={[4.6, FT, 0.7]} rotation={[0, -0.7, 0]} scale={0.2} tint="#c2b8a5" />

      {/* the interrupted meal: broken table, thrown chair, one candle still lit */}
      <Piece file="table_medium_broken" position={[2.4, FT, -2.4]} rotation={[0, -0.35, 0]} scale={1.2} tint="#a8906c" />
      <Piece file="chair" position={[3.7, FT + 0.34, -1.4]} rotation={[-1.5, 0.4, 0.1]} scale={1.15} tint="#a8906c" anchor="none" />
      <Piece file="stool" position={[1.1, FT, -1.05]} rotation={[0, 0.7, 0]} scale={1.1} tint="#9c845f" />
      <Piece file="bottle_A_green" position={[1.75, FT, -1.65]} scale={1.25} tint="#b8c49a" />
      <Piece file="bottle_B_brown" position={[3.1, FT + 0.07, -0.62]} rotation={[0, 0.3, Math.PI / 2]} scale={1.2} tint="#c2a67c" anchor="none" />
      <Piece file="plate_stack" position={[2.95, FT, -3.15]} scale={1.1} tint="#d8d2c0" />
      <Piece file="candle_lit" position={[1.9, FT, -2.0]} scale={1.35} tint="#e8e0cf" />
      <Piece file="candle_melted" position={[0.4, FT, -0.9]} scale={1.2} tint="#a89f8a" />

      {/* stored and abandoned */}
      <Piece file="trunk_large_A" position={[-4.8, FT, -2.9]} rotation={[0, 0.5, 0]} scale={1.2} tint="#a8906c" />
      <Piece file="candle_triple" position={[-4.35, FT + 0.98, -2.7]} scale={1.1} tint="#e8e0cf" anchor="none" />
      <Piece file="box_stacked" position={[6.2, FT, -4.6]} scale={1.2} tint="#b09878" />
      <Piece file="barrel_large" position={[7.0, FT, -3.3]} scale={1.1} tint="#a8906c" />
      <Piece file="keg" position={[5.35, FT, -5.0]} scale={1.0} tint="#9c845f" />
      <Piece file="crates_stacked" position={[-7.0, FT, -0.6]} rotation={[0, -0.4, 0]} scale={1.1} tint="#b09878" />
      <Piece file="chest" position={[-6.85, FT, 1.8]} rotation={[0, 2.35, 0]} scale={1.1} tint="#a8906c" />
      <Piece file="shelf_large" position={[7.85, -0.3, -0.2]} rotation={[0, -Math.PI / 2, 0]} scale={1.2} tint="#a8906c" anchor="none" />
      <Piece file="bottle_A_green" position={[7.8, -0.14, -0.5]} rotation={[0, 0.4, 0]} scale={1.0} tint="#b8c49a" anchor="none" />

      {/* wall dressing */}
      <Piece file="torch_mounted" position={[-6.2, -0.62, -5.7]} scale={1.2} tint="#b8a488" anchor="none" />
      <Piece file="torch_mounted" position={[7.7, -0.62, -1.95]} rotation={[0, -Math.PI / 2, 0]} scale={1.2} tint="#b8a488" anchor="none" />
      <Piece file="sword_shield_broken" position={[3.35, -0.25, -5.72]} scale={1.2} tint="#c4b8a4" anchor="none" />
    </group>
  )
}

// ---------- moonlight + the warm answers to the switch ----------
function Lighting({ lit }) {
  const sun = useRef()
  const winFill = useRef()
  const torchA = useRef()
  const torchB = useRef()
  const candle = useRef()
  const fill = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // the whole room answers the switch smoothly, never a step
    const leaving = 1 - Math.min(1, Math.max(0, (heroState.p - 0.45) / 0.4)) * 0.75
    const ease = (ref, target, k = 0.035) => {
      if (ref.current) ref.current.intensity += (target - ref.current.intensity) * k
    }
    ease(sun, (lit ? 3.5 : 1.05) * leaving)
    ease(winFill, (lit ? 1.2 : 0.4) * leaving)
    const flick = 0.86 + Math.sin(t * 11) * 0.05 + Math.sin(t * 23.7) * 0.06 + (Math.random() > 0.992 ? -0.3 : 0)
    ease(torchA, lit ? 2.9 * flick * leaving : 0, 0.05)
    ease(torchB, lit ? 2.6 * flick * leaving : 0, 0.05)
    ease(fill, lit ? 1.5 * leaving : 0, 0.04)
    const cf = 0.5 + Math.sin(t * 9.3) * 0.08 + Math.sin(t * 21.1) * 0.06
    ease(candle, cf * leaving, 0.2)
  })

  return (
    <group>
      <hemisphereLight args={['#8fa0b8', '#2c2820', lit ? 1.0 : 0.22]} />
      {/* warm interior wash once the lever is thrown */}
      <pointLight ref={fill} position={[1.5, 1.6, 0.5]} color="#ffc584" intensity={0} distance={14} decay={1.8} />
      {/* cold moonlight through the arched window */}
      <directionalLight
        ref={sun}
        position={[-2.55, 1.7, -5.0]}
        target-position={[1.6, -2.4, 2.2]}
        color="#cfdae8"
        intensity={1.05}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight ref={winFill} position={[-2.55, 0.6, -5.0]} color="#c8d4e2" intensity={0.4} distance={9} decay={1.8} />
      {/* torches ignite when the lever throws */}
      <pointLight ref={torchA} position={[-6.2, 0.4, -5.3]} color="#ffab5e" intensity={0} distance={10} decay={1.9} />
      <pointLight ref={torchB} position={[7.3, 0.4, -1.95]} color="#ffab5e" intensity={0} distance={10} decay={1.9} />
      {/* the one candle that never went out */}
      <pointLight ref={candle} position={[1.9, -1.6, -2.0]} color="#ffbe70" intensity={0.5} distance={5} decay={2} />
      {/* the night outside */}
      <mesh position={[-2.55, 0.7, -6.4]}>
        <planeGeometry args={[4.6, 5.2]} />
        <meshBasicMaterial color="#eef3f6" toneMapped={false} />
      </mesh>
      <mesh position={[-3.3, 1.1, -6.35]}>
        <circleGeometry args={[0.62, 24]} />
        <meshBasicMaterial color="#fbfdf8" toneMapped={false} />
      </mesh>
      <mesh position={[-1.6, -0.4, -6.3]} rotation={[0, 0, 0.5]}>
        <planeGeometry args={[2.2, 1.6]} />
        <meshBasicMaterial color="#8fa08c" transparent opacity={0.4} toneMapped={false} />
      </mesh>
      {/* volumetric shaft toward the floor */}
      <mesh position={[-1.6, -0.8, -3.4]} rotation={[0.62, 0.1, 0]}>
        <planeGeometry args={[3.4, 5.6]} />
        <meshBasicMaterial
          color="#dce6ee"
          transparent
          opacity={lit ? 0.055 : 0.035}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ---------- the room ----------
export default function HeroRoom({ lit }) {
  const group = useRef()
  const fadeRef = useRef()
  const { camera } = useThree()

  const webGeo = useMemo(() => buildWeb(-7.6, 2.5, -5.82), [])

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
      <Lighting lit={lit} />
      <ManorShell />
      <Dressing />
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
      <Spider anchor={[-2.0, 2.35, -5.5]} />
      <Critters />

      {/* darkness closes over the receding room at the end of the pull */}
      <mesh ref={fadeRef} position={[0.4, 0.6, 8.2]}>
        <planeGeometry args={[46, 26]} />
        <meshBasicMaterial color="#060504" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
