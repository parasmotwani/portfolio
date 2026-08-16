import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import ManorRoom, { cols, FLOOR } from './ManorRoom'
import { Piece, preloadPieces } from './toonify'
import { Flame } from './Flame'
import { ProseBoard, ListBoard } from './RoomCopy'
import Arcade from './Arcade'
import { journey, roomOffset, roomShift } from './journey'
import { WOOD, WOOD_DARK, STONE, CRATE, WAX, IRON, FLAME_WARM } from './palette'

// ============================================================
// Rooms II–VI. Each is the shared manor shell, its copy inked on a board
// hung centre of the back wall, and dressing arranged so the board is
// never blocked.
//
// Dressing stays out of the middle third: the camera enters facing the
// board, and anything standing at x -3..3 in front of it covers the room's
// own words.
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
      <Flame position={[-5.0, 0.18, -5.5]} lit={lit} delay={0.35} size={0.42} light={2.4} distance={13} color={FLAME_WARM} />
      <Piece file="torch_mounted" position={[5.0, -0.5, -5.78]} scale={1.2} tint={IRON} anchor="none" />
      <Flame position={[5.0, 0.18, -5.5]} lit={lit} delay={0.55} size={0.42} light={2.4} distance={13} color={FLAME_WARM} />
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
          { label: 'Languages & Frameworks', items: ['Python · SQL · Go · FastAPI'] },
          { label: 'Machine Learning', items: ['NumPy · Pandas · Scikit-learn', 'TensorFlow · Matplotlib · Seaborn'] },
          { label: 'GenAI & Agents', items: ['LLMs · AI Agents · RAG', 'Amazon Bedrock · Hugging Face'] },
          { label: 'Data Engineering', items: ['Databricks · Delta Lake', 'MySQL · PostgreSQL · ETL Pipelines'] },
          { label: 'Cloud & DevOps', items: ['AWS · Docker · Git', 'Jenkins · Vercel'] },
        ]}
      />
      <BoardLights lit={lit} />
      {/* shelving to the sides, clear of the board */}
      <Piece file="shelves" position={[-7.6, FLOOR, -5.4]} scale={1.35} tint={WOOD} />
      <Piece file="shelves" position={[7.6, FLOOR, -5.4]} scale={1.35} tint="#a08869" />
      <Piece file="table_small_decorated_A" position={[-5.4, FLOOR, -0.6]} rotation={[0, 0.3, 0]} scale={1.3} tint={WOOD} />
      <Piece file="candle_triple" position={[-5.4, FLOOR + 1.02, -0.6]} scale={1.15} tint={WAX} anchor="none" />
      <Flame position={[-5.4, FLOOR + 1.46, -0.6]} lit={lit} base={0.3} delay={0.8} size={0.26} light={1.7} distance={9} />
      <Piece file="stool" position={[-3.9, FLOOR, 0.8]} rotation={[0, 0.9, 0]} scale={1.15} tint={WOOD_DARK} />
      <Piece file="chair" position={[4.4, FLOOR, -0.4]} rotation={[0, -2.6, 0]} scale={1.2} tint={WOOD} />
      <Piece file="crates_stacked" position={[-7.4, FLOOR, 3.0]} rotation={[0, 0.5, 0]} scale={1.15} tint={CRATE} />
      <Piece file="box_stacked" position={[7.2, FLOOR, 2.2]} rotation={[0, -0.4, 0]} scale={1.1} tint={CRATE} />
      <Piece file="trunk_large_A" position={[6.6, FLOOR, -1.8]} rotation={[0, -0.8, 0]} scale={1.2} tint={WOOD} />
    </Room>
  )
}

