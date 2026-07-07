import { useFrame } from '@react-three/fiber'
import { useScroll } from '../hooks/useScrollProgress'
import { sceneState } from './sceneState'

export default function CameraRig() {
  const { progressRef } = useScroll()

  useFrame(({ camera }, delta) => {
    const p = progressRef.current
    const damp = 1 - Math.exp(-3 * delta)

    // gentle dolly path across the journey
    const targetZ = 11 - Math.sin(p * Math.PI) * 2.5
    const targetY = 0.5 - p * 2.2
    const targetX = Math.sin(p * Math.PI * 2) * 1.2

    // mouse parallax
    const mx = sceneState.mouse.x * 0.7
    const my = sceneState.mouse.y * 0.4

    camera.position.z += (targetZ - camera.position.z) * damp
    camera.position.y += (targetY + my - camera.position.y) * damp
    camera.position.x += (targetX + mx - camera.position.x) * damp
    camera.lookAt(0, 0, 0)
  })

  return null
}
