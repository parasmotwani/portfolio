import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { useScroll } from '../hooks/useScrollProgress'
import { useLight } from '../context/LightContext'
import Cobweb from './Cobweb'
import Spider from './Spider'

const ROLES = [
  'AI & Data Science Engineer',
  'Building agentic AI systems',
  'Data pipelines at production scale',
]

// loose threads hanging from the ceiling, sagging between anchor points
function WebStrands() {
  return (
    <svg className="web-strands" viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <path d="M0 0 Q 110 96 240 12" />
        <path d="M180 0 Q 300 70 430 8" />
        <path d="M990 0 Q 1105 88 1230 10" />
        <path d="M1180 0 Q 1300 64 1440 18" />
        <path d="M60 20 L 60 78" strokeDasharray="2 5" />
        <path d="M1120 14 L 1120 92" strokeDasharray="2 5" />
      </g>
    </svg>
  )
}

// a bulb on a cord — dead while the power is out, warm and swaying after
function HangingBulb({ lit }) {
  return (
    <div className={`bulb-rig${lit ? ' lit' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 40 130">
        <line x1="20" y1="0" x2="20" y2="86" stroke="currentColor" strokeWidth="1.2" />
        <rect x="15" y="86" width="10" height="10" fill="currentColor" />
        <circle className="bulb-glass" cx="20" cy="106" r="11" />
        <path d="M16 100 Q20 108 24 100" stroke="currentColor" strokeWidth="0.8" fill="none" />
      </svg>
    </div>
  )
}

export default function Hero() {
  const { started } = useScroll()
  const { lit } = useLight()
  const [typed, setTyped] = useState('')

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
    <section className="hero room" id="hero">
      <WebStrands />
      <HangingBulb lit={lit} />
      <Cobweb corner="tl" size={230} />
      <Cobweb corner="tr" size={170} />
      <Cobweb corner="br" size={150} />
      <Spider left="16%" delay={4} />

      <div className="hero-content">
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
        <span>scroll — the next room is below</span>
        <div className="quill" />
      </div>
    </section>
  )
}
