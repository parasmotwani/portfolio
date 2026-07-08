import { useEffect, useRef, useState } from 'react'
import { useScroll } from '../hooks/useScrollProgress'

export default function Preloader() {
  const { start } = useScroll()
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const [gone, setGone] = useState(false)
  const sigilRef = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduced ? 200 : 1900
    const t0 = performance.now()
    let raf

    const strokes = sigilRef.current?.querySelectorAll('circle, polygon') || []
    strokes.forEach((s) => {
      const len = s.getTotalLength ? s.getTotalLength() : 300
      s.style.strokeDasharray = len
      s.style.strokeDashoffset = len
    })

    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(eased * 100))
      strokes.forEach((s) => {
        const len = parseFloat(s.style.strokeDasharray)
        s.style.strokeDashoffset = len * (1 - eased)
      })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => {
          setDone(true)
          start()
          setTimeout(() => setGone(true), 950)
        }, 300)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start])

  if (gone) return null

  return (
    <div className={`preloader${done ? ' done' : ''}`}>
      <div className="preloader-inner">
        <svg className="preloader-sigil" viewBox="0 0 100 100" ref={sigilRef} aria-hidden="true">
          <circle cx="50" cy="50" r="46" />
          <circle cx="50" cy="50" r="34" />
          <polygon points="50,16 79,67 21,67" />
          <polygon points="50,84 21,33 79,33" />
          <circle cx="50" cy="50" r="6" />
        </svg>
        <div className="preloader-counter">{String(count).padStart(3, '0')}</div>
        <div className="preloader-label">Entering the house</div>
      </div>
    </div>
  )
}
