import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import ParticleField from './ParticleField'
import FloatingGeometry from './FloatingGeometry'

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      performance={{ min: 0.5 }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[-5, -5, -5]} color="#a855f7" intensity={0.3} />
      <pointLight position={[5, 2, -3]} color="#00f0ff" intensity={0.3} />
      <ParticleField />
      <FloatingGeometry />
      <Preload all />
    </Canvas>
  )
}
