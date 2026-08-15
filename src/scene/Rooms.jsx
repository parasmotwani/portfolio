import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import ManorRoom, { cols, FLOOR } from './ManorRoom'
import { Piece, preloadPieces } from './toonify'
import { Flame } from './Flame'
import { journey, roomOffset, roomShift } from './journey'

// ============================================================
// Rooms II–VI. Each is the shared manor shell plus its own dressing, lit
// only by flames and one cold window. The copy stays in the DOM overlay
// above — text baked into a canvas is text nobody can select, search or
// read with a screen reader, and these rooms carry real skill and project
// names.
//
// Dressing is deliberately centre-weighted. These rooms are 20 units wide
// and the camera reads them from the front, so anything pushed against the
// far walls simply falls outside the frame and the room reads as empty
// rather than as left behind.
// ============================================================

preloadPieces([
  'wall', 'wall_cracked', 'wall_broken', 'wall_doorway', 'wall_shelves', 'wall_archedwindow_open',
  'floor_wood_large_dark', 'shelves', 'shelf_large',
  'table_small_decorated_A', 'table_medium_broken', 'chair', 'stool', 'chest',
  'barrel_large', 'crates_stacked', 'box_small', 'box_stacked', 'keg',
  'candle_lit', 'candle_triple', 'candle_melted', 'torch_mounted',
  'rubble_half', 'rubble_large', 'pillar', 'column', 'trunk_large_A',
  'bottle_A_green', 'bottle_B_brown', 'plate_stack', 'sword_shield_broken',
])

const XS = cols(4)
const ZS = [-3.45, 1.65, 6.75]

// A room only renders while the visitor is in or next to it — seven fully
// dressed rooms drawn at once is a slideshow, not a walk.
function Room({ index, children, ...shell }) {
  const group = useRef()
  useFrame(() => {
    if (group.current) group.current.visible = journey.visible[index]
  })
  return (
    <group ref={group} visible={false} position={[roomShift(index), 0, roomOffset(index)]}>
      <ManorRoom xs={XS} zs={ZS} {...shell} />
      {children}
    </group>
  )
}

// A torch beside the way out, so the exit reads before you reach it.
function DoorTorch({ x, lit, delay = 0.4 }) {
  const inward = -Math.sign(x) || 1
  return (
    <>
      <Piece file="torch_mounted" position={[x + inward * 2.4, -0.62, -5.78]} scale={1.2} tint="#b8a488" anchor="none" />
      <Flame position={[x + inward * 2.4, 0.06, -5.5]} lit={lit} delay={delay} size={0.42} light={2.2} distance={12} color="#ffab5e" />
    </>
  )
}

// ---------------- Room II — Skills ----------------
export function SkillsRoom({ lit }) {
  return (
    <Room index={2} doorCol={0} wallKinds={['wall', 'wall_cracked', 'wall', 'wall']} tint="#c0b4a0" lit={lit} windowSide="right" windowRow={1}>
      {/* the working library — shelving stood against the back wall */}
      <Piece file="shelves" position={[-1.4, FLOOR, -5.5]} scale={1.35} tint="#a8906c" />
      <Piece file="shelves" position={[2.4, FLOOR, -5.5]} scale={1.35} tint="#a08869" />
      <Piece file="shelf_large" position={[5.6, -0.35, -5.6]} scale={1.3} tint="#a8906c" anchor="none" />
      <Piece file="bottle_A_green" position={[5.1, -0.16, -5.5]} scale={1.1} tint="#b8c49a" anchor="none" />
      <Piece file="bottle_B_brown" position={[6.1, -0.16, -5.5]} scale={1.1} tint="#c2a67c" anchor="none" />
      {/* the table someone was working at */}
      <Piece file="table_small_decorated_A" position={[0.6, FLOOR, -1.4]} rotation={[0, 0.24, 0]} scale={1.35} tint="#a8906c" />
      <Piece file="candle_triple" position={[0.6, FLOOR + 1.06, -1.4]} scale={1.2} tint="#b8ac92" anchor="none" />
      <Flame position={[0.6, FLOOR + 1.5, -1.4]} lit={lit} base={0.32} delay={0.5} size={0.3} light={2.0} distance={11} />
      <Piece file="stool" position={[2.5, FLOOR, -0.2]} rotation={[0, 0.9, 0]} scale={1.15} tint="#9c845f" />
      <Piece file="chair" position={[-1.3, FLOOR, 0.3]} rotation={[0, 2.6, 0]} scale={1.2} tint="#a8906c" />
      <Piece file="crates_stacked" position={[-6.2, FLOOR, -3.2]} rotation={[0, 0.5, 0]} scale={1.15} tint="#b09878" />
      <Piece file="box_stacked" position={[6.4, FLOOR, 1.6]} rotation={[0, -0.4, 0]} scale={1.1} tint="#b09878" />
      <Piece file="trunk_large_A" position={[-5.4, FLOOR, 2.4]} rotation={[0, 0.8, 0]} scale={1.2} tint="#a8906c" />
      <DoorTorch x={-7.65} lit={lit} />
    </Room>
  )
}

