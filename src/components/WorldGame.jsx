import { useEffect, useRef, useState, useCallback } from 'react'
import Chapter from './Chapter'

// ============================================================
// A retro 2D open world. Walk around, approach a building,
// press E (or tap A) to read that part of the portfolio.
// Pure canvas — no game engine, no assets, everything drawn.
// ============================================================

const TILE = 32
const WORLD_W = 44 // tiles
const WORLD_H = 26

const PALETTE = {
  ground: '#12100b',
  groundDot: '#1a160f',
  path: '#1e1913',
  pathEdge: '#2a231a',
  wall: '#241d12',
  wallLight: '#3a2f1d',
  roof: '#8e2f2f',
  roofDark: '#6e2424',
  door: '#d4a94e',
  sign: '#e8e0cf',
  tree: '#26301c',
  treeDark: '#1b2314',
  trunk: '#3a2c18',
  water: '#152028',
  waterLight: '#1d2c38',
  skin: '#e8c9a0',
  tunic: '#d4a94e',
  legs: '#4a3b22',
  hair: '#2a2118',
}

// Buildings: tile coords. Interact zone = 1 tile ring around the door.
const BUILDINGS = [
  {
    id: 'about', x: 4, y: 3, w: 7, h: 5, label: 'ABOUT',
    title: 'About Me',
    lines: [
      'Paras Motwani — AI & Data Science Engineer.',
      'B.Tech in Computer Science, Manipal University Jaipur (2021–2025).',
      'Focused on AI, Data Science, and Generative AI: agentic workflows,',
      'contract intelligence on Databricks, autonomous SAP pipelines on AWS.',
      'Co-founded a gamified ed-tech startup; won top honors at',
      'The Startup Mela 2.0, Jaipur.',
      '',
      '16+ projects · 2 internships · 9+ certifications',
    ],
  },
  {
    id: 'skills', x: 19, y: 2, w: 7, h: 5, label: 'SKILLS',
    title: 'Skills & Tools',
    lines: [
      'Languages & Frameworks: Python, SQL, Go, FastAPI',
      'Machine Learning: NumPy, Pandas, Scikit-learn, TensorFlow,',
      '  Matplotlib, Seaborn',
      'GenAI & Agents: LLMs, AI Agents, RAG, Amazon Bedrock, Hugging Face',
      'Data Engineering: Databricks, Delta Lake, MySQL, PostgreSQL, ETL',
      'Cloud & DevOps: AWS, Docker, Git, Jenkins, Vercel',
    ],
  },
  {
    id: 'projects', x: 34, y: 3, w: 7, h: 5, label: 'PROJECTS',
    title: 'Projects',
    lines: [
      'Contract Intelligence System — Databricks, LLMs, Delta Lake',
      'Automated SAP Invoice Validation — AWS, Textract, Bedrock, NovaAct',
      'Crypto Matching Engine — 62K+ orders/sec, FastAPI, WebSocket',
      'Agentic AI Tutor — AI agents, LLMs',
      'Hybrid Recommendation System — Scikit-learn, Pandas',
      'SkimLit NLP Paper Classifier — TensorFlow, Deep Learning',
      '',
      'Full gallery with links in Chapter IV below.',
    ],
  },
  {
    id: 'experience', x: 8, y: 16, w: 8, h: 5, label: 'EXPERIENCE',
    title: 'Experience',
    lines: [
      'Data Science Intern — Celebal Technologies (Oct 2025 – Present)',
      '  Databricks contract intelligence: large-scale ingestion,',
      '  metadata processing, search pipelines. AWS OCR proof-of-concept',
      '  for automated SAP invoice validation.',
      '',
      'AI Research Intern — Coding Jr (Feb 2025 – Jun 2025)',
      '  Backend features for 3+ AI copilot workflows; data research',
      '  across 20+ unicorns shaping product roadmap priorities.',
    ],
  },
  {
    id: 'contact', x: 30, y: 16, w: 7, h: 5, label: 'CONTACT',
    title: 'Contact',
    lines: [
      'Email     parasmotwani@gmail.com',
      'LinkedIn  linkedin.com/in/parasmotwani',
      'GitHub    github.com/parasmotwani',
      'Phone     +91 7000 439 613',
      '',
      'Full contact form in Chapter VI below.',
    ],
  },
]

// none of these may sit on the paths (rows y=12/13, columns x=7/22/37 for y 8–18)
const TREES = [
  [2, 9], [3, 13], [14, 4], [16, 8], [13, 14], [28, 5], [30, 9], [41, 9],
  [42, 13], [5, 22], [19, 21], [24, 18], [38, 21], [40, 17], [24, 9],
  [5, 10], [33, 14], [17, 15], [26, 22], [12, 23], [36, 10], [2, 18],
]

