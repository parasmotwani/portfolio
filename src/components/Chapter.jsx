import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useDevice } from '../hooks/useDevice'
import { journey } from '../scene/journey'
import { plateStyle } from '../scene/plate'

gsap.registerPlugin(ScrollTrigger)

// Generic pinned-scrub chapter. While pinned, scrolling "inscribes" the
// content: [data-reveal] elements ink in (opacity/blur/y), [data-inscribe]
// SVG strokes draw themselves. With `exit` (default), the room also closes:
// content inks out and darkness swallows it before the pin releases — every
// room has a way in AND a way out, except the last (`exit={false}`).
// Mobile / reduced-motion / low-power fall back to simple play-once reveals.
// `room` ties the chapter to a room of the 3D manor: its pinned progress
// becomes journey.t, and the black exit shade is suppressed — the walk
// through the doorway replaces the cut it used to cover.
export default function Chapter({ id, numeral, title, subtitle, pin = true, exit = true, room = null, children, className = '' }) {
  const ref = useRef(null)
  const shadeRef = useRef(null)
  const { immersive, reduced } = useDevice()

  useEffect(() => {
    const el = ref.current
    const shade = shadeRef.current
    if (!el) return

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
    let roomST
    const fades = []

    // Rooms that opt out of pinning (the game needs free scroll, the
    // timeline is long) still have to move the camera through their room,
    // so they get a scrub of their own rather than riding the pin.
    if (immersive && room != null && !pin) {
      roomST = ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true,
        onUpdate: (self) => { journey.t = room + self.progress },
      })
    }

    if (!immersive || !pin) {
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
      if (exit && immersive && shade) {
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
          onUpdate: room == null ? undefined : (self) => { journey.t = room + self.progress },
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
      if (exit && shade && room == null) {
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
      roomST?.kill()
      tl?.scrollTrigger?.kill()
      tl?.kill()
      fades.forEach((f) => { f.scrollTrigger?.kill(); f.kill() })
    }
  }, [pin, exit, immersive, reduced, room])

  return (
    <div className="pin-slot">
      {/* Stable slot. GSAP's pin reparents the pinned element into a
          .pin-spacer it creates, which React knows nothing about — so when
          React later unmounts or reorders siblings it calls removeChild on
          a node that has moved, and the whole tree dies with
          "node to be removed is not a child of this node". That is what
          made the 3D toggle wipe the page. React owns this wrapper and
          GSAP never touches it; the spacer goes INSIDE. */}
      <section
      className={`chapter ${className}${!immersive && room != null ? ' chapter--plated' : ''}${immersive && room != null ? ' chapter--diegetic' : ''}`}
      id={id}
      ref={ref}
      style={immersive ? undefined : plateStyle(room)}
    >
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
    </div>
  )
}
