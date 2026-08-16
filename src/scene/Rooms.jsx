import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import ManorRoom, { cols, FLOOR } from './ManorRoom'
import { Piece, preloadPieces } from './toonify'
import { Flame } from './Flame'
import { ProseBoard, ListBoard, ProjectBoard, RecordBoard, projectAt } from './RoomCopy'
import { Hotspot } from './Hotspot'
import { PROJECTS } from './projects'
import { RECORD } from './record'
import Arcade from './Arcade'
import { journey, roomOffset, roomShift } from './journey'
import { WOOD, WOOD_DARK, STONE, CRATE, WAX, IRON, FLAME_WARM, CANDLE_LIGHT, CANDLE_DIST, TORCH_LIGHT, TORCH_DIST } from './palette'

// ============================================================
// Rooms II–VI. Each is the shared manor shell, its copy inked on a board
// hung centre of the back wall, and dressing arranged so the board is
// never blocked.
//
// Two corridors are kept clear in every room, and dressing goes wherever
// is left:
//   the middle third (x -3..3), because the camera enters facing the board
//   and anything there covers the room's own words;
//   the exit lane — a band about 3 units either side of the doorway,
//   running from mid-room to the back wall — because that is the path the
//   camera walks, and furniture parked in it is furniture the visitor
//   phases straight through.
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

// Two torches flanking the board, so the room's copy is the lit thing in it.
function BoardLights({ lit }) {
  return (
    <>
      <Piece file="torch_mounted" position={[-5.0, -0.5, -5.78]} scale={1.2} tint={IRON} anchor="none" />
      <Flame position={[-5.0, 0.18, -5.5]} lit={lit} delay={0.35} size={0.42} light={TORCH_LIGHT} distance={TORCH_DIST} color={FLAME_WARM} />
      <Piece file="torch_mounted" position={[5.0, -0.5, -5.78]} scale={1.2} tint={IRON} anchor="none" />
      <Flame position={[5.0, 0.18, -5.5]} lit={lit} delay={0.55} size={0.42} light={TORCH_LIGHT} distance={TORCH_DIST} color={FLAME_WARM} />
    </>
  )
}

// ---------------- Room II — Skills ----------------
export function SkillsRoom({ lit }) {
  return (
    <Room index={2} doorCol={0} lit={lit} windowSide="right" windowRow={1}>
      <ListBoard
        numeral="Room II"
        title="Skills &amp; Tools"
        subtitle="what the house was built with"
        groups={[
          { label: 'Programming & Frameworks', items: ['Python · SQL · FastAPI'] },
          { label: 'AI & Agents', items: ['LLM Agents · Model Context Protocol', 'Claude Code · Codex · Playwright'] },
          { label: 'Libraries', items: ['Pandas · NumPy · Matplotlib', 'Seaborn · requests · BeautifulSoup'] },
          { label: 'Cloud, Identity & MLOps', items: ['AWS · Databricks · Docker · Jenkins', 'Microsoft Entra ID · BFF Architecture'] },
          { label: 'Databases', items: ['MySQL · PostgreSQL'] },
        ]}
      />
      <BoardLights lit={lit} />
      {/* shelving to the sides, clear of the board */}
      <Piece file="shelves" position={[-7.9, FLOOR, 4.4]} scale={1.35} tint={WOOD} />
      <Piece file="shelves" position={[7.6, FLOOR, -5.4]} scale={1.35} tint="#a08869" />
      <Piece file="table_small_decorated_A" position={[5.4, FLOOR, -0.8]} rotation={[0, -0.3, 0]} scale={1.3} tint={WOOD} />
      <Piece file="candle_triple" position={[5.4, FLOOR + 1.02, -0.8]} scale={1.15} tint={WAX} anchor="none" />
      <Flame position={[5.4, FLOOR + 1.46, -0.8]} lit={lit} base={0.3} delay={0.8} size={0.26} light={CANDLE_LIGHT} distance={CANDLE_DIST} />
      <Piece file="stool" position={[3.9, FLOOR, 0.9]} rotation={[0, 0.9, 0]} scale={1.15} tint={WOOD_DARK} />
      <Piece file="chair" position={[4.4, FLOOR, -0.4]} rotation={[0, -2.6, 0]} scale={1.2} tint={WOOD} />
      <Piece file="crates_stacked" position={[-7.6, FLOOR, 6.4]} rotation={[0, 0.5, 0]} scale={1.15} tint={CRATE} />
      <Piece file="box_stacked" position={[7.2, FLOOR, 2.2]} rotation={[0, -0.4, 0]} scale={1.1} tint={CRATE} />
      <Piece file="trunk_large_A" position={[6.6, FLOOR, -1.8]} rotation={[0, -0.8, 0]} scale={1.2} tint={WOOD} />
    </Room>
  )
}

