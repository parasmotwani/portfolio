import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScroll } from '../hooks/useScrollProgress'
import { useLight } from '../context/LightContext'
import { heroState } from '../scene/heroState'

gsap.registerPlugin(ScrollTrigger)

const ROLES = [
  'AI & Data Science Engineer',
  'Building agentic AI systems',
  'Data pipelines at production scale',
]

export default function Hero() {
  const { started } = useScroll()
  const { lit } = useLight()
  const [typed, setTyped] = useState('')
  const ref = useRef(null)
  const contentRef = useRef(null)

  // pinned first-person exit: scroll scrubs heroState.p, the 3D camera
  // is drawn out through the opening, and the text slips past the viewer
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches
    if (reduced || mobile) {
      heroState.p = 0
      return
    }

    const foot = ref.current.querySelector('.hero-foot')

    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: '+=170%',
      pin: true,
      scrub: 0.4,
      onUpdate: (self) => {
        const p = self.progress
        heroState.p = p
        heroState.active = p < 0.999
        // text slips past the viewer as the walk begins — driven here so
        // it can never desync from the pin (a second ScrollTrigger would
        // measure against the pin spacer and drift)
        // zoom-out: the name shrinks and sinks with the receding room
        const f = Math.min(1, Math.max(0, (p - 0.3) / 0.32))
        if (contentRef.current) {
          contentRef.current.style.opacity = String(1 - f)
          contentRef.current.style.transform = `scale(${1 - f * 0.38}) translateY(${f * 60}px)`
          contentRef.current.style.filter = `blur(${f * 6}px)`
        }
        if (foot) foot.style.opacity = String(1 - Math.min(1, p / 0.25))
      },
    })

    return () => st.kill()
  }, [])

  useEffect(() => {
    if (!started) return
    const items = document.querySelectorAll('[data-hero-reveal]')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      gsap.set(items, { opacity: 1, y: 0 })
      return
    }
    const tl = gsap.timeline()
    tl.fromTo(items,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 1.1, stagger: 0.16, ease: 'power3.out' },
      0.3
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
    <section className="hero" id="hero" ref={ref}>
      <div className="hero-content" ref={contentRef}>
        <p className="hero-epigraph" data-hero-reveal>
          {lit ? 'someone still lives here…' : 'the lights are out'}
        </p>
        <h1 className="hero-name" data-hero-reveal>
          Paras<br />Motwani
        </h1>
        <p className="hero-role" data-hero-reveal>
          {typed}<span className="caret" />
        </p>
        <p className="hero-summary" data-hero-reveal>
          I build intelligent systems — agentic AI workflows, contract
          intelligence on Databricks, autonomous pipelines on AWS.
          Computer Science graduate, Manipal University Jaipur.
          The house holds the rest. Look carefully.
        </p>
      </div>

      <div className="hero-foot">
        <span>scroll — leave the room when you're ready</span>
        <div className="quill" />
      </div>
    </section>
  )
}
