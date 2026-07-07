import { useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import MorphingParticles from './MorphingParticles'
import CameraRig from './CameraRig'
import { sceneState } from './sceneState'
import { usePerformance } from '../context/PerformanceContext'

export default function SceneCanvas() {
  const { lowPower } = usePerformance()

  const count = useMemo(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    return coarse || window.innerWidth < 768 ? 1500 : 4000
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      sceneState.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      sceneState.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  if (lowPower) return <div className="static-bg" />

  return (
    <div className="scene-canvas">
      <Canvas
        camera={{ position: [0, 0.5, 11], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        performance={{ min: 0.5 }}
      >
        <MorphingParticles count={count} />
        <CameraRig />
      </Canvas>
    </div>
  )
}