// ---------------- Room III — the Game Room ----------------
// This room does not introduce itself. No board, no torches, no window —
// it is dark, and the machine standing in it is the only thing throwing
// light. That glow is the whole invitation: you cross toward the one lit
// object in a black room and press it. A sign reading "The Game Room"
// would be explaining the joke.
export function GameRoom({ lit }) {
  return (
    <Room index={3} doorCol={3} lit={lit} dark>
      <Arcade lit={lit} position={[-1.2, FLOOR, -4.2]} rotation={[0, 0.22, 0]} />
      {/* what the tube reaches: near furniture catches it, the rest stays
          in the dark */}
      <Piece file="stool" position={[-2.6, FLOOR, -1.9]} rotation={[0, 0.4, 0]} scale={1.15} tint={WOOD_DARK} />
      <Piece file="chair" position={[1.4, FLOOR, -1.4]} rotation={[0, 2.9, 0]} scale={1.2} tint={WOOD} />
      <Piece file="table_medium_broken" position={[-6.4, FLOOR, -2.2]} rotation={[0, 0.3, 0]} scale={1.3} tint={WOOD} />
      <Piece file="crates_stacked" position={[7.4, FLOOR, 5.4]} rotation={[0, -0.35, 0]} scale={1.2} tint={CRATE} />
      <Piece file="keg" position={[-7.4, FLOOR, 2.2]} scale={1.05} tint={WOOD_DARK} />
      <Piece file="barrel_large" position={[-7.2, FLOOR, 4.6]} scale={1.15} tint={WOOD} />
    </Room>
  )
}

// ---------------- Room IV — Projects ----------------
// The board shows the project you are standing in front of, and scrolling
// walks you along the wall. journey.t carries room IV's own progress, so
// the index comes from there — but journey.t moves every frame and nothing
// in the scene may re-render per frame, so this watches it in a rAF loop
// and only sets state when the project actually changes.
export function ProjectsRoom({ lit }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    let raf
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const frac = Math.max(0, Math.min(0.999, journey.t - 4))
      const i = projectAt(frac, PROJECTS.length)
      setIdx((prev) => (prev === i ? prev : i))
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <Room index={4} doorCol={0} lit={lit} windowSide="right" windowRow={1}>
      <ProjectBoard
        project={PROJECTS[idx]}
        index={idx}
        total={PROJECTS.length}
        action="View on GitHub"
      />
      {/* rides the drawn control, so the link opens from the board itself */}
      <Hotspot name="project" reach={30} position={[0, -0.58, -5.3]} />
      <BoardLights lit={lit} />
      <Piece file="pillar" position={[-6.4, FLOOR, 4.6]} scale={1.275} tint={STONE} />
      <Piece file="pillar" position={[6.4, FLOOR, -3.6]} scale={1.275} tint={STONE} />
      <Piece file="pillar" position={[-6.4, FLOOR, 2.2]} scale={1.275} tint={STONE} />
      <Piece file="pillar" position={[6.4, FLOOR, 2.2]} scale={1.275} tint={STONE} />
      <Piece file="trunk_large_A" position={[5.2, FLOOR, 0.6]} rotation={[0, -0.6, 0]} scale={1.25} tint={WOOD} />
      <Piece file="plate_stack" position={[5.2, FLOOR + 0.9, 0.6]} scale={1.05} tint="#d8d2c0" anchor="none" />
      <Piece file="chest" position={[4.8, FLOOR, 0.6]} rotation={[0, -1.3, 0]} scale={1.15} tint={WOOD} />
      <Piece file="candle_triple" position={[4.4, FLOOR, -1.8]} scale={1.25} tint={WAX} />
      <Flame position={[4.4, FLOOR + 0.5, -1.8]} lit={lit} delay={0.9} size={0.26} light={CANDLE_LIGHT} distance={CANDLE_DIST} />
      <Piece file="rubble_half" position={[-7.0, FLOOR, 4.4]} rotation={[0, 0.8, 0]} scale={0.26} tint="#c2b8a5" />
    </Room>
  )
}

