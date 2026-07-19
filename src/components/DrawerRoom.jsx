import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Chapter from './Chapter'
import Cobweb from './Cobweb'
import Spider from './Spider'
import { studyState } from '../scene/studyState'
import { usePerformance } from '../context/PerformanceContext'

gsap.registerPlugin(ScrollTrigger)

// Room I — the study. On desktop the WHOLE section is the 3D room
// (src/scene/StudyRoom.jsx) behind this pinned overlay: the bio floats
// over the room, and an invisible hotspot sits on the hutch drawer —
// the easter egg. Pull it and a dusty booklet comes out, pages you can
// turn. Mobile / reduced-motion / low-power fall back to a drawn scene.
const PAGES = [
  {
    kind: 'cover',
    scrawl: 'property of P. Motwani',
    note: 'do not remove from the study',
  },
  {
    heading: 'Who I am',
    body: [
      'AI & Data Science Engineer, Jaipur, IN.',
      'I build intelligent systems — agentic AI workflows, contract intelligence on Databricks, autonomous SAP pipelines on AWS.',
      'Co-founded a gamified ed-tech startup. Won top honors at The Startup Mela 2.0, Jaipur.',
    ],
    stats: '16+ projects · 2 internships · 9+ certifications',
  },
  {
    heading: 'Schooling',
    body: [
      'B.Tech, Computer Science & Engineering — Manipal University Jaipur, Oct 2021 – Jul 2025.',
      'Senior Secondary (12th), 92.75% — Academic World School, Mar 2020 – Jul 2021.',
    ],
    stats: 'the rest of the records are in the other rooms…',
  },
]

// fallback scene for devices that don't get the 3D room
function StudyScene({ onDrawer, open }) {
  return (
    <svg className="study-svg" viewBox="0 0 980 600" data-reveal role="img" aria-label="An abandoned study">
      <defs>
        <radialGradient id="winHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d8d2c0" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#d8d2c0" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#d8d2c0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="dayGlow" cx="50%" cy="42%" r="70%">
          <stop offset="0%" stopColor="#f6f2e4" />
          <stop offset="100%" stopColor="#d2cab4" />
        </radialGradient>
        <radialGradient id="roomVig" cx="50%" cy="44%" r="72%">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="62%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        <clipPath id="floorClip"><polygon points="170,430 810,430 980,600 0,600" /></clipPath>
      </defs>
      <polygon points="0,0 980,0 810,90 170,90" fill="#0a0806" />
      <polygon points="0,0 170,90 170,430 0,600" fill="#0b0906" />
      <polygon points="980,0 810,90 810,430 980,600" fill="#0b0906" />
      <rect x="170" y="90" width="640" height="340" fill="var(--surface)" />
      <polygon points="170,430 810,430 980,600 0,600" fill="#100d08" />
      <ellipse cx="500" cy="108" rx="190" ry="30" fill="#000" opacity="0.22" />
      <ellipse cx="315" cy="232" rx="195" ry="155" fill="url(#winHalo)" />
      <rect x="222" y="128" width="186" height="212" fill="#241d13" />
      <rect x="230" y="135" width="170" height="195" fill="url(#dayGlow)" />
      <g fill="#3a3128">
        <rect x="310" y="135" width="8" height="195" />
        <rect x="230" y="196" width="170" height="7" />
        <rect x="230" y="262" width="170" height="7" />
      </g>
      <g transform="rotate(-2.5 620 190)">
        <rect x="558" y="112" width="124" height="156" fill="var(--surface)" stroke="var(--gold-dim)" strokeWidth="2" />
        <ellipse cx="620" cy="172" rx="22" ry="26" fill="var(--surface-2)" />
        <path d="M584 258 Q620 212 656 258" fill="var(--surface-2)" />
      </g>
      <text x="620" y="296" textAnchor="middle" className="scene-caption">the last resident</text>
      <g clipPath="url(#floorClip)" stroke="#000" strokeOpacity="0.35" strokeWidth="1.2">
        <line x1="330" y1="430" x2="245" y2="600" />
        <line x1="490" y1="430" x2="490" y2="600" />
        <line x1="650" y1="430" x2="735" y2="600" />
      </g>
      <polygon points="55,140 165,185 165,500 55,560" fill="#0d0a06" />
      <polygon points="694,124 946,78 946,552 694,474" fill="#14100a" />
      <polygon points="694,316 946,296 946,308 694,328" fill="#1e170e" />
      <ellipse cx="470" cy="445" rx="110" ry="26" fill="var(--surface-2)" stroke="#3a3128" strokeWidth="1.5" />
      <rect x="462" y="468" width="16" height="58" fill="#17120b" />
      <g
        className={`scene-drawer${open ? ' open' : ''}`}
        onClick={onDrawer}
        data-hover
        role="button"
        aria-label="An old drawer, slightly open"
      >
        <rect x="735" y="340" width="150" height="36" fill="var(--surface)" stroke="var(--gold-dim)" strokeWidth="1.1" />
        <rect className="drawer-glint" x="743" y="334" width="92" height="6" fill="var(--paper)" />
        <circle cx="810" cy="358" r="4.5" fill="var(--gold-dim)" />
      </g>
      <rect x="0" y="0" width="980" height="600" fill="url(#roomVig)" pointerEvents="none" />
    </svg>
  )
}

