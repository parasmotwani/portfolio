import { useEffect, useRef } from 'react'
import { hotspots } from '../scene/hotspots'

// The DOM half of a hotspot: a round, borderless target that sits exactly
// on its 3D object and fades out when that object leaves the frame.
//
// No rectangle on hover — the old drawer hotspot drew a literal gold box,
// which announced "this is a web page control" in the middle of a room.
// What acknowledges the cursor here is a soft warm bloom, the same thing
// every other light in the house does.
export default function Reach({ name, onClick, label, title }) {
  const ref = useRef(null)

  // The target stops moving once you are on it.
  //
  // These ride a projected 3D point, and the camera sways with the cursor —
  // so moving the pointer toward the control moved the control, and you
  // ended up chasing a circle that slid away from you. Headless clicks
  // failed on it with "element is not stable", which is the machine saying
  // the same thing a person feels. While the pointer is inside the target
  // its screen position is frozen; it resumes tracking when you leave.
  const frozen = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const enter = () => { frozen.current = true }
    const leave = () => { frozen.current = false }
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  useEffect(() => {
    let raf
    let lastX = null
    let lastY = null
    let lastS = null
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const el = ref.current
      if (!el) return
      const h = hotspots[name]
      if (!h || !h.visible) {
        if (el.style.opacity !== '0') {
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
        }
        return
      }
      el.style.opacity = '1'
      el.style.pointerEvents = 'auto'
      if (frozen.current) return

      // whole pixels, and only when it actually moved: sub-pixel churn every
      // frame is what makes a target feel slippery
      const x = Math.round(h.x - h.size / 2)
      const y = Math.round(h.y - h.size / 2)
      const s = Math.round(h.size)
      if (x === lastX && y === lastY && s === lastS) return
      lastX = x; lastY = y; lastS = s
      el.style.width = `${s}px`
      el.style.height = `${s}px`
      el.style.transform = `translate(${x}px, ${y}px)`
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [name])

  return (
    <button
      ref={ref}
      className="reach"
      onClick={onClick}
      aria-label={label}
      title={title}
    />
  )
}
