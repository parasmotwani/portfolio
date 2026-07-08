import { useState } from 'react'
import Chapter from './Chapter'
import Cobweb from './Cobweb'
import Spider from './Spider'

// Room I — the study. The visible content is the bio. The desk in the
// scene has a drawer left slightly ajar — an easter egg. Pull it and a
// dusty booklet comes out, pages you can turn.
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

function StudyScene({ onDrawer, open }) {
  return (
    <svg className="study-svg" viewBox="0 0 980 400" data-reveal aria-hidden="false">
      {/* floor line */}
      <line x1="20" y1="360" x2="960" y2="360" stroke="var(--gold-ghost)" strokeWidth="1.5" />

      {/* bookshelf, left */}
      <g stroke="var(--gold-dim)" strokeWidth="1.2" fill="var(--surface)">
        <rect x="60" y="90" width="180" height="270" />
        <line x1="60" y1="158" x2="240" y2="158" />
        <line x1="60" y1="226" x2="240" y2="226" />
        <line x1="60" y1="294" x2="240" y2="294" />
      </g>
      {/* books — a few leaning */}
      <g fill="var(--surface-2)" stroke="var(--gold-dim)" strokeWidth="0.8">
        <rect x="72" y="112" width="13" height="46" />
        <rect x="88" y="118" width="11" height="40" />
        <rect x="103" y="108" width="14" height="50" />
        <rect x="122" y="120" width="10" height="38" transform="rotate(8 127 158)" />
        <rect x="150" y="180" width="12" height="46" />
        <rect x="166" y="186" width="10" height="40" />
        <rect x="70" y="250" width="14" height="44" />
        <rect x="90" y="256" width="10" height="38" transform="rotate(-7 95 294)" />
      </g>

      {/* crooked portrait, center wall */}
      <g transform="rotate(-3 490 150)">
        <rect x="420" y="80" width="140" height="170" fill="var(--surface)" stroke="var(--gold-dim)" strokeWidth="2" />
        <rect x="432" y="92" width="116" height="146" fill="none" stroke="var(--gold-ghost)" strokeWidth="1" />
        {/* faceless silhouette */}
        <ellipse cx="490" cy="150" rx="26" ry="30" fill="var(--surface-2)" />
        <path d="M450 238 Q490 185 530 238" fill="var(--surface-2)" />
      </g>
      <text x="490" y="272" textAnchor="middle" className="scene-caption">the last resident</text>

      {/* desk, right — with the ajar drawer (the easter egg) */}
      <g stroke="var(--gold-dim)" strokeWidth="1.2" fill="var(--surface)">
        <rect x="660" y="240" width="260" height="18" />
        <rect x="676" y="258" width="228" height="86" fill="var(--surface-2)" />
        <rect x="684" y="344" width="14" height="16" />
        <rect x="882" y="344" width="14" height="16" />
      </g>
      {/* candle on desk */}
      <g>
        <rect x="700" y="216" width="9" height="24" fill="var(--paper)" stroke="var(--gold-dim)" strokeWidth="0.8" />
        <ellipse className="candle-flame" cx="704.5" cy="209" rx="3.5" ry="7" fill="var(--gold)" />
      </g>
      {/* the drawer — slightly ajar, paper corner glinting */}
      <g
        className={`scene-drawer${open ? ' open' : ''}`}
        onClick={onDrawer}
        data-hover
        role="button"
        aria-label="An old drawer, slightly open"
      >
        <rect x="700" y="272" width="180" height="34" fill="var(--surface)" stroke="var(--gold-dim)" strokeWidth="1.1" />
        <circle cx="790" cy="289" r="4" fill="var(--gold-dim)" />
        <rect className="drawer-glint" x="742" y="268" width="96" height="5" fill="var(--paper)" />
      </g>
    </svg>
  )
}

export default function DrawerRoom() {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(0)

  const toggle = () => {
    setOpen((v) => !v)
    setPage(0)
  }

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

      {open && (
        <div className="booklet-backdrop" onClick={toggle}>
          <div className="booklet" onClick={(e) => e.stopPropagation()}>
            {PAGES.map((pg, i) => (
              <div
                key={i}
                className={`booklet-page${i < page ? ' turned' : ''}`}
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
      )}
    </Chapter>
  )
}
