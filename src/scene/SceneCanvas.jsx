import { useMemo, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import EmberField from './EmberField'
import HeroRoom from './HeroRoom'
import { heroState } from './heroState'
import { usePerformance } from '../context/PerformanceContext'
import { useLight } from '../context/LightContext'

export default function SceneCanvas() {
  const { lowPower } = usePerformance()
  const { lit } = useLight()

  const caps = useMemo(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const small = window.innerWidth < 768
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return {
      dust: coarse || small ? 120 : 260,
      room: !coarse && !small && !reduced, // the 3D room is a desktop experience
    }
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      heroState.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      heroState.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  if (lowPower) return <div className="static-bg" />

  return (
    <div className="scene-canvas">
      <Canvas
        camera={{ position: [0, 0.25, 7.4], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        performance={{ min: 0.5 }}
      >
        {caps.room && <HeroRoom lit={lit} />}
        <EmberField count={caps.dust} />
      </Canvas>
    </div>
  )
}
