import { useState } from 'react'
import Chapter from './Chapter'
import Cobweb from './Cobweb'
import Spider from './Spider'

// Room I — a study with an old desk. The drawer is ajar; pull it open and
// an aged paper unfolds with the condensed portfolio.
export default function DrawerRoom() {
  const [open, setOpen] = useState(false)
  const [paper, setPaper] = useState(false)

  const pull = () => {
    if (!open) {
      setOpen(true)
      setTimeout(() => setPaper(true), 450)
    } else {
      setPaper(false)
      setTimeout(() => setOpen(false), 250)
    }
  }

  return (
    <Chapter
      id="about"
      numeral="Room I"
      title="About"
      subtitle="A study, long unused. The desk drawer is slightly open."
      className="room"
    >
      <Cobweb corner="tr" size={150} />
      <Spider left="8%" delay={2} />

      <div className="study-scene" data-reveal>
        <svg
          className={`desk${open ? ' open' : ''}`}
          viewBox="0 0 520 300"
          onClick={pull}
          data-hover
          role="button"
          aria-label={open ? 'Close the drawer' : 'Open the drawer'}
        >
          {/* desk body */}
          <g stroke="var(--gold-dim)" strokeWidth="1.5" fill="var(--surface)">
            <rect x="40" y="60" width="440" height="26" />
            <rect x="60" y="86" width="400" height="150" fill="var(--surface-2)" />
            {/* legs */}
            <rect x="66" y="236" width="18" height="52" />
            <rect x="436" y="236" width="18" height="52" />
          </g>
          {/* upper (static) drawer */}
          <g stroke="var(--gold-dim)" strokeWidth="1.2" fill="var(--surface)">
            <rect x="90" y="100" width="340" height="52" />
            <circle cx="260" cy="126" r="5" fill="var(--gold-dim)" />
          </g>
          {/* the ajar drawer — slides out when opened */}
          <g className="desk-drawer" stroke="var(--gold)" strokeWidth="1.4" fill="var(--surface)">
            <rect x="90" y="164" width="340" height="52" />
            <circle cx="260" cy="190" r="5" fill="var(--gold)" />
            {/* paper peeking out */}
            <rect x="150" y="158" width="220" height="8" fill="var(--paper)" stroke="none" />
          </g>
          {/* candle */}
          <g>
            <rect x="410" y="34" width="12" height="26" fill="var(--paper)" stroke="var(--gold-dim)" />
            <ellipse className="candle-flame" cx="416" cy="26" rx="4" ry="8" fill="var(--gold)" />
          </g>
          <text x="260" y="278" textAnchor="middle" className="desk-hint">
            {open ? 'push the drawer shut' : 'pull the drawer open'}
          </text>
        </svg>

        {paper && (
          <div className="old-paper" role="dialog" aria-label="About Paras Motwani">
            <button className="old-paper-close" data-hover onClick={pull} aria-label="Close">✕</button>
            <h4>Paras Motwani</h4>
            <p className="paper-sub">AI &amp; Data Science Engineer — Jaipur, IN</p>
            <hr />
            <p>
              I build intelligent systems — from agentic AI workflows to data
              pipelines that move at production scale. Focused on AI, Data
              Science, and Generative AI: contract intelligence on Databricks,
              autonomous SAP workflows on AWS. Co-founded a gamified ed-tech
              startup; won top honors at The Startup Mela 2.0, Jaipur.
            </p>
            <div className="paper-stats">
              <span><b>16+</b> projects</span>
              <span><b>2</b> internships</span>
              <span><b>9+</b> certifications</span>
              <span><b>2025</b> B.Tech graduate</span>
            </div>
            <hr />
            <p className="paper-edu">
              <b>B.Tech, Computer Science &amp; Engineering</b><br />
              Manipal University Jaipur · Oct 2021 – Jul 2025<br /><br />
              <b>Senior Secondary (12th) — 92.75%</b><br />
              Academic World School · Mar 2020 – Jul 2021
            </p>
          </div>
        )}
      </div>
    </Chapter>
  )
}
