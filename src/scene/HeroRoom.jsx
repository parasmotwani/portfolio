import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { heroState } from './heroState'
import { Piece, preloadPieces } from './toonify'
import { Flame } from './Flame'
import { Inscription, roughText, erode, drawSigil, drawParchment, drawNightScene } from './inscriptions'
import { WebSheets, AnchorStrands, Critters, SpiderModel } from './RoomDressing'

// ============================================================
// The entrance — a ruined manor hall, built from authored kit
// assets (KayKit Dungeon Remastered, CC0) regraded through the
// toon pipeline. Cold moonlight through the arched window, one
// candle already burning, torches that answer the switch.
// Camera sits low and pulls backward out as the visitor scrolls.
// ============================================================

const S = 1.275            // kit walls are 4u; scaled to a 5.1u module
const FT = -2.2            // floor-tile top surface (tiles are 0.19 thick)

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
// A wider hall: the whole BACK wall is left clear for the proclamation,
// the arched window moves to the LEFT wall so moonlight rakes across, and
// two pillars frame the centre. Furniture is pushed to the sides (Dressing).
function ManorShell() {
  const backX = [-7.65, -2.55, 2.55, 7.65]
  const backKind = ['wall_cracked', 'wall', 'wall', 'wall_broken']
  const floorX = [-7.65, -2.55, 2.55, 7.65]
  const floorZ = [-3.45, 1.65, 6.75]
  return (
    <group>
      {/* back wall — solid, centre kept clear for the name parchment */}
      {backKind.map((k, i) => (
        <Piece key={k + i} file={k} position={[backX[i], -2.4, -6]} scale={S} tint="#cfc4b2" />
      ))}
      {/* left wall — the arched window; cold moonlight streams in from here */}
      <Piece file="wall_archedwindow_open" position={[-8, -2.4, -3.45]} rotation={[0, Math.PI / 2, 0]} scale={S} tint="#c4b8a4" />
      <Piece file="wall_cracked" position={[-8, -2.4, 1.65]} rotation={[0, Math.PI / 2, 0]} scale={S} tint="#b8ad9c" />
      {/* right wall — shelves + stone */}
      <Piece file="wall_shelves" position={[8, -2.4, -3.45]} rotation={[0, -Math.PI / 2, 0]} scale={S} tint="#c4b8a4" />
      <Piece file="wall" position={[8, -2.4, 1.65]} rotation={[0, -Math.PI / 2, 0]} scale={S} tint="#c4b8a4" />
      {/* pillars flanking the centre proclamation */}
      <Piece file="pillar" position={[-4.1, -2.4, -5.5]} scale={S} tint="#c9beac" />
      <Piece file="pillar" position={[4.1, -2.4, -5.5]} scale={S} tint="#c9beac" />
      {/* wood floor */}
      {floorX.map((x) =>
        floorZ.map((z) => (
          <Piece key={`${x}:${z}`} file="floor_wood_large_dark" position={[x, -2.4, z]} scale={S} tint="#b5a690" />
        ))
      )}
      {/* plank ceiling — the same boards, hung upside down, with beams */}
      {floorX.map((x) =>
        floorZ.map((z) => (
          <Piece key={`c${x}:${z}`} file="floor_wood_large_dark" position={[x, 2.72, z]} rotation={[Math.PI, 0, 0]} scale={S} tint="#6e6152" anchor="none" />
        ))
      )}
      {[-4.2, -0.8, 2.6].map((z) => (
        <mesh key={z} position={[0, 2.55, z]} castShadow>
          <boxGeometry args={[17, 0.24, 0.34]} />
          <meshStandardMaterial color="#241a10" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- what the family left behind — pushed to the sides ----------
// Everything is cleared out of the centre (|x| < 3.6) so the proclamation
// on the back wall reads uninterrupted. The left holds the storage and the
// collapse; the right holds the interrupted meal.
function Dressing() {
  return (
    <group>
      {/* LEFT — the collapse under the window + stored crates */}
      <Piece file="rubble_large" position={[-7.2, FT, -4.9]} scale={0.3} tint="#cfc6b4" />
      <Piece file="rubble_half" position={[-5.9, FT, -3.9]} rotation={[0, 1.2, 0]} scale={0.24} tint="#c2b8a5" />
      <Piece file="column" position={[-6.2, FT + 0.42, -4.6]} rotation={[0, 0.3, 1.32]} scale={0.9} tint="#c9beac" anchor="none" />
      <Piece file="trunk_large_A" position={[-6.4, FT, -2.6]} rotation={[0, 0.5, 0]} scale={1.2} tint="#a8906c" />
      <Piece file="candle_triple" position={[-6.0, FT + 0.98, -2.4]} scale={1.1} tint="#b8ac92" anchor="none" />
      <Piece file="crates_stacked" position={[-7.1, FT, -0.4]} rotation={[0, -0.4, 0]} scale={1.1} tint="#b09878" />
      <Piece file="chest" position={[-6.9, FT, 2.0]} rotation={[0, 2.35, 0]} scale={1.1} tint="#a8906c" />

      {/* RIGHT — the interrupted meal: broken table, thrown chair, a candle */}
      <Piece file="table_medium_broken" position={[5.4, FT, -2.3]} rotation={[0, -0.35, 0]} scale={1.2} tint="#a8906c" />
      <Piece file="chair" position={[6.6, FT + 0.34, -1.3]} rotation={[-1.5, 0.4, 0.1]} scale={1.15} tint="#a8906c" anchor="none" />
      <Piece file="stool" position={[4.5, FT, -1.1]} rotation={[0, 0.7, 0]} scale={1.1} tint="#9c845f" />
      <Piece file="bottle_A_green" position={[4.9, FT, -1.8]} scale={1.25} tint="#b8c49a" />
      <Piece file="bottle_B_brown" position={[6.1, FT + 0.07, -0.6]} rotation={[0, 0.3, Math.PI / 2]} scale={1.2} tint="#c2a67c" anchor="none" />
      <Piece file="plate_stack" position={[5.7, FT, -3.1]} scale={1.1} tint="#d8d2c0" />
      <Piece file="candle_lit" position={[4.9, FT, -2.15]} scale={1.35} tint="#b8ac92" />
      <Piece file="candle_melted" position={[6.7, FT, -2.7]} scale={1.2} tint="#a89f8a" />
      <Piece file="barrel_large" position={[7.5, FT, -4.2]} scale={1.1} tint="#a8906c" />
      <Piece file="keg" position={[6.0, FT, -4.7]} scale={1.0} tint="#9c845f" />
      <Piece file="box_stacked" position={[7.3, FT, 1.4]} scale={1.0} tint="#b09878" />
      <Piece file="shelf_large" position={[7.85, -0.3, 0.4]} rotation={[0, -Math.PI / 2, 0]} scale={1.2} tint="#a8906c" anchor="none" />
      <Piece file="bottle_A_green" position={[7.8, -0.14, 0.1]} rotation={[0, 0.4, 0]} scale={1.0} tint="#b8c49a" anchor="none" />

      {/* wall dressing — torches on the side walls, well off the centre */}
      <Piece file="torch_mounted" position={[-7.85, -0.62, -3.45]} rotation={[0, Math.PI / 2, 0]} scale={1.2} tint="#b8a488" anchor="none" />
      <Piece file="torch_mounted" position={[7.85, -0.62, -1.95]} rotation={[0, -Math.PI / 2, 0]} scale={1.2} tint="#b8a488" anchor="none" />
    </group>
  )
}

// ---------- moonlight + flames that answer the lantern, one by one ----------
function Lighting({ lit, lantern }) {
  const hemi = useRef()
  const sun = useRef()
  const winFill = useRef()
  const carried = useRef()
  const litState = useRef({ prev: null, at: -100 })

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const ls = litState.current
    if (lit !== ls.prev) { ls.prev = lit; ls.at = t }
    const since = t - ls.at
    const ignite = (delay) => lit
      ? THREE.MathUtils.smoothstep(since - delay, 0, 0.7)
      : Math.max(0, 1 - since / 0.5)
    const leaving = 1 - Math.min(1, Math.max(0, (heroState.p - 0.45) / 0.4)) * 0.75
    const ease = (ref, target, k = 0.05) => {
      if (ref.current) ref.current.intensity += (target - ref.current.intensity) * k
    }
    // the lantern the visitor carries (struck, not yet hung) throws a warm
    // fill so the room reads as LIT the moment they strike it — no one
    // should ever stare at a black screen. Once hung, the flames take over.
    const carriedF = lantern && !lit ? 1 : 0
    // the flames carry the warmth (see <Flame> instances below); the
    // moonlight is cold and constant so lit keeps the essence of dark —
    // candle-pools and long shadows, never a floodlight
    ease(hemi, (0.16 + carriedF * 0.16 + ignite(0.2) * 0.16) * leaving)
    ease(sun, (0.9 + ignite(0) * 0.6) * leaving)
    ease(winFill, (0.34 + ignite(0) * 0.3) * leaving)
    ease(carried, carriedF * 2.6 * leaving, 0.06)
  })

  return (
    <group>
      <hemisphereLight ref={hemi} args={['#8fa0b8', '#2c2820', 0.16]} />
      {/* cold moonlight now streams from the LEFT wall window */}
      <directionalLight
        ref={sun}
        position={[-7.0, 1.7, -3.0]}
        target-position={[1.5, -2.4, -3.0]}
        color="#cfdae8"
        intensity={0.9}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight ref={winFill} position={[-7.2, 0.6, -3.2]} color="#c8d4e2" intensity={0.34} distance={9} decay={1.8} />
      {/* the carried lantern's warm fill, front-centre */}
      <pointLight ref={carried} position={[0, -0.3, 4.6]} color="#ffbe70" intensity={0} distance={18} decay={1.5} />

      {/* the flames that actually burn and cast light, staggered as the
          lantern is hung. The interrupted-meal candle keeps a pilot lit. */}
      {/* two sconces flank the proclamation and light it first */}
      <Flame position={[-4.0, 0.75, -5.42]} lit={lit} delay={0.35} size={0.3} light={1.5} distance={7} />
      <Flame position={[4.0, 0.75, -5.42]} lit={lit} delay={0.5} size={0.3} light={1.5} distance={7} />
      {/* the interrupted-meal candle keeps a pilot flame on the right */}
      <Flame position={[4.9, -1.6, -2.15]} lit={lit} base={0.34} delay={0.8} size={0.3} light={1.6} distance={6.5} />
      <Flame position={[6.7, -1.72, -2.7]} lit={lit} delay={1.1} size={0.24} light={1.0} distance={5} />
      {/* the triple candle on the trunk, left */}
      <Flame position={[-6.0, -0.88, -2.4]} lit={lit} delay={1.3} size={0.3} light={1.3} distance={6} />
      {/* the wall torches, last to catch */}
      <Flame position={[-7.55, 0.42, -3.45]} lit={lit} delay={1.6} size={0.44} light={2.0} distance={10} color="#ffab5e" />
      <Flame position={[7.55, 0.42, -1.95]} lit={lit} delay={1.9} size={0.44} light={1.9} distance={10} color="#ffab5e" />

      {/* the night outside the LEFT window: moon, hills, one dead tree */}
      <Inscription
        position={[-8.5, 0.55, -3.45]}
        rotation={[0, Math.PI / 2, 0]}
        size={[7.8, 6.0]}
        w={1024}
        h={768}
        draw={drawNightScene}
      />
      {/* volumetric shaft from the left window toward the floor */}
      <mesh position={[-5.6, -0.8, -3.2]} rotation={[0.2, 0.9, 0.2]}>
        <planeGeometry args={[3.4, 5.6]} />
        <meshBasicMaterial
          color="#dce6ee"
          transparent
          opacity={lit ? 0.045 : 0.035}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ---------- the iron hook, and the lantern once it's hung ----------
function LanternOnHook({ lit }) {
  const sway = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (sway.current) {
      sway.current.rotation.z = Math.sin(t * 1.1) * 0.055
      sway.current.rotation.x = Math.sin(t * 0.7 + 1) * 0.03
    }
  })

  return (
    <group position={[7.68, 0.55, -3.0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* iron backplate + arm + upturned hook */}
      <mesh position={[0, 0.06, -0.03]}>
        <boxGeometry args={[0.09, 0.42, 0.05]} />
        <meshStandardMaterial color="#26211b" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.22, 0.1]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.3]} />
        <meshStandardMaterial color="#26211b" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.16, 0.24]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.07, 0.016, 6, 12, Math.PI * 1.2]} />
        <meshStandardMaterial color="#2c2620" roughness={0.65} metalness={0.35} />
      </mesh>
      {/* the lantern, swinging gently once hung */}
      {lit && (
        <group ref={sway} position={[0, 0.1, 0.24]}>
          <mesh position={[0, -0.04, 0]}>
            <torusGeometry args={[0.05, 0.012, 6, 12]} />
            <meshStandardMaterial color="#1c1815" roughness={0.6} metalness={0.4} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[0.19, 0.05, 0.19]} />
            <meshStandardMaterial color="#1c1815" roughness={0.7} />
          </mesh>
          {[[-0.08, -0.08], [0.08, -0.08], [-0.08, 0.08], [0.08, 0.08]].map(([x, z], i) => (
            <mesh key={i} position={[x, -0.3, z]}>
              <boxGeometry args={[0.022, 0.32, 0.022]} />
              <meshStandardMaterial color="#1c1815" roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[0, -0.47, 0]}>
            <boxGeometry args={[0.21, 0.05, 0.21]} />
            <meshStandardMaterial color="#1c1815" roughness={0.7} />
          </mesh>
          {/* only the flame glows — the glass carries it */}
          <Flame position={[0, -0.28, 0]} lit={lit} size={0.26} light={2.2} distance={13} decay={1.8} />
        </group>
      )}
    </group>
  )
}

