import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePerformance } from '../context/PerformanceContext'

gsap.registerPlugin(ScrollTrigger)

// Generic pinned-scrub chapter. While pinned, scrolling "inscribes" the
// content: [data-reveal] elements ink in (opacity/blur/y), [data-inscribe]
// SVG strokes draw themselves. Mobile / reduced-motion / low-power fall
// back to simple play-once reveals with no pinning.
export default function Chapter({ id, numeral, title, subtitle, pin = true, children, className = '' }) {
  const ref = useRef(null)
  const { lowPower } = usePerformance()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches

    const items = el.querySelectorAll('[data-reveal]')
    const strokes = el.querySelectorAll('[data-inscribe]')

    strokes.forEach((s) => {
      const len = s.getTotalLength ? s.getTotalLength() : 300
      s.style.strokeDasharray = len
      s.style.strokeDashoffset = len
    })

    if (reduced) {
      el.classList.add('no-anim')
      strokes.forEach((s) => { s.style.strokeDashoffset = 0 })
      return
    }

    let tl
    if (mobile || lowPower || !pin) {
      tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 72%', once: true },
      })
      tl.to(items, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 0.8, stagger: 0.09, ease: 'power3.out',
      }, 0)
      tl.to(strokes, { strokeDashoffset: 0, duration: 1.4, stagger: 0.15, ease: 'power2.inOut' }, 0.1)
    } else {
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=95%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      })
      // walk through the doorway: the room opens from a door-shaped arch
      tl.fromTo(el,
        {
          clipPath: 'inset(14% 39% 0% 39% round 45vw 45vw 0 0)',
          scale: 1.07,
        },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0vw 0vw 0 0)',
          scale: 1,
          duration: 0.32,
          ease: 'power2.out',
        }, 0)
      tl.to(items, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.1, ease: 'power2.out',
      }, 0.18)
      tl.to(strokes, { strokeDashoffset: 0, stagger: 0.12, ease: 'none' }, 0.18)
      // small dwell so the finished room holds before releasing
      tl.to({}, { duration: 0.25 })
    }

    return () => {
      tl?.scrollTrigger?.kill()
      tl?.kill()
    }
  }, [pin, lowPower])

  return (
    <section className={`chapter ${className}`} id={id} ref={ref}>
      {(numeral || title) && (
        <header className="chapter-head">
          {numeral && <span className="chapter-numeral" data-reveal>{numeral}</span>}
          {title && <h2 className="chapter-title" data-reveal>{title}</h2>}
          {subtitle && <p className="chapter-sub" data-reveal>{subtitle}</p>}
          <div className="orn-rule" data-reveal><span className="gem" /></div>
        </header>
      )}
      {children}
    </section>
  )
}
