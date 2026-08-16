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

  useEffect(() => {
    let raf
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
      el.style.width = `${h.size}px`
      el.style.height = `${h.size}px`
      el.style.transform = `translate(${h.x - h.size / 2}px, ${h.y - h.size / 2}px)`
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