// ---------------- Room III — the Game Room ----------------
export function GameRoom({ lit }) {
  return (
    <Room index={3} doorCol={3} lit={lit} windowSide="left" windowRow={0}>
      <ProseBoard
        numeral="Room III"
        title="The Game Room"
        subtitle="an old machine still hums in the corner"
        lines={[
          'It still takes players.',
          'Everything in this house is somewhere',
          'inside it — walk in and find out.',
        ]}
        foot="insert coin"
      />
      <BoardLights lit={lit} />
      {/* the machine itself, standing where you can see it from the door */}
      <Arcade lit={lit} position={[-4.4, FLOOR, -3.2]} rotation={[0, 0.5, 0]} />
      <Piece file="stool" position={[-4.6, FLOOR, -1.5]} rotation={[0, 0.4, 0]} scale={1.15} tint={WOOD_DARK} />
      <Piece file="table_medium_broken" position={[5.6, FLOOR, -3.4]} rotation={[0, -0.3, 0]} scale={1.3} tint={WOOD} />
      <Piece file="candle_lit" position={[5.6, FLOOR + 0.72, -3.4]} scale={1.1} tint={WAX} anchor="none" />
      <Flame position={[5.6, FLOOR + 1.04, -3.4]} lit={lit} base={0.4} delay={0.9} size={0.26} light={1.6} distance={9} />
      <Piece file="crates_stacked" position={[7.2, FLOOR, -0.6]} rotation={[0, -0.35, 0]} scale={1.2} tint={CRATE} />
      <Piece file="keg" position={[-7.2, FLOOR, 1.4]} scale={1.05} tint={WOOD_DARK} />
      <Piece file="barrel_large" position={[-7.0, FLOOR, 3.8]} scale={1.15} tint={WOOD} />
      <Piece file="chair" position={[4.2, FLOOR, 1.2]} rotation={[0, 2.9, 0]} scale={1.2} tint={WOOD} />
    </Room>
  )
}

// ---------------- Room IV — Projects ----------------
export function ProjectsRoom({ lit }) {
  return (
    <Room index={4} doorCol={0} lit={lit} windowSide="right" windowRow={1}>
      <ListBoard
        numeral="Room IV"
        title="Projects"
        subtitle="a gallery nobody dusted"
        groups={[
          { label: 'Contract Intelligence System', items: ['Python · Databricks · LLMs · Delta Lake'] },
          { label: 'Automated SAP Invoice Validation', items: ['Python · AWS · Textract · Bedrock'] },
          { label: 'Crypto Matching Engine', items: ['Python · FastAPI · WebSocket · PyTest'] },
          { label: 'Agentic AI Tutor', items: ['Python · AI Agents · LLMs'] },
          { label: 'Hybrid Recommendation System', items: ['Python · Scikit-learn · Pandas'] },
          { label: 'SkimLit — NLP Paper Classifier', items: ['Python · TensorFlow · NLP'] },
        ]}
        foot="the frames below carry the links"
      />
      <BoardLights lit={lit} />
      <Piece file="pillar" position={[-6.4, FLOOR, -3.6]} scale={1.275} tint={STONE} />
      <Piece file="pillar" position={[6.4, FLOOR, -3.6]} scale={1.275} tint={STONE} />
      <Piece file="pillar" position={[-6.4, FLOOR, 2.2]} scale={1.275} tint={STONE} />
      <Piece file="pillar" position={[6.4, FLOOR, 2.2]} scale={1.275} tint={STONE} />
      <Piece file="trunk_large_A" position={[-4.6, FLOOR, 0.4]} rotation={[0, 0.6, 0]} scale={1.25} tint={WOOD} />
      <Piece file="plate_stack" position={[-4.6, FLOOR + 0.9, 0.4]} scale={1.05} tint="#d8d2c0" anchor="none" />
      <Piece file="chest" position={[4.8, FLOOR, 0.6]} rotation={[0, -1.3, 0]} scale={1.15} tint={WOOD} />
      <Piece file="candle_triple" position={[4.4, FLOOR, -1.8]} scale={1.25} tint={WAX} />
      <Flame position={[4.4, FLOOR + 0.5, -1.8]} lit={lit} delay={0.9} size={0.26} light={1.6} distance={9} />
      <Piece file="rubble_half" position={[-7.0, FLOOR, 4.4]} rotation={[0, 0.8, 0]} scale={0.26} tint="#c2b8a5" />
    </Room>
  )
}

