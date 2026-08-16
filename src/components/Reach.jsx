import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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

  // Rendered into <body>, never into the room's own section.
  //
  // This is the bug that survived seven passes. .reach is position:fixed
  // and is placed from coordinates the Hotspot projects in VIEWPORT space
  // — but a transformed ancestor makes position:fixed resolve against that
  // ancestor instead of the viewport, and both GSAP's pin and this file's
  // own walk animation (scale + clipPath on the chapter) put a transform
  // on the section these buttons lived inside. So the maths was right and
  // the button still landed a page-length away: measured at a 1600x900
  // viewport, the contact target sat at y=1907, a thousand pixels below
  // the bottom of the screen, with elementFromPoint returning null.
  //
  // It read as "works" in every test because element.click() scrolls the
  // node into view before clicking. Clicking the PIXEL is the test that
  // catches it.
  //
  // Room III's arcade always worked, and that was the clue: it is the one
  // unpinned room, so nothing ever transformed its ancestor.
  return createPortal(
    <button
      ref={ref}
      className="reach"
      onClick={onClick}
      aria-label={label}
      title={title}
    />,
    document.body
  )
}
