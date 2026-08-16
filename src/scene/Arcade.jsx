import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { WOOD_DARK, IRON } from './palette'
import { Hotspot } from './Hotspot'

// ============================================================
// The machine the Game Room is named for.
//
// Room III had a bench and a candle and nothing to play — the CRT was a
// DOM panel hovering in front of an empty room. This is the cabinet it
// lives in: a real object standing on the floor, with the screen recessed
// where the screen should be, so "insert coin" expands something the
// visitor can already see standing there.
// ============================================================

export default function Arcade({ lit, position = [0, -2.4, -4.4], rotation = [0, 0, 0] }) {
  const glow = useRef()
  const scan = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // a tube that has been left on for a very long time
    const flick = 0.82 + Math.sin(t * 9.1) * 0.03 + Math.sin(t * 21.3) * 0.02
    if (glow.current) glow.current.intensity = (lit ? 1.5 : 1.05) * flick
    if (scan.current) scan.current.material.opacity = 0.5 + Math.sin(t * 2.2) * 0.08
  })

  const body = { color: '#2a1d12', roughness: 0.82 }
  const trim = { color: WOOD_DARK, roughness: 0.7 }

  return (
    <group position={position} rotation={rotation}>
      {/* plinth */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.36, 1.5]} />
        <meshStandardMaterial color="#1d140b" roughness={0.9} />
      </mesh>
      {/* main body */}
      <mesh position={[0, 1.4, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.75, 2.2, 1.3]} />
        <meshStandardMaterial {...body} />
      </mesh>
      {/* side panels, a shade lighter so the silhouette reads */}
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 1.4, -0.05]} castShadow>
          <boxGeometry args={[0.08, 2.2, 1.34]} />
          <meshStandardMaterial {...trim} />
        </mesh>
      ))}

      {/* the DOM reach rides the screen, so clicking the machine is what
          starts the game — there is no card floating in the room to press */}
      <Hotspot name="arcade" reach={26} position={[0, 1.78, 0.7]} />

      {/* the recessed screen */}
      <mesh position={[0, 1.78, 0.62]}>
        <boxGeometry args={[1.35, 1.0, 0.12]} />
        <meshStandardMaterial color="#0d0a06" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.78, 0.7]}>
        <planeGeometry args={[1.12, 0.8]} />
        <meshBasicMaterial color="#3a2a12" toneMapped={false} />
      </mesh>
      <mesh ref={scan} position={[0, 1.78, 0.71]}>
        <planeGeometry args={[1.12, 0.8]} />
        <meshBasicMaterial color="#ffb04e" transparent opacity={0.5} toneMapped={false} />
      </mesh>
      {/* the tube's own light, thrown onto the room */}
      <pointLight ref={glow} position={[0, 1.78, 1.15]} color="#ffb45e" distance={9} decay={1.7} />

      {/* control panel */}
      <mesh position={[0, 1.02, 0.78]} rotation={[-0.34, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.62, 0.1]} />
        <meshStandardMaterial {...trim} />
      </mesh>
      {/* stick + two buttons */}
      <mesh position={[-0.38, 1.16, 0.86]} rotation={[-0.34, 0, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.24, 8]} />
        <meshStandardMaterial color="#1a120a" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[-0.38, 1.28, 0.9]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <meshStandardMaterial color="#8e2f2f" roughness={0.4} />
      </mesh>
      {[0.16, 0.38].map((x) => (
        <mesh key={x} position={[x, 1.14, 0.87]} rotation={[-0.34 + Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.04, 12]} />
          <meshStandardMaterial color={IRON} roughness={0.5} />
        </mesh>
      ))}

      {/* marquee above the screen */}
      <mesh position={[0, 2.42, 0.5]} rotation={[0.16, 0, 0]}>
        <boxGeometry args={[1.5, 0.42, 0.08]} />
        <meshStandardMaterial color="#241708" roughness={0.75} />
      </mesh>
      <mesh position={[0, 2.42, 0.55]} rotation={[0.16, 0, 0]}>
        <planeGeometry args={[1.34, 0.3]} />
        <meshBasicMaterial color="#c98a2e" transparent opacity={0.5} toneMapped={false} />
      </mesh>

      {/* coin slot */}
      <mesh position={[0.32, 0.72, 0.66]}>
        <boxGeometry args={[0.06, 0.14, 0.03]} />
        <meshStandardMaterial color="#0a0705" roughness={0.9} />
      </mesh>
    </group>
  )
}
