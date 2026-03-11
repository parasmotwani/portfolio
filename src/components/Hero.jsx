import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import HeroScene from './HeroScene'
import { usePerformance } from '../context/PerformanceContext'

export default function Hero() {
  const [visible, setVisible] = useState(true)
  const heroRef = useRef(null)
  const { lowPower } = usePerformance()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    if (heroRef.current) observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="hero" id="hero" ref={heroRef}>
      <div className="hero-canvas">
        {visible && !lowPower && <HeroScene />}
      </div>
      {lowPower && <div className="hero-static-bg" />}
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="dot" />
          Employed
        </motion.div>

        <h1 className="hero-name">
          <span className="gradient-text">Paras</span> Motwani
        </h1>

        <motion.p
          className="hero-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          AI & Data Science Engineer
        </motion.p>

        <motion.div
          className="hero-cta-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <a href="#projects" className="btn-primary" onClick={(e) => {
            e.preventDefault()
            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
          }}>
            View Projects ↓
          </a>
          <a href="#contact" className="btn-secondary" onClick={(e) => {
            e.preventDefault()
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
          }}>
            Get In Touch
          </a>
        </motion.div>
      </motion.div>

      <div className="scroll-indicator">
        <span>Scroll</span>
        <div className="line" />
      </div>
    </section>
  )
}
