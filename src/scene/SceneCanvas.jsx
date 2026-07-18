import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import EmberField from './EmberField'
import HeroRoom from './HeroRoom'
import StudyRoom from './StudyRoom'
import { heroState } from './heroState'
import { usePerformance } from '../context/PerformanceContext'
import { useLight } from '../context/LightContext'

function readCaps() {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = window.innerWidth < 768
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return {
    dust: coarse || small ? 120 : 260,
    room: !coarse && !small && !reduced, // the 3D room is a desktop experience
  }
}

export default function SceneCanvas() {
  const { lowPower } = usePerformance()
  const { lit } = useLight()

  // re-evaluated on resize: a window opened small then maximized must
  // still get the room, and vice versa
  const [caps, setCaps] = useState(readCaps)
  useEffect(() => {
    const update = () => setCaps(readCaps())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
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
        shadows
        camera={{ position: [0, -0.55, 6.6], fov: 58 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.12
        }}
        performance={{ min: 0.5 }}
      >
        {caps.room && <HeroRoom lit={lit} />}
        {caps.room && <StudyRoom lit={lit} />}
        <EmberField count={caps.dust} />
      </Canvas>
    </div>
  )
}
