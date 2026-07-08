import { useLight } from '../context/LightContext'

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
      <svg viewBox="0 0 28 44" aria-hidden="true">
        <rect x="1" y="1" width="26" height="42" rx="3" className="plate" />
        <rect x="9" y="10" width="10" height="24" rx="2" className="slot" />
        <rect x="10" className="toggle" width="8" height="11" rx="1.5"
          y={lit ? 11 : 22} />
      </svg>
      <span className="light-switch-label">{lit ? 'lights on' : 'lights out'}</span>
    </button>
  )
}