function Booklet({ open, page, setPage, toggle }) {
  if (!open) return null
  return (
    <div className="booklet-backdrop" onClick={toggle}>
      <div className="booklet" onClick={(e) => e.stopPropagation()}>
        {PAGES.map((pg, i) => (
          <div
            key={i}
            className={`booklet-page${i < page ? ' turned' : ''}${pg.kind === 'cover' ? ' booklet-page--cover' : ''}`}
            style={{ zIndex: i < page ? i : PAGES.length - i }}
          >
            {pg.kind === 'cover' ? (
              <div className="booklet-cover">
                <span className="scrawl">{pg.scrawl}</span>
                <span className="scrawl-note">{pg.note}</span>
              </div>
            ) : (
              <div className="booklet-body">
                <h5 className="scrawl">{pg.heading}</h5>
                {pg.body.map((line, j) => <p key={j}>{line}</p>)}
                <div className="booklet-stats">{pg.stats}</div>
              </div>
            )}
            <span className="booklet-pageno">{i + 1}</span>
          </div>
        ))}
        <div className="booklet-nav">
          <button data-hover disabled={page === 0} onClick={() => setPage((p) => p - 1)}>‹ back</button>
          <button data-hover disabled={page === PAGES.length - 1} onClick={() => setPage((p) => p + 1)}>turn ›</button>
          <button data-hover onClick={toggle}>put it back ✕</button>
        </div>
      </div>
    </div>
  )
}

export default function DrawerRoom() {
  const { lowPower } = usePerformance()
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(0)
  const ref = useRef(null)
  const overlayRef = useRef(null)

  const readSimple = () => (
    lowPower ||
    window.innerWidth < 768 ||
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [simple, setSimple] = useState(readSimple)
  useEffect(() => {
    const update = () => setSimple(readSimple())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [lowPower])

  const toggle = () => {
    setOpen((v) => !v)
    setPage(0)
  }

  // pinned pass through the 3D study — scroll scrubs studyState.p, the
  // overlay copy inks in after the darkness lifts and out before exit
  useEffect(() => {
    if (simple || !ref.current) return
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: '+=170%',
      pin: true,
      scrub: 0.4,
      onToggle: (self) => { studyState.active = self.isActive },
      onUpdate: (self) => {
        const p = self.progress
        studyState.p = p
        if (overlayRef.current) {
          const fin = Math.min(1, Math.max(0, (p - 0.03) / 0.1))
          const fout = Math.min(1, Math.max(0, (p - 0.82) / 0.14))
          const o = fin * (1 - fout)
          overlayRef.current.style.opacity = String(o)
          overlayRef.current.style.transform = `translateY(${(1 - fin) * 30 - fout * 24}px)`
        }
      },
    })
    return () => {
      studyState.active = false
      st.kill()
    }
  }, [simple])

  if (simple) {
    return (
      <Chapter
        id="about"
        numeral="Room I"
        title="About"
        subtitle="A study, long unused. Something in here is worth opening."
        className="room"
      >
        <Cobweb corner="tr" size={170} />
        <Cobweb corner="bl" size={120} />
        <Spider left="78%" delay={7} />
        <div className="about-split">
          <div className="about-side" data-reveal>
            <p className="about-lede">
              I build <span className="gold">intelligent systems</span> — from
              agentic AI workflows to data pipelines at production scale.
            </p>
            <p className="about-body">
              Computer Science graduate from Manipal University Jaipur, focused
              on AI, Data Science, and Generative AI. Contract intelligence on
              Databricks; autonomous SAP workflows on AWS; a co-founded ed-tech
              startup and a win at The Startup Mela 2.0.
            </p>
          </div>
          <StudyScene onDrawer={toggle} open={open} />
        </div>
        <Booklet open={open} page={page} setPage={setPage} toggle={toggle} />
      </Chapter>
    )
  }

  return (
    <section className="study-stage" id="about" ref={ref}>
      <div className="study-overlay" ref={overlayRef}>
        <header className="study-head">
          <span className="chapter-numeral">Room I</span>
          <h2 className="chapter-title">About</h2>
          <p className="chapter-sub">A study, long unused. Something in here is worth opening.</p>
        </header>
        <div className="study-copy">
          <p className="about-lede">
            I build <span className="gold">intelligent systems</span> — from
            agentic AI workflows to data pipelines at production scale.
          </p>
          <p className="about-body">
            Computer Science graduate from Manipal University Jaipur, focused
            on AI, Data Science, and Generative AI. Contract intelligence on
            Databricks; autonomous SAP workflows on AWS; a co-founded ed-tech
            startup and a win at The Startup Mela 2.0.
          </p>
          <p className="study-hint">the hutch drawer is ajar — something pale inside…</p>
        </div>
      </div>
      <button
        className="drawer-hotspot"
        onClick={toggle}
        data-hover
        aria-label="An old drawer, slightly open"
        title="Something is in the drawer"
      />
      <Booklet open={open} page={page} setPage={setPage} toggle={toggle} />
    </section>
  )
}
