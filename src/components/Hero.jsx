import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import MagicCircle from './MagicCircle'
import { useScroll } from '../hooks/useScrollProgress'

const ROLES = [
  'AI & Data Science Engineer',
  'Practitioner of data alchemy',
  'Builder of thinking machines',
]

export default function Hero() {
  const { started, scrollTo } = useScroll()
  const [typed, setTyped] = useState('')
  const circleRef = useRef(null)
  const contentRef = useRef(null)

  // inscribe the magic circle + fade in content once the preloader lifts
  useEffect(() => {
    if (!started || !circleRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const strokes = circleRef.current.querySelectorAll('[data-inscribe]')
    strokes.forEach((s) => {
      const len = s.getTotalLength ? s.getTotalLength() : 300
      s.style.strokeDasharray = len
      s.style.strokeDashoffset = reduced ? 0 : len
    })
    const items = contentRef.current.querySelectorAll('[data-hero-reveal]')
    if (reduced) {
      gsap.set(items, { opacity: 1, y: 0 })
      return
    }
    const tl = gsap.timeline()
    tl.to(strokes, { strokeDashoffset: 0, duration: 2.2, stagger: 0.04, ease: 'power2.inOut' }, 0)
    tl.fromTo(items,
      { opacity: 0, y: 26, filter: 'blur(4px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.14, ease: 'power3.out' },
      0.4
    )
    return () => tl.kill()
  }, [started])

  useEffect(() => {
    if (!started) return
    let role = 0, char = 0, deleting = false, timer

    const tick = () => {
      const full = ROLES[role]
      if (!deleting) {
        char++
        setTyped(full.slice(0, char))
        if (char === full.length) {
          deleting = true
          timer = setTimeout(tick, 2400)
          return
        }
        timer = setTimeout(tick, 48)
      } else {
        char--
        setTyped(full.slice(0, char))
        if (char === 0) {
          deleting = false
          role = (role + 1) % ROLES.length
        }
        timer = setTimeout(tick, 22)
      }
    }
    timer = setTimeout(tick, 900)
    return () => clearTimeout(timer)
  }, [started])

  return (
    <section className="hero" id="hero">
      <div ref={circleRef}>
        <MagicCircle className="hero-circle" />
      </div>

      <div className="hero-content" ref={contentRef}>
        <p className="hero-epigraph" data-hero-reveal>✦ The Codex of ✦</p>
        <h1 className="hero-name" data-hero-reveal>
          Paras <span className="gold">Motwani</span>
        </h1>
        <p className="hero-role" data-hero-reveal>
          {typed}<span className="caret" />
        </p>
        <div className="hero-status" data-hero-reveal>
          <span className="wax" />
          Available for opportunities · Jaipur, IN
        </div>
        <div className="hero-cta" data-hero-reveal>
          <button className="btn solid" data-hover data-magnetic onClick={() => scrollTo('#artifacts')}>
            The Artifacts
          </button>
          <button className="btn" data-hover data-magnetic onClick={() => scrollTo('#summoning')}>
            The Summoning
          </button>
        </div>
      </div>

      <div className="hero-foot">
        <span>Scroll to turn the page</span>
        <div className="quill" />
      </div>
    </section>
  )
}
