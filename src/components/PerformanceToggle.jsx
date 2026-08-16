import { usePerformance } from '../context/PerformanceContext'
import { useDevice } from '../hooks/useDevice'

export default function PerformanceToggle() {
  const { lowPower, setLowPower } = usePerformance()
  const { coarse, reduced, small } = useDevice()

  // Hidden where the manor could never run anyway — but it must survive
  // lowPower itself, or switching 3D off would remove the only way back on.
  if (coarse || reduced || small) return null

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
