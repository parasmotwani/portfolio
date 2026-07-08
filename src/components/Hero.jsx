import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { useScroll } from '../hooks/useScrollProgress'
import { useLight } from '../context/LightContext'
import Cobweb from './Cobweb'

const ROLES = [
  'AI & Data Science Engineer',
  'Building agentic AI systems',
  'Data pipelines at production scale',
]

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
      <Cobweb corner="tl" size={190} />
      <Cobweb corner="br" size={130} />

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
          This house holds the rest: open the drawer, play the old
          machine, read the walls.
        </p>
      </div>

      {!lit && (
        <div className="hero-switch-hint" aria-hidden="true">
          find the switch <span className="arrow">↗</span>
        </div>
      )}

      <div className="hero-foot">
        <span>scroll — the next room is below</span>
        <div className="quill" />
      </div>
    </section>
  )
}
