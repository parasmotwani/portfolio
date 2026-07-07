import { usePerformance } from '../context/PerformanceContext'

export default function PerformanceToggle() {
  const { lowPower, setLowPower } = usePerformance()

  return (
    <button
      className="perf-toggle"
      data-hover
      onClick={() => setLowPower(!lowPower)}
      title={lowPower ? 'Enable 3D effects' : 'Disable 3D effects'}
      aria-label={lowPower ? 'Enable 3D effects' : 'Disable 3D effects'}
    >
      <span className="ind">{lowPower ? '○' : '●'}</span> 3D {lowPower ? 'Off' : 'On'}
    </button>
  )
}
