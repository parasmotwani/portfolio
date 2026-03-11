import { usePerformance } from '../context/PerformanceContext'

export default function PerformanceToggle() {
  const { lowPower, setLowPower } = usePerformance()

  return (
    <button
      className="perf-toggle"
      onClick={() => setLowPower(!lowPower)}
      title={lowPower ? 'Enable 3D effects' : 'Disable 3D effects'}
      aria-label={lowPower ? 'Enable 3D effects' : 'Disable 3D effects'}
    >
      <span className="perf-toggle-icon">{lowPower ? '⚡' : '🔋'}</span>
      <span className="perf-toggle-label">{lowPower ? '3D Off' : '3D On'}</span>
    </button>
  )
}