// ---------------- Room V — Experience ----------------
export function ExperienceRoom({ lit }) {
  return (
    <Room index={5} doorCol={3} lit={lit} windowSide="left" windowRow={1}>
      <ProseBoard
        numeral="Room V"
        title="Experience"
        subtitle="the records room — everything filed"
        lines={[
          'Data Science Intern — Celebal Technologies',
          'Oct 2025 – Present · Databricks contract',
          'intelligence, SAP invoice validation on AWS.',
          '',
          'AI Research Intern — Coding Jr',
          'Feb 2025 – Jun 2025 · backend for 3+ AI',
          'copilot workflows, research across 20+ unicorns.',
        ]}
        foot="9+ certifications — NPTEL, Cisco, IBM, Red Hat, Oracle"
      />
      <BoardLights lit={lit} />
      <Piece file="chest" position={[-6.2, FLOOR, -4.0]} rotation={[0, 0.9, 0]} scale={1.2} tint={WOOD} />
      <Piece file="chest" position={[-6.6, FLOOR, -1.2]} rotation={[0, 1.3, 0]} scale={1.15} tint="#a08869" />
      <Piece file="trunk_large_A" position={[6.4, FLOOR, -3.4]} rotation={[0, -0.9, 0]} scale={1.2} tint={WOOD} />
      <Piece file="shelf_large" position={[7.4, -0.35, -0.6]} rotation={[0, -Math.PI / 2, 0]} scale={1.3} tint={WOOD} anchor="none" />
      <Piece file="table_small_decorated_A" position={[-4.6, FLOOR, 1.0]} rotation={[0, -0.4, 0]} scale={1.3} tint={WOOD} />
      <Piece file="candle_lit" position={[-4.6, FLOOR + 1.02, 1.0]} scale={1.3} tint={WAX} anchor="none" />
      <Flame position={[-4.6, FLOOR + 1.42, 1.0]} lit={lit} base={0.35} delay={0.8} size={0.28} light={1.8} distance={10} />
      <Piece file="chair" position={[4.6, FLOOR, 1.6]} rotation={[0, 2.7, 0]} scale={1.2} tint={WOOD} />
      <Piece file="sword_shield_broken" position={[6.8, FLOOR, 3.6]} rotation={[0, -0.6, 0]} scale={1.15} tint={WAX} />
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
          'parasmotwani@gmail.com',
          'linkedin.com/in/parasmotwani',
          'github.com/parasmotwani',
          '',
          'Open to opportunities and collaborations.',
        ]}
        foot="leave word below — the house will pass it on"
      />
      <BoardLights lit={lit} />
      <Piece file="table_small_decorated_A" position={[-5.2, FLOOR, -1.4]} rotation={[0, 0.4, 0]} scale={1.35} tint={WOOD} />
      <Piece file="candle_triple" position={[-5.2, FLOOR + 1.04, -1.4]} scale={1.25} tint={WAX} anchor="none" />
      <Flame position={[-5.2, FLOOR + 1.5, -1.4]} lit={lit} base={0.4} delay={0.3} size={0.3} light={2.0} distance={11} />
      <Piece file="chair" position={[-6.4, FLOOR, 0.6]} rotation={[0, 0.7, 0]} scale={1.2} tint={WOOD} />
      <Piece file="chair" position={[5.6, FLOOR, 0.2]} rotation={[0, -0.7, 0]} scale={1.2} tint={WOOD} />
      <Piece file="chest" position={[6.2, FLOOR, -3.6]} rotation={[0, -1.1, 0]} scale={1.15} tint={WOOD} />
      <Piece file="crates_stacked" position={[-7.2, FLOOR, 3.2]} rotation={[0, 0.4, 0]} scale={1.1} tint={CRATE} />
      <Piece file="rubble_large" position={[7.0, FLOOR, 2.6]} rotation={[0, 1.1, 0]} scale={0.3} tint="#cfc6b4" />
    </Room>
  )
}
