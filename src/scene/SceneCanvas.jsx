import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
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
        <color attach="background" args={['#0d0b08']} />
        {caps.room && (
          <Suspense fallback={null}>
            <HeroRoom lit={lit} />
            <StudyRoom lit={lit} />
          </Suspense>
        )}
        <EmberField count={caps.dust} />
        {caps.room && (
          <EffectComposer multisampling={0}>
            <Bloom intensity={0.55} luminanceThreshold={0.62} luminanceSmoothing={0.25} mipmapBlur />
            <Vignette eskil={false} offset={0.22} darkness={0.72} />
            <Noise premultiply opacity={0.55} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
