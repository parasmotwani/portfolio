import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ============================================================
// Where the interactive things in the manor actually are on screen.
//
// These used to be fixed CSS rectangles guessing at it — the lantern hook
// was a 9vw × 34vh invisible band pinned to the right edge of the viewport
// for the whole page, which is why hanging the lantern felt like clicking
// anywhere would do it. A hotspot rides the object instead: it is exactly
// where the thing is, it shrinks with distance, and it stops existing when
// the object isn't on screen.
//
// Mutable module state read from a rAF loop, like journey — nothing here
// may cause a React render per frame.
// ============================================================

export const hotspots = Object.create(null)

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
