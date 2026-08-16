import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { hotspots } from './hotspots'

// ============================================================
// A hotspot that rides its own 3D object.
//
// These used to be fixed CSS rectangles guessing at where a thing was —
// the lantern hook was a 9vw × 34vh invisible band pinned to the right
// edge of the viewport for the whole page, which is why hanging the
// lantern felt like clicking anywhere would do it. This is exactly where
// the object is, it shrinks with distance, and it stops existing when the
// object isn't on screen.
//
// Only the scene imports this file; the DOM half reads the plain state
// module next to it (see hotspots.js for why that split matters).
// ============================================================

export function Hotspot({ name, reach = 26 }) {
  const ref = useRef()
  const v = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera, size }) => {
    const node = ref.current
    if (!node) return
    const h = hotspots[name] || (hotspots[name] = { x: 0, y: 0, size: 0, visible: false })

    node.getWorldPosition(v)
    const dist = v.distanceTo(camera.position)
    v.project(camera)

    // behind the camera, off the edges, or too far to be a thing you could
    // reach out and touch
    h.visible = v.z < 1 && Math.abs(v.x) < 0.98 && Math.abs(v.y) < 0.96 && dist < reach
    if (!h.visible) return

    h.x = (v.x * 0.5 + 0.5) * size.width
    h.y = (-v.y * 0.5 + 0.5) * size.height
    // a fixed world size projected to screen, clamped so it stays clickable
    h.size = THREE.MathUtils.clamp((size.height * 1.1) / dist, 54, 190)
  })

  return <object3D ref={ref} />
}