const POND = { x: 31, y: 8, w: 4, h: 2 } // clear of spawn (22.5, 12.5), paths, and buildings

function buildSolidMap() {
  const solid = new Set()
  const add = (tx, ty) => solid.add(`${tx},${ty}`)
  for (const b of BUILDINGS) {
    for (let x = b.x; x < b.x + b.w; x++) {
      for (let y = b.y; y < b.y + b.h; y++) add(x, y)
    }
  }
  for (const [x, y] of TREES) add(x, y)
  for (let x = POND.x; x < POND.x + POND.w; x++) {
    for (let y = POND.y; y < POND.y + POND.h; y++) add(x, y)
  }
  return solid
}

// deterministic speckle for ground texture
function speckle(tx, ty) {
  const n = Math.sin(tx * 127.1 + ty * 311.7) * 43758.5453
  return n - Math.floor(n)
}

export default function WorldGame() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [panel, setPanel] = useState(null) // building object or null
  const [prompt, setPrompt] = useState(null) // label of nearby building
  const stateRef = useRef({
    x: 22.5 * TILE, y: 12.5 * TILE, // player px position (center)
    dir: 'down', frame: 0, moving: false,
    keys: {},
  })
  const solidRef = useRef(buildSolidMap())
  const rafRef = useRef(null)
  const panelRef = useRef(null)
  panelRef.current = panel

  const nearBuilding = useCallback(() => {
    const s = stateRef.current
    const ptx = s.x / TILE, pty = s.y / TILE
    for (const b of BUILDINGS) {
      // door is bottom-center of the building
      const dx = b.x + b.w / 2, dy = b.y + b.h
      if (Math.abs(ptx - dx) < 1.6 && Math.abs(pty - dy) < 1.6) return b
    }
    return null
  }, [])

  // ---------- drawing ----------
  const draw = useCallback((ctx, w, h, t) => {
    const s = stateRef.current
    const camX = Math.max(0, Math.min(WORLD_W * TILE - w, s.x - w / 2))
    const camY = Math.max(0, Math.min(WORLD_H * TILE - h, s.y - h / 2))

    ctx.fillStyle = PALETTE.ground
    ctx.fillRect(0, 0, w, h)

    const tx0 = Math.floor(camX / TILE), ty0 = Math.floor(camY / TILE)
    const tx1 = Math.min(WORLD_W, tx0 + Math.ceil(w / TILE) + 1)
    const ty1 = Math.min(WORLD_H, ty0 + Math.ceil(h / TILE) + 1)

    // ground speckle + paths (a cross of paths connecting buildings)
    for (let tx = tx0; tx < tx1; tx++) {
      for (let ty = ty0; ty < ty1; ty++) {
        const px = tx * TILE - camX, py = ty * TILE - camY
        const onPathH = ty === 12 || ty === 13
        const onPathV = (tx === 7 || tx === 22 || tx === 37) && ty > 7 && ty < 19
        if (onPathH || onPathV) {
          ctx.fillStyle = PALETTE.path
          ctx.fillRect(px, py, TILE, TILE)
          if (speckle(tx, ty) > 0.8) {
            ctx.fillStyle = PALETTE.pathEdge
            ctx.fillRect(px + 8, py + 12, 4, 3)
          }
        } else if (speckle(tx, ty) > 0.86) {
          ctx.fillStyle = PALETTE.groundDot
          ctx.fillRect(px + (speckle(ty, tx) * 24) | 0, py + (speckle(tx + 7, ty) * 24) | 0, 3, 3)
        }
      }
    }

    // pond
    {
      const px = POND.x * TILE - camX, py = POND.y * TILE - camY
      ctx.fillStyle = PALETTE.water
      ctx.fillRect(px, py, POND.w * TILE, POND.h * TILE)
      ctx.fillStyle = PALETTE.waterLight
      for (let i = 0; i < 5; i++) {
        const wx = px + 14 + ((i * 37 + t * 14) % (POND.w * TILE - 28))
        ctx.fillRect(wx, py + 12 + (i % 3) * 24, 12, 2)
      }
      ctx.strokeStyle = PALETTE.pathEdge
      ctx.strokeRect(px + 0.5, py + 0.5, POND.w * TILE - 1, POND.h * TILE - 1)
    }

    // buildings
    for (const b of BUILDINGS) {
      const px = b.x * TILE - camX, py = b.y * TILE - camY
      const bw = b.w * TILE, bh = b.h * TILE
      // walls
      ctx.fillStyle = PALETTE.wall
      ctx.fillRect(px, py + bh * 0.32, bw, bh * 0.68)
      // roof
      ctx.fillStyle = PALETTE.roofDark
      ctx.beginPath()
      ctx.moveTo(px - 6, py + bh * 0.36)
      ctx.lineTo(px + bw / 2, py - 10)
      ctx.lineTo(px + bw + 6, py + bh * 0.36)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = PALETTE.roof
      ctx.beginPath()
      ctx.moveTo(px + 2, py + bh * 0.32)
      ctx.lineTo(px + bw / 2, py - 4)
      ctx.lineTo(px + bw - 2, py + bh * 0.32)
      ctx.closePath()
      ctx.fill()
      // windows
      ctx.fillStyle = PALETTE.wallLight
      ctx.fillRect(px + bw * 0.18, py + bh * 0.5, 14, 14)
      ctx.fillRect(px + bw * 0.72, py + bh * 0.5, 14, 14)
      ctx.fillStyle = 'rgba(212, 169, 78, 0.5)'
      ctx.fillRect(px + bw * 0.18 + 3, py + bh * 0.5 + 3, 8, 8)
      ctx.fillRect(px + bw * 0.72 + 3, py + bh * 0.5 + 3, 8, 8)
      // door (bottom center)
      const doorW = 20, doorH = 26
      ctx.fillStyle = PALETTE.door
      ctx.fillRect(px + bw / 2 - doorW / 2, py + bh - doorH, doorW, doorH)
      ctx.fillStyle = PALETTE.wall
      ctx.fillRect(px + bw / 2 - doorW / 2 + 3, py + bh - doorH + 3, doorW - 6, doorH - 3)
      // label plaque
      ctx.font = '700 11px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = PALETTE.sign
      ctx.fillText(b.label, px + bw / 2, py + bh * 0.44)
    }

    // trees (drawn after ground, before player if above; simple painter's order by y)
    const drawTree = (txx, tyy) => {
      const px = txx * TILE - camX + TILE / 2, py = tyy * TILE - camY + TILE / 2
      ctx.fillStyle = PALETTE.trunk
      ctx.fillRect(px - 3, py + 4, 6, 10)
      ctx.fillStyle = PALETTE.treeDark
      ctx.beginPath(); ctx.arc(px, py - 2, 13, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = PALETTE.tree
      ctx.beginPath(); ctx.arc(px - 3, py - 6, 10, 0, Math.PI * 2); ctx.fill()
    }
    for (const [txx, tyy] of TREES) {
      if ((tyy + 1) * TILE < s.y) drawTree(txx, tyy)
    }

    // player sprite (pixel knight)
    {
      const px = s.x - camX, py = s.y - camY
      const bob = s.moving ? Math.sin(t * 12) * 1.5 : 0
      const step = s.moving ? (Math.sin(t * 12) > 0 ? 3 : -3) : 0
      // legs
      ctx.fillStyle = PALETTE.legs
      ctx.fillRect(px - 6, py + 4 + bob, 5, 10 - step * 0.4)
      ctx.fillRect(px + 1, py + 4 + bob, 5, 10 + step * 0.4)
      // tunic
      ctx.fillStyle = PALETTE.tunic
      ctx.fillRect(px - 8, py - 8 + bob, 16, 14)
      // arms
      ctx.fillStyle = PALETTE.skin
      ctx.fillRect(px - 11, py - 6 + bob, 3, 9)
      ctx.fillRect(px + 8, py - 6 + bob, 3, 9)
      // head
      ctx.fillRect(px - 6, py - 20 + bob, 12, 12)
      ctx.fillStyle = PALETTE.hair
      ctx.fillRect(px - 6, py - 22 + bob, 12, 5)
      // eyes by direction
      ctx.fillStyle = PALETTE.hair
      if (s.dir === 'down') {
        ctx.fillRect(px - 4, py - 14 + bob, 2, 2)
        ctx.fillRect(px + 2, py - 14 + bob, 2, 2)
      } else if (s.dir === 'left') {
        ctx.fillRect(px - 5, py - 14 + bob, 2, 2)
      } else if (s.dir === 'right') {
        ctx.fillRect(px + 3, py - 14 + bob, 2, 2)
      }
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.beginPath()
      ctx.ellipse(px, py + 15, 10, 3.5, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    // trees in front of player
    for (const [txx, tyy] of TREES) {
      if ((tyy + 1) * TILE >= s.y) drawTree(txx, tyy)
    }

    // world border fade
    ctx.strokeStyle = 'rgba(212, 169, 78, 0.25)'
    ctx.strokeRect(0.5 - camX, 0.5 - camY, WORLD_W * TILE - 1, WORLD_H * TILE - 1)

    // scanlines for retro feel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.09)'
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1)
  }, [])

  // ---------- game loop ----------
  useEffect(() => {
    if (!playing) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let last = performance.now()
    let alive = true

    const fit = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    fit()
    window.addEventListener('resize', fit)

    const SPEED = 150 // px/s

    const loop = (now) => {
      if (!alive) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const s = stateRef.current

      if (!panelRef.current) {
        let vx = 0, vy = 0
        if (s.keys.left) { vx -= 1; s.dir = 'left' }
        if (s.keys.right) { vx += 1; s.dir = 'right' }
        if (s.keys.up) { vy -= 1; s.dir = 'up' }
        if (s.keys.down) { vy += 1; s.dir = 'down' }
        s.moving = vx !== 0 || vy !== 0
        if (s.moving) {
          const norm = Math.hypot(vx, vy)
          const nx = s.x + (vx / norm) * SPEED * dt
          const ny = s.y + (vy / norm) * SPEED * dt
          const solid = solidRef.current
          const canStand = (x, y) => {
            const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE)
            if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) return false
            return !solid.has(`${tx},${ty}`)
          }
          // check feet corners, axis-separated so you slide along walls
          if (canStand(nx - 8, s.y + 12) && canStand(nx + 8, s.y + 12)) s.x = nx
          if (canStand(s.x - 8, ny + 12) && canStand(s.x + 8, ny + 12)) s.y = ny
        }
        const near = nearBuilding()
        setPrompt(near ? near.label : null)
      }

      draw(ctx, canvas.width, canvas.height, now / 1000)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    const KEYMAP = {
      ArrowLeft: 'left', a: 'left', A: 'left',
      ArrowRight: 'right', d: 'right', D: 'right',
      ArrowUp: 'up', w: 'up', W: 'up',
      ArrowDown: 'down', s: 'down', S: 'down',
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (panelRef.current) setPanel(null) // close panel first; second Esc exits
        else setPlaying(false)
        return
      }
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        e.preventDefault()
        if (panelRef.current) setPanel(null)
        else {
          const near = nearBuilding()
          if (near) setPanel(near)
        }
        return
      }
      const k = KEYMAP[e.key]
      if (k) {
        e.preventDefault() // stop arrows/space scrolling the page
        stateRef.current.keys[k] = true
      }
    }
    const onKeyUp = (e) => {
      const k = KEYMAP[e.key]
      if (k) stateRef.current.keys[k] = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      alive = false
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', fit)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      stateRef.current.keys = {}
    }
  }, [playing, draw, nearBuilding])

  // draw one static frame behind the "enter" overlay
  useEffect(() => {
    if (playing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    draw(canvas.getContext('2d'), canvas.width, canvas.height, 0)
  }, [playing, draw])

  // mobile d-pad handlers
  const pad = (k, down) => (e) => {
    e.preventDefault()
    stateRef.current.keys[k] = down
  }
  const padInteract = (e) => {
    e.preventDefault()
    if (panelRef.current) setPanel(null)
    else {
      const near = nearBuilding()
      if (near) setPanel(near)
    }
  }

  return (
    <Chapter
      id="world"
      numeral="Chapter III"
      title="The World"
      subtitle="A little open world — walk around and explore the portfolio"
      pin={false}
    >
      <div className="world-wrap" data-reveal ref={wrapRef}>
        <canvas className="world-canvas" ref={canvasRef} />

        {!playing && (
          <button className="world-enter" data-hover onClick={() => setPlaying(true)}>
            <span className="world-enter-title">▶ Enter the World</span>
            <span className="world-enter-sub">WASD / arrows to move · E to interact · Esc to leave</span>
          </button>
        )}

        {playing && prompt && !panel && (
          <div className="world-prompt">Press <b>E</b> — {prompt}</div>
        )}

        {playing && panel && (
          <div className="world-panel">
            <div className="world-panel-head">
              <h4>{panel.title}</h4>
              <button data-hover onClick={() => setPanel(null)}>✕</button>
            </div>
            <pre>{panel.lines.join('\n')}</pre>
            <div className="world-panel-foot">E / Esc to close</div>
          </div>
        )}

        {playing && (
          <div className="world-hud">
            <span>WASD / ← ↑ ↓ → move · E interact</span>
            <button data-hover onClick={() => { setPanel(null); setPlaying(false) }}>Exit ✕</button>
          </div>
        )}

        {playing && (
          <div className="world-dpad" aria-hidden="true">
            <button onTouchStart={pad('up', true)} onTouchEnd={pad('up', false)} className="du">▲</button>
            <button onTouchStart={pad('left', true)} onTouchEnd={pad('left', false)} className="dl">◀</button>
            <button onTouchStart={pad('right', true)} onTouchEnd={pad('right', false)} className="dr">▶</button>
            <button onTouchStart={pad('down', true)} onTouchEnd={pad('down', false)} className="dd">▼</button>
            <button onTouchStart={padInteract} className="da">E</button>
          </div>
        )}
      </div>
    </Chapter>
  )
}
