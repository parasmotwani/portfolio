import { useEffect, useRef, useState } from 'react'
import { useScroll } from '../hooks/useScrollProgress'

export default function Preloader() {
  const { start } = useScroll()
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const [gone, setGone] = useState(false)
  const fillRef = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduced ? 200 : 1800
    const t0 = performance.now()
    let raf

    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration)
      // ease-out so the counter decelerates like a loading model converging
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(eased * 100))
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${eased})`
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => {
          setDone(true)
          start()
          setTimeout(() => setGone(true), 950)
        }, 250)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start])

  if (gone) return null

  return (
    <div className={`preloader${done ? ' done' : ''}`}>
      <div className="preloader-inner">
        <div className="preloader-counter">
          {String(count).padStart(3, '0')}<span>%</span>
        </div>
        <div className="preloader-bar">
          <div className="preloader-bar-fill" ref={fillRef} style={{ transform: 'scaleX(0)' }} />
        </div>
        <div className="preloader-label">Initializing · Paras Motwani</div>
      </div>
    </div>
  )
}
