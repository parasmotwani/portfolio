// A small spider that occasionally lowers itself on a thread, then climbs
// back up. Pure CSS animation (see .spider-rig in index.css).
export default function Spider({ left = '12%', delay = 0 }) {
  return (
    <div className="spider-rig" style={{ left, animationDelay: `${delay}s` }} aria-hidden="true">
      <div className="spider-thread" />
      <svg className="spider" viewBox="0 0 24 20">
        <g fill="currentColor">
          <ellipse cx="12" cy="13" rx="4.5" ry="5" />
          <circle cx="12" cy="6.5" r="2.6" />
        </g>
        <g stroke="currentColor" strokeWidth="0.9" fill="none">
          <path d="M8 10 Q3 8 1 4" />
          <path d="M8 12 Q2 12 0 9" />
          <path d="M8 14 Q3 16 1 19" />
          <path d="M9 16 Q6 19 5 20" />
          <path d="M16 10 Q21 8 23 4" />
          <path d="M16 12 Q22 12 24 9" />
          <path d="M16 14 Q21 16 23 19" />
          <path d="M15 16 Q18 19 19 20" />
        </g>
      </svg>
    </div>
  )
}