// ---------- the resident's work, written on the house itself ----------
function WallInscriptions() {
  return (
    <group>
      {/* the proclamation — name, title and summary inked large on one
          clear parchment, centred on the back wall. The first thing the
          visitor reads once the room takes the light. */}
      <Inscription
        position={[0, 0.3, -5.42]}
        size={[7.4, 4.0]}
        w={1200}
        h={648}
        draw={(g, w, h) => {
          drawParchment(g, w, h, 3)
          roughText(g, 'PARAS', w / 2, h * 0.21, 140, '#33240f', 0.97)
          roughText(g, 'MOTWANI', w / 2, h * 0.4, 140, '#33240f', 0.97)
          g.strokeStyle = '#7a4a20'
          g.globalAlpha = 0.7
          g.lineWidth = 3.5
          g.beginPath(); g.moveTo(w * 0.2, h * 0.49); g.lineTo(w * 0.8, h * 0.5); g.stroke()
          g.globalAlpha = 1
          roughText(g, 'AI & DATA SCIENCE ENGINEER', w / 2, h * 0.585, 50, '#7a2f22', 0.96)
          const sum = [
            'I build intelligent systems — agentic AI',
            'workflows · contract intelligence · Databricks',
            'autonomous data pipelines · AWS',
          ]
          sum.forEach((line, i) => {
            roughText(g, line, w / 2, h * (0.7 + i * 0.095), 34, '#43301a', 0.9, { font: '"IM Fell English", serif' })
          })
          erode(g, w, h, 200, 5)
        }}
      />
      {/* working notes inked on a smaller sheet, back wall far-left */}
      <Inscription
        position={[-6.55, 0.72, -5.46]}
        rotation={[0, 0, 0.015]}
        size={[2.9, 1.95]}
        w={768}
        h={512}
        draw={(g, w, h) => {
          drawParchment(g, w, h, 11)
          const lines = [
            ['agentic AI workflows', 0],
            ['contract intelligence — Databricks', 1],
            ['autonomous pipelines — AWS', 2],
            ['B.Tech CSE — Manipal Univ. Jaipur', 3.1],
          ]
          lines.forEach(([txt, i]) => {
            roughText(g, txt, 58, 128 + i * 84, 42, '#43301a', 0.92, { align: 'left', rot: -0.006 * (i + 1), font: '"IM Fell English", serif' })
          })
          g.strokeStyle = '#43301a'
          g.globalAlpha = 0.6
          g.lineWidth = 2
          g.beginPath(); g.moveTo(56, 152); g.lineTo(392, 158); g.stroke()
          g.globalAlpha = 1
          erode(g, w, h, 260, 21)
        }}
      />
      {/* the formulas that would have read as spells */}
      <Inscription
        position={[7.48, 0.9, -0.6]}
        rotation={[0, -Math.PI / 2, 0]}
        size={[2.6, 1.5]}
        w={768}
        h={448}
        draw={(g, w, h) => {
          roughText(g, 'softmax(QKᵀ/√dₖ)·V', w / 2, h * 0.3, 56, '#ddd6c4', 0.88)
          roughText(g, 'θ ← θ − η ∇θ J(θ)', w / 2, h * 0.56, 56, '#ddd6c4', 0.82)
          roughText(g, 'P(w | context)', w / 2, h * 0.8, 48, '#ddd6c4', 0.72)
          erode(g, w, h, 320, 33)
        }}
      />
      {/* the summoning circle: a neural network, chalked on the clear
          centre boards in front of the proclamation */}
      <Inscription
        position={[0, -2.185, 1.5]}
        rotation={[-Math.PI / 2, 0, 0.42]}
        size={[4.6, 4.6]}
        w={1024}
        h={1024}
        opacity={0.62}
        draw={drawSigil}
      />
    </group>
  )
}

