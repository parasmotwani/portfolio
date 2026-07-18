// A small spider that occasionally lowers itself on a thread, then climbs
// back up. Pure CSS animation (see .spider-rig in index.css).
// Drawn hanging head-down: silk leaves the spinnerets, so the abdomen is
// at the top and the front legs reach back up toward the line.
export default function Spider({ left = '12%', delay = 0 }) {
  return (
    <div className="spider-rig" style={{ left, animationDelay: `${delay}s` }} aria-hidden="true">
      <div className="spider-thread" />
      <svg className="spider" viewBox="0 0 32 30">
        <line x1="16" y1="0" x2="16" y2="6.8" stroke="currentColor" strokeWidth="0.5" opacity="0.8" />
        <g fill="currentColor">
          <ellipse cx="16" cy="11.6" rx="3.9" ry="5.2" />
          <ellipse cx="16" cy="19.2" rx="2.7" ry="3.1" />
        </g>
        <path
          d="M16 7.6 Q17.6 10 16.9 13.6 Q16.4 15.4 16 16 Q15.6 15.4 15.1 13.6 Q14.4 10 16 7.6"
          fill="rgba(0,0,0,0.3)"
        />
        <g stroke="currentColor" fill="none" strokeLinecap="round">
          <path strokeWidth="0.95" d="M18.2 17.6 Q22.6 14.2 24.6 10.6 Q25.7 8.6 26.2 6.8" />
          <path strokeWidth="0.9" d="M18.6 18.6 Q24 17 26.8 14 Q28.2 12.4 28.8 10.8" />
          <path strokeWidth="0.9" d="M18.6 20 Q23.8 21 26.6 23.4 Q28 24.6 28.8 26" />
          <path strokeWidth="0.85" d="M17.8 21.2 Q21 24.4 22.2 27 Q22.8 28.3 23 29.4" />
          <path strokeWidth="0.95" d="M13.8 17.6 Q9.4 14.2 7.4 10.6 Q6.3 8.6 5.8 6.8" />
          <path strokeWidth="0.9" d="M13.4 18.6 Q8 17 5.2 14 Q3.8 12.4 3.2 10.8" />
          <path strokeWidth="0.9" d="M13.4 20 Q8.2 21 5.4 23.4 Q4 24.6 3.2 26" />
          <path strokeWidth="0.85" d="M14.2 21.2 Q11 24.4 9.8 27 Q9.2 28.3 9 29.4" />
          <path strokeWidth="0.6" d="M14.9 21.9 Q14.4 23.2 13.7 23.9" />
          <path strokeWidth="0.6" d="M17.1 21.9 Q17.6 23.2 18.3 23.9" />
        </g>
      </svg>
    </div>
  )
}
