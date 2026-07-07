import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import EmberField from './EmberField'
import { usePerformance } from '../context/PerformanceContext'

export default function SceneCanvas() {
  const { lowPower } = usePerformance()

  const count = useMemo(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    return coarse || window.innerWidth < 768 ? 120 : 260
  }, [])

  if (lowPower) return <div className="static-bg" />

  return (
    <div className="scene-canvas">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        performance={{ min: 0.5 }}
      >
        <EmberField count={count} />
      </Canvas>
    </div>
  )
}