// ---------- the room (entrance) ----------
export default function HeroRoom({ lit, lantern }) {
  const group = useRef()
  const fadeRef = useRef()
  const { camera } = useThree()

  const webGeo = useMemo(() => buildWeb(-7.6, 2.5, -5.82), [])

  // exit: pull BACKWARD and up — the room recedes and shrinks away
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.25, 8.0),
    new THREE.Vector3(0.2, 0.3, 11.2),
    new THREE.Vector3(0.4, 1.1, 14.4),
    new THREE.Vector3(0.6, 1.9, 17.8),
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
      // establishing rest: sit back and centre on the back wall so the
      // hall reads open and the proclamation is large, centred and legible
      camPos.set(
        heroState.mouse.x * 0.5,
        -0.25 + heroState.mouse.y * 0.26,
        8.0
      )
      camera.position.lerp(camPos, 0.06)
      lookTarget.set(heroState.mouse.x * 1.0, -0.3 + heroState.mouse.y * 0.45, -3.5)
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
      <Lighting lit={lit} lantern={lantern} />
      <LanternOnHook lit={lit} />
      <ManorShell />
      <Dressing />
      <WallInscriptions />
      <WebSheets />
      <AnchorStrands />

      {/* radial web in the dark left corner */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={webGeo} count={webGeo.length / 3} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#d8d2c0" transparent opacity={0.45} />
      </lineSegments>

      {/* the hanging spider silhouettes in the left corner, off the text */}
      <Spider anchor={[-6.9, 2.35, -5.5]} />
      <Critters />

      {/* darkness closes over the receding room at the end of the pull */}
      <mesh ref={fadeRef} position={[0.4, 0.6, 8.2]}>
        <planeGeometry args={[46, 26]} />
        <meshBasicMaterial color="#060504" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