// ---------------- Room III — the Game Room ----------------
// The CRT itself is the DOM easter egg above; this is the room around it.
export function GameRoom({ lit }) {
  return (
    <Room index={3} doorCol={3} wallKinds={['wall_cracked', 'wall', 'wall', 'wall']} tint="#bcb0a0" floorTint="#a89a84" lit={lit} windowSide="left" windowRow={0}>
      {/* the bench the machine stands on, left of centre so the CRT that
          expands over it doesn't bury the room */}
      <Piece file="table_medium_broken" position={[-3.4, FLOOR, -4.4]} rotation={[0, 0.18, 0]} scale={1.35} tint="#a8906c" />
      <Piece file="crates_stacked" position={[3.2, FLOOR, -5.0]} rotation={[0, -0.35, 0]} scale={1.2} tint="#b09878" />
      <Piece file="box_stacked" position={[5.6, FLOOR, -3.4]} rotation={[0, 0.2, 0]} scale={1.1} tint="#b09878" />
      <Piece file="chair" position={[-1.4, FLOOR, -1.6]} rotation={[0, 2.9, 0]} scale={1.2} tint="#a8906c" />
      <Piece file="stool" position={[1.8, FLOOR, -0.6]} rotation={[0, 0.4, 0]} scale={1.15} tint="#9c845f" />
      <Piece file="candle_lit" position={[-3.0, FLOOR + 0.72, -3.8]} scale={1.1} tint="#b8ac92" anchor="none" />
      <Flame position={[-3.0, FLOOR + 1.04, -3.8]} lit={lit} base={0.42} delay={0.3} size={0.28} light={2.0} distance={11} />
      <Piece file="candle_melted" position={[2.6, FLOOR, 1.4]} scale={1.25} tint="#a89f8a" />
      <Piece file="keg" position={[-6.4, FLOOR, 1.2]} scale={1.05} tint="#9c845f" />
      <Piece file="barrel_large" position={[-6.8, FLOOR, 3.8]} scale={1.15} tint="#a8906c" />
      <DoorTorch x={7.65} lit={lit} />
    </Room>
  )
}

// ---------------- Room IV — Projects ----------------
export function ProjectsRoom({ lit }) {
  return (
    <Room index={4} doorCol={0} wallKinds={['wall', 'wall', 'wall_cracked', 'wall']} tint="#c4b8a4" lit={lit} windowSide="right" windowRow={1}>
      {/* a gallery: pillars down the room, the work laid out between them */}
      <Piece file="pillar" position={[-3.9, FLOOR, -4.4]} scale={1.275} tint="#c9beac" />
      <Piece file="pillar" position={[3.9, FLOOR, -4.4]} scale={1.275} tint="#c9beac" />
      <Piece file="pillar" position={[-3.9, FLOOR, 1.6]} scale={1.275} tint="#c9beac" />
      <Piece file="pillar" position={[3.9, FLOOR, 1.6]} scale={1.275} tint="#c9beac" />
      <Piece file="trunk_large_A" position={[0.2, FLOOR, -5.0]} rotation={[0, 0.1, 0]} scale={1.25} tint="#a8906c" />
      <Piece file="plate_stack" position={[0.2, FLOOR + 0.9, -5.0]} scale={1.05} tint="#d8d2c0" anchor="none" />
      <Piece file="chest" position={[-6.0, FLOOR, -2.0]} rotation={[0, 1.3, 0]} scale={1.15} tint="#a8906c" />
      <Piece file="chest" position={[6.0, FLOOR, -2.0]} rotation={[0, -1.3, 0]} scale={1.1} tint="#a08869" />
      <Piece file="candle_triple" position={[-2.2, FLOOR, -2.6]} scale={1.25} tint="#b8ac92" />
      <Flame position={[-2.2, FLOOR + 0.5, -2.6]} lit={lit} delay={0.5} size={0.28} light={1.9} distance={11} />
      <Piece file="candle_lit" position={[2.6, FLOOR, -2.6]} scale={1.35} tint="#b8ac92" />
      <Flame position={[2.6, FLOOR + 0.42, -2.6]} lit={lit} base={0.3} delay={0.75} size={0.28} light={1.8} distance={10} />
      <Piece file="rubble_half" position={[5.4, FLOOR, 4.2]} rotation={[0, 0.8, 0]} scale={0.26} tint="#c2b8a5" />
      <DoorTorch x={-7.65} lit={lit} />
    </Room>
  )
}

