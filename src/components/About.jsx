import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
}

const stats = [
  { value: 16, suffix: '+', label: 'Projects' },
  { value: 2, suffix: '', label: 'Internships' },
  { value: 9, suffix: '+', label: 'Certifications' },
  { value: 2025, suffix: '', label: 'B.Tech Graduate' },
]

const education = [
  {
    degree: 'B.Tech in Computer Science & Engineering',
    school: 'Manipal University Jaipur',
    date: 'Oct 2021 – Jul 2025 · Jaipur, Rajasthan',
  },
  {
    degree: 'Senior Secondary (12th) — 92.75%',
    school: 'Academic World School',
    date: 'Mar 2020 – Jul 2021 · Bemetara, Chhattisgarh',
  },
]

export default function About() {
  const ref = useRef(null)
  const statsRef = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!statsRef.current) return
    const values = statsRef.current.querySelectorAll('.stat-value .num')
    const triggers = []
    values.forEach((el) => {
      const target = Number(el.dataset.target)
      const obj = { v: 0 }
      triggers.push(
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => { el.textContent = Math.round(obj.v) },
        })
      )
    })
    return () => triggers.forEach((t) => t.scrollTrigger?.kill())
  }, [])

  return (
    <section className="section" id="about" ref={ref} data-scene>
      <div className="section-head">
        <span className="section-num">01</span>
        <h2 className="section-title">About</h2>
        <span className="section-sub">The data behind the developer</span>
      </div>

      <div className="about-grid">
        <div>
          <motion.p
            className="about-lede"
            variants={fadeUp} custom={0} initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            I build <span className="red">intelligent systems</span> — from agentic
            AI workflows to real-time data pipelines that move at production scale.
          </motion.p>
          <motion.p
            className="about-body"
            variants={fadeUp} custom={1} initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            Computer Science graduate from Manipal University Jaipur, focused on
            Artificial Intelligence, Data Science, and Generative AI. From contract
            intelligence on Databricks to autonomous SAP workflows on AWS, I turn
            complex problems into clean, automated solutions. Co-founded a gamified
            ed-tech startup; won top honors at The Startup Mela 2.0, Jaipur.
          </motion.p>

          <motion.div
            className="stats-row"
            ref={statsRef}
            variants={fadeUp} custom={2} initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <div className="stat-value">
                  <span className="num" data-target={s.value}>0</span>
                  <span className="plus">{s.suffix}</span>
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="edu-list">
          {education.map((edu, i) => (
            <motion.div
              className="edu-item" key={edu.degree}
              variants={fadeUp} custom={2 + i} initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <h4>{edu.degree}</h4>
              <div className="edu-school">{edu.school}</div>
              <div className="edu-date">{edu.date}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
