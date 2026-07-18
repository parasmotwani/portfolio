import { useLight } from '../context/LightContext'

// The switch hides in the dark like everything else — no glow, no label.
// You find it with the torch (the whisper says it's on the right wall).
// An old knife-lever on a tarnished plate: lever down = off, thrown up = on.
// The label is absolutely positioned so toggling never shifts the plate.
export default function LightSwitch() {
  const { lit, setLit } = useLight()

  return (
    <button
      className={`light-switch${lit ? ' on' : ''}`}
      data-hover
      onClick={() => setLit(!lit)}
      aria-label={lit ? 'Turn the lights off' : 'Turn the lights on'}
      title={lit ? 'Lights off' : 'Lights on'}
    >
      <svg viewBox="0 0 44 74" aria-hidden="true">
        <defs>
          <linearGradient id="swPlate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6b6152" />
            <stop offset="0.45" stopColor="#4a4238" />
            <stop offset="0.75" stopColor="#57503f" />
            <stop offset="1" stopColor="#3a332a" />
          </linearGradient>
          <radialGradient id="swScrew" cx="0.35" cy="0.3" r="0.9">
            <stop offset="0" stopColor="#8a7d68" />
            <stop offset="0.7" stopColor="#4d4335" />
            <stop offset="1" stopColor="#2c251b" />
          </radialGradient>
          <radialGradient id="swBoss" cx="0.4" cy="0.35" r="0.9">
            <stop offset="0" stopColor="#7d7261" />
            <stop offset="0.65" stopColor="#453d30" />
            <stop offset="1" stopColor="#241f16" />
          </radialGradient>
          <linearGradient id="swArm" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3f382c" />
            <stop offset="0.4" stopColor="#8a7e69" />
            <stop offset="0.6" stopColor="#6b6152" />
            <stop offset="1" stopColor="#332c21" />
          </linearGradient>
          <linearGradient id="swGrip" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0f0b06" />
            <stop offset="0.45" stopColor="#2c2317" />
            <stop offset="0.6" stopColor="#241d12" />
            <stop offset="1" stopColor="#0c0805" />
          </linearGradient>
          <linearGradient id="swDust" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d8d2c0" stopOpacity="0.09" />
            <stop offset="0.35" stopColor="#d8d2c0" stopOpacity="0.03" />
            <stop offset="1" stopColor="#d8d2c0" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* tarnished plate, bevel, patina */}
        <rect x="4" y="6" width="36" height="62" rx="4" fill="url(#swPlate)" stroke="#221c13" strokeWidth="1.4" />
        <rect x="6.5" y="8.5" width="31" height="57" rx="2.8" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
        <ellipse cx="13" cy="24" rx="6" ry="9" fill="#5d3f27" opacity="0.28" />
        <ellipse cx="33" cy="55" rx="5" ry="7" fill="#5d3f27" opacity="0.22" />
        <ellipse cx="30" cy="16" rx="4" ry="3" fill="#4a5240" opacity="0.22" />
        <ellipse cx="10" cy="60" rx="3" ry="4" fill="#3c3226" opacity="0.4" />

        {/* screws, slots worn at odd angles */}
        <circle cx="22" cy="13" r="2.7" fill="url(#swScrew)" stroke="#1d1810" strokeWidth="0.6" />
        <line x1="20.4" y1="12.2" x2="23.6" y2="13.8" stroke="#1a140c" strokeWidth="0.8" />
        <circle cx="22" cy="61" r="2.7" fill="url(#swScrew)" stroke="#1d1810" strokeWidth="0.6" />
        <line x1="20.6" y1="62.4" x2="23.4" y2="59.6" stroke="#1a140c" strokeWidth="0.8" />

        {/* the lever: pivot boss + arm + bakelite grip (rotates when thrown) */}
        <g className="lever">
          <rect x="20.4" y="38" width="3.2" height="20" rx="1.2" fill="url(#swArm)" stroke="#1d1810" strokeWidth="0.5" />
          <rect x="17.5" y="53" width="9" height="11" rx="3.5" fill="url(#swGrip)" stroke="#0a0703" strokeWidth="0.7" />
          <line x1="19.5" y1="55.5" x2="19.5" y2="61.5" stroke="#4a3e2c" strokeWidth="0.7" opacity="0.7" />
        </g>
        <circle cx="22" cy="38" r="5" fill="url(#swBoss)" stroke="#1d1810" strokeWidth="0.8" />
        <circle cx="22" cy="38" r="1.6" fill="#191510" />

        {/* dust film, speckles, a web wisp in the corner */}
        <rect x="4" y="6" width="36" height="62" rx="4" fill="url(#swDust)" />
        <g fill="#d8d2c0">
          <circle cx="11" cy="11" r="0.6" opacity="0.14" />
          <circle cx="34" cy="21" r="0.5" opacity="0.12" />
          <circle cx="15" cy="44" r="0.5" opacity="0.1" />
          <circle cx="31" cy="38" r="0.6" opacity="0.12" />
          <circle cx="26" cy="66" r="0.5" opacity="0.1" />
        </g>
        <g stroke="#d8d2c0" strokeOpacity="0.16" fill="none" strokeWidth="0.5">
          <path d="M4 10 Q10 9 13 6" />
          <path d="M4 14 Q9 13 12 9" />
          <path d="M40 62 Q36 64 34 68" />
        </g>
      </svg>
      <span className="light-switch-label">{lit ? 'lights on' : ''}</span>
    </button>
  )
}