// ---------------- Room V — Experience ----------------
export function ExperienceRoom({ lit }) {
  return (
    <Room index={5} doorCol={3} wallKinds={['wall', 'wall_cracked', 'wall', 'wall']} tint="#bfb3a1" lit={lit} windowSide="left" windowRow={1}>
      {/* the record room — the chests are the filing, opened and left */}
      <Piece file="chest" position={[-2.6, FLOOR, -5.2]} rotation={[0, 0.2, 0]} scale={1.2} tint="#a8906c" />
      <Piece file="chest" position={[0.6, FLOOR, -5.3]} rotation={[0, -0.15, 0]} scale={1.15} tint="#a08869" />
      <Piece file="trunk_large_A" position={[3.8, FLOOR, -5.1]} rotation={[0, 0.1, 0]} scale={1.2} tint="#a8906c" />
      <Piece file="shelf_large" position={[-5.8, -0.35, -5.6]} scale={1.3} tint="#a8906c" anchor="none" />
      <Piece file="table_small_decorated_A" position={[0.4, FLOOR, -1.6]} rotation={[0, -0.3, 0]} scale={1.3} tint="#a8906c" />
      <Piece file="candle_lit" position={[0.4, FLOOR + 1.0, -1.6]} scale={1.35} tint="#b8ac92" anchor="none" />
      <Flame position={[0.4, FLOOR + 1.4, -1.6]} lit={lit} base={0.36} delay={0.45} size={0.3} light={2.0} distance={11} />
      <Piece file="chair" position={[-1.7, FLOOR, 0.2]} rotation={[0, 2.7, 0]} scale={1.2} tint="#a8906c" />
      <Piece file="stool" position={[2.4, FLOOR, 0.6]} rotation={[0, 0.5, 0]} scale={1.15} tint="#9c845f" />
      <Piece file="sword_shield_broken" position={[5.8, FLOOR, 2.8]} rotation={[0, -0.6, 0]} scale={1.15} tint="#b8ac92" />
      <Piece file="crates_stacked" position={[-6.2, FLOOR, 2.2]} rotation={[0, 0.4, 0]} scale={1.1} tint="#b09878" />
      <DoorTorch x={7.65} lit={lit} />
    </Room>
  )
}

// ---------------- Room VI — Contact ----------------
// The last room. It keeps a doorway like the rest so the house doesn't end
// in a flat wall, but nobody walks through it.
export function ContactRoom({ lit }) {
  return (
    <Room index={6} doorCol={1} wallKinds={['wall', 'wall_doorway', 'wall', 'wall_broken']} tint="#c4b8a4" lit={lit} windowSide="right" windowRow={0}>
      <Piece file="table_small_decorated_A" position={[0, FLOOR, -2.2]} rotation={[0, 0.12, 0]} scale={1.4} tint="#a8906c" />
      <Piece file="candle_triple" position={[0, FLOOR + 1.08, -2.2]} scale={1.3} tint="#b8ac92" anchor="none" />
      <Flame position={[0, FLOOR + 1.56, -2.2]} lit={lit} base={0.4} delay={0.25} size={0.34} light={2.4} distance={13} />
      <Piece file="chair" position={[-2.3, FLOOR, -0.4]} rotation={[0, 0.7, 0]} scale={1.2} tint="#a8906c" />
      <Piece file="chair" position={[2.3, FLOOR, -0.4]} rotation={[0, -0.7, 0]} scale={1.2} tint="#a8906c" />
      <Piece file="chest" position={[-5.6, FLOOR, -4.4]} rotation={[0, 1.1, 0]} scale={1.15} tint="#a8906c" />
      <Piece file="crates_stacked" position={[6.0, FLOOR, -4.0]} rotation={[0, -0.4, 0]} scale={1.15} tint="#b09878" />
      <Piece file="rubble_large" position={[6.4, FLOOR, 3.2]} rotation={[0, 1.1, 0]} scale={0.3} tint="#cfc6b4" />
      <Piece file="torch_mounted" position={[-9.9, -0.62, -1.95]} rotation={[0, Math.PI / 2, 0]} scale={1.2} tint="#b8a488" anchor="none" />
      <Flame position={[-9.62, 0.06, -1.95]} lit={lit} delay={0.7} size={0.42} light={2.1} distance={12} color="#ffab5e" />
      <Piece file="torch_mounted" position={[9.9, -0.62, -1.95]} rotation={[0, -Math.PI / 2, 0]} scale={1.2} tint="#b8a488" anchor="none" />
      <Flame position={[9.62, 0.06, -1.95]} lit={lit} delay={0.9} size={0.42} light={2.1} distance={12} color="#ffab5e" />
    </Room>
  )
}
