import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useScroll } from '../hooks/useScrollProgress'

const ROLES = [
  'AI & Data Science Engineer',
  'Building agentic AI systems',
  'Turning data into decisions',
]

const lineReveal = {
  hidden: { y: '110%' },
  visible: (i) => ({
    y: 0,
    transition: { delay: 0.15 + i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function Hero() {
  const { started, scrollTo } = useScroll()
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (!started) return
    let role = 0
    let char = 0
    let deleting = false
    let timer

    const tick = () => {
      const full = ROLES[role]
      if (!deleting) {
        char++
        setTyped(full.slice(0, char))
        if (char === full.length) {
          deleting = true
          timer = setTimeout(tick, 2200)
          return
        }
        timer = setTimeout(tick, 45)
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
    timer = setTimeout(tick, 600)
    return () => clearTimeout(timer)
  }, [started])

  return (
    <section className="hero" id="hero" data-scene>
      <motion.div
        className="hero-topline"
        initial={{ opacity: 0 }}
        animate={started ? { opacity: 1 } : {}}
        transition={{ delay: 0.1, duration: 0.8 }}
      >
        <span className="status-dot" />
        <span>Available for opportunities</span>
        <span style={{ color: 'var(--text-mute)' }}>/ Jaipur, IN</span>
      </motion.div>

      <h1 className="hero-name">
        <span className="line">
          <motion.span
            variants={lineReveal}
            custom={0}
            initial="hidden"
            animate={started ? 'visible' : 'hidden'}
          >
            Paras
          </motion.span>
        </span>
        <span className="line">
          <motion.span
            variants={lineReveal}
            custom={1}
            initial="hidden"
            animate={started ? 'visible' : 'hidden'}
          >
            Motwani<span className="red">.</span>
          </motion.span>
        </span>
      </h1>

      <p className="hero-role">
        <span className="red">&gt;</span> {typed}
        <span className="caret" />
      </p>

      <motion.div
        style={{ display: 'flex', gap: 16, marginTop: 48, flexWrap: 'wrap' }}
        initial={{ opacity: 0, y: 20 }}
        animate={started ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="btn solid" data-hover data-magnetic onClick={() => scrollTo('#projects')}>
          View Work
        </button>
        <button className="btn" data-hover data-magnetic onClick={() => scrollTo('#contact')}>
          Get in Touch
        </button>
      </motion.div>

      <div className="hero-bottom">
        <div className="hero-meta">
          <div>Databricks · AWS · LLMs</div>
          <div>B.Tech CSE — Manipal University Jaipur</div>
        </div>
        <div className="scroll-hint">
          <span>Scroll to explore</span>
          <div className="track" />
        </div>
      </div>
    </section>
  )
}