// ---------------- Room V — Experience ----------------
// The records wall, walked the same way as the gallery: one post at a
// time, ending on the certifications. It used to be a single board listing
// four job titles in three lines each, which is a resume screenshot rather
// than a room.
export function ExperienceRoom({ lit }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    let raf
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const frac = Math.max(0, Math.min(0.999, journey.t - 5))
      const i = projectAt(frac, RECORD.length)
      setIdx((prev) => (prev === i ? prev : i))
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <Room index={5} doorCol={3} lit={lit} windowSide="left" windowRow={1}>
      <RecordBoard entry={RECORD[idx]} index={idx} total={RECORD.length} />
      <BoardLights lit={lit} />
      <Piece file="chest" position={[-6.2, FLOOR, -4.0]} rotation={[0, 0.9, 0]} scale={1.2} tint={WOOD} />
      <Piece file="chest" position={[-6.6, FLOOR, -1.2]} rotation={[0, 1.3, 0]} scale={1.15} tint="#a08869" />
      <Piece file="trunk_large_A" position={[-6.4, FLOOR, -1.8]} rotation={[0, 0.9, 0]} scale={1.2} tint={WOOD} />
      <Piece file="shelf_large" position={[-7.6, -0.35, 3.4]} rotation={[0, Math.PI / 2, 0]} scale={1.3} tint={WOOD} anchor="none" />
      <Piece file="table_small_decorated_A" position={[-4.6, FLOOR, 1.0]} rotation={[0, -0.4, 0]} scale={1.3} tint={WOOD} />
      <Piece file="candle_lit" position={[-4.6, FLOOR + 1.02, 1.0]} scale={1.3} tint={WAX} anchor="none" />
      <Flame position={[-4.6, FLOOR + 1.42, 1.0]} lit={lit} base={0.35} delay={0.8} size={0.28} light={CANDLE_LIGHT} distance={CANDLE_DIST} />
      <Piece file="chair" position={[-3.4, FLOOR, 1.8]} rotation={[0, 2.7, 0]} scale={1.2} tint={WOOD} />
      <Piece file="sword_shield_broken" position={[7.2, FLOOR, 6.2]} rotation={[0, -0.6, 0]} scale={1.15} tint={WAX} />
      <Piece file="crates_stacked" position={[-7.2, FLOOR, 3.4]} rotation={[0, 0.4, 0]} scale={1.1} tint={CRATE} />
    </Room>
  )
}

// ---------------- Room VI — Contact ----------------
export function ContactRoom({ lit }) {
  return (
    <Room index={6} doorCol={1} lit={lit} windowSide="right" windowRow={0}>
      <ProseBoard
        numeral="Room VI"
        title="Contact"
        subtitle="the telephone still works"
        lines={[
          'wparasmotwani@gmail.com',
          '+91 70004 39613',
          'linkedin.com/in/parasmotwani',
          'github.com/parasmotwani',
          '',
          'Open to opportunities and collaborations.',
        ]}
        action="Contact me"
        foot="the house will pass it on"
      />
      {/* rides the drawn control on the board, so the button the visitor
          sees and the thing they click are the same object */}
      <Hotspot name="contact" reach={30} position={[0, -0.66, -5.3]} />
      <BoardLights lit={lit} />
      <Piece file="table_small_decorated_A" position={[-5.2, FLOOR, -1.4]} rotation={[0, 0.4, 0]} scale={1.35} tint={WOOD} />
      <Piece file="candle_triple" position={[-5.2, FLOOR + 1.04, -1.4]} scale={1.25} tint={WAX} anchor="none" />
      <Flame position={[-5.2, FLOOR + 1.5, -1.4]} lit={lit} base={0.4} delay={0.3} size={0.3} light={CANDLE_LIGHT} distance={CANDLE_DIST} />
      <Piece file="chair" position={[-6.4, FLOOR, 0.6]} rotation={[0, 0.7, 0]} scale={1.2} tint={WOOD} />
      <Piece file="chair" position={[5.6, FLOOR, 0.2]} rotation={[0, -0.7, 0]} scale={1.2} tint={WOOD} />
      <Piece file="chest" position={[6.2, FLOOR, -3.6]} rotation={[0, -1.1, 0]} scale={1.15} tint={WOOD} />
      <Piece file="crates_stacked" position={[-7.2, FLOOR, 3.2]} rotation={[0, 0.4, 0]} scale={1.1} tint={CRATE} />
      <Piece file="rubble_large" position={[7.0, FLOOR, 2.6]} rotation={[0, 1.1, 0]} scale={0.3} tint="#cfc6b4" />
    </Room>
  )
}
