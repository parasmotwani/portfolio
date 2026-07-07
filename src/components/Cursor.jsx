import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

// Custom cursor (dot + trailing ring) and magnetic pull for [data-magnetic].
// Ring scales up over [data-hover] elements. Entire component is a no-op on touch.
export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return

    const dotX = gsap.quickTo(dotRef.current, 'x', { duration: 0.08, ease: 'power2.out' })
    const dotY = gsap.quickTo(dotRef.current, 'y', { duration: 0.08, ease: 'power2.out' })
    const ringX = gsap.quickTo(ringRef.current, 'x', { duration: 0.35, ease: 'power2.out' })
    const ringY = gsap.quickTo(ringRef.current, 'y', { duration: 0.35, ease: 'power2.out' })

    const onMove = (e) => {
      dotX(e.clientX); dotY(e.clientY)
      ringX(e.clientX); ringY(e.clientY)
    }

    const onOver = (e) => {
      if (e.target.closest('[data-hover]')) setHovering(true)
    }
    const onOut = (e) => {
      if (e.target.closest('[data-hover]')) setHovering(false)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })

    // magnetic buttons — elements pull toward the cursor while it's near
    const magnets = Array.from(document.querySelectorAll('[data-magnetic]'))
    const cleanups = magnets.map((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })
      const move = (e) => {
        const rect = el.getBoundingClientRect()
        const dx = e.clientX - (rect.left + rect.width / 2)
        const dy = e.clientY - (rect.top + rect.height / 2)
        xTo(dx * 0.3)
        yTo(dy * 0.3)
      }
      const leave = () => { xTo(0); yTo(0) }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
      }
    })

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      cleanups.forEach((fn) => fn())
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className={`cursor-ring${hovering ? ' hovering' : ''}`} ref={ringRef} />
    </>
  )
}
