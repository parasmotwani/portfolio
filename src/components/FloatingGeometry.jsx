import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'

function FloatingShape({ position, geometry, color, speed, distort }) {
  const mesh = useRef()

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * speed * 0.3
      mesh.current.rotation.z = state.clock.elapsedTime * speed * 0.2
    }
  })

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={1.5} floatingRange={[-0.2, 0.2]}>
      <mesh ref={mesh} position={position}>
        {geometry}
        <MeshDistortMaterial
          color={color}
          wireframe
          transparent
          opacity={0.3}
          distort={distort}
          speed={1.5}
        />
      </mesh>
    </Float>
  )
}

export default function FloatingGeometry() {
  return (
    <group>
      <FloatingShape
        position={[-4, 2, -3]}
        geometry={<icosahedronGeometry args={[1.2, 0]} />}
        color="#00f0ff"
        speed={1}
        distort={0.15}
      />
      <FloatingShape
        position={[4, -1, -4]}
        geometry={<octahedronGeometry args={[0.9, 0]} />}
        color="#a855f7"
        speed={0.8}
        distort={0.15}
      />
      <FloatingShape
        position={[-2, -3, -5]}
        geometry={<dodecahedronGeometry args={[0.7, 0]} />}
        color="#ec4899"
        speed={0.6}
        distort={0.1}
      />
    </group>
  )
}
