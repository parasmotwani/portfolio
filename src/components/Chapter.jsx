import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePerformance } from '../context/PerformanceContext'

gsap.registerPlugin(ScrollTrigger)

// Generic pinned-scrub chapter. While pinned, scrolling "inscribes" the
// content: [data-reveal] elements ink in (opacity/blur/y), [data-inscribe]
// SVG strokes draw themselves. With `exit` (default), the room also closes:
// content inks out and darkness swallows it before the pin releases — every
// room has a way in AND a way out, except the last (`exit={false}`).
// Mobile / reduced-motion / low-power fall back to simple play-once reveals.
export default function Chapter({ id, numeral, title, subtitle, pin = true, exit = true, children, className = '' }) {
  const ref = useRef(null)
  const shadeRef = useRef(null)
  const { lowPower } = usePerformance()

  useEffect(() => {
    const el = ref.current
    const shade = shadeRef.current
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
    const fades = []
    if (mobile || lowPower || !pin) {
      tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 72%', once: true },
      })
      tl.to(items, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 0.8, stagger: 0.09, ease: 'power3.out',
      }, 0)
      tl.to(strokes, { strokeDashoffset: 0, duration: 1.4, stagger: 0.15, ease: 'power2.inOut' }, 0.1)
      // unpinned desktop rooms still get a way in and a way out: the shade
      // scrubs clear entering the viewport and closes again on the way off
      if (exit && !mobile && !lowPower && shade) {
        fades.push(gsap.fromTo(shade, { opacity: 1 }, {
          opacity: 0, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 32%', scrub: 0.5 },
        }))
        fades.push(gsap.to(shade, {
          opacity: 1, ease: 'none',
          scrollTrigger: { trigger: el, start: 'bottom 60%', end: 'bottom 10%', scrub: 0.5 },
        }))
      }
    } else {
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: exit ? '+=130%' : '+=95%',
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
      // dwell so the finished room holds before releasing
      tl.to({}, { duration: 0.25 })
      if (exit && shade) {
        // leaving: the content inks back out and the dark takes the room
        tl.to(items, {
          opacity: 0, y: -16, filter: 'blur(4px)',
          stagger: 0.05, ease: 'power2.in',
        }, '+=0.05')
        tl.to(shade, { opacity: 1, duration: 0.3, ease: 'power2.in' }, '<0.06')
        tl.to(el, { scale: 1.05, duration: 0.32, ease: 'power2.in' }, '<')
      }
    }

    return () => {
      tl?.scrollTrigger?.kill()
      tl?.kill()
      fades.forEach((f) => { f.scrollTrigger?.kill(); f.kill() })
    }
  }, [pin, exit, lowPower])

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
      <div className="room-shade" ref={shadeRef} aria-hidden="true" />
    </section>
  )
}
