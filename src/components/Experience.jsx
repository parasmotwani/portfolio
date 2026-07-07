import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
}

const experiences = [
  {
    role: 'Data Science Intern',
    company: 'Celebal Technologies · On-Site',
    date: 'Oct 2025 – Present',
    points: [
      'Developed a Databricks-based contract intelligence system supporting large-scale document ingestion, metadata processing, and search pipelines.',
      'Implemented a proof-of-concept for automated SAP invoice validation using AWS-based document ingestion, OCR, and structured data extraction.',
    ],
  },
  {
    role: 'AI Research Intern',
    company: 'Coding Jr · Remote',
    date: 'Feb 2025 – Jun 2025',
    points: [
      'Delivered backend features for 3+ AI copilot workflows, including code assistance and documentation querying.',
      'Conducted data research across 20+ unicorns, producing insights that shaped product roadmap priorities.',
    ],
  },
]

const certifications = [
  { name: 'Design & Analysis of Algorithms', issuer: 'NPTEL' },
  { name: 'Enterprise Networking & Security', issuer: 'Cisco' },
  { name: 'Switching, Routing & Wireless', issuer: 'Cisco' },
  { name: 'Enterprise-grade AI', issuer: 'IBM' },
  { name: 'System Administration II', issuer: 'Red Hat' },
  { name: 'Database Foundations', issuer: 'Oracle' },
  { name: 'Tools for Data Science', issuer: 'Coursera' },
  { name: 'Python Essentials', issuer: 'Cisco' },
  { name: 'Fundamentals of Agents', issuer: 'Hugging Face' },
]

export default function Experience() {
  const ref = useRef(null)
  const lineRef = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!lineRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      lineRef.current.style.transform = 'scaleY(1)'
      return
    }
    const tween = gsap.fromTo(
      lineRef.current,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 70%',
          end: 'bottom 60%',
          scrub: 0.5,
        },
      }
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <section className="section" id="experience" ref={ref} data-scene>
      <div className="section-head">
        <span className="section-num">05</span>
        <h2 className="section-title">Experience</h2>
        <span className="section-sub">The professional timeline</span>
      </div>

      <div className="xp-list">
        <div
          className="xp-line"
          ref={lineRef}
          style={{ background: 'linear-gradient(180deg, #e63946, #262626)', transformOrigin: 'top', transform: 'scaleY(0)' }}
        />
        {experiences.map((exp, i) => (
          <motion.div
            className="xp-item" key={exp.role}
            variants={fadeUp} custom={i} initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <div className="xp-date">{exp.date}</div>
            <h3>{exp.role}</h3>
            <span className="xp-company">{exp.company}</span>
            <ul>
              {exp.points.map((point, j) => <li key={j}>{point}</li>)}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="certs">
        <div className="certs-head">Certifications — 09</div>
        <div className="cert-rows">
          {certifications.map((cert) => (
            <div className="cert-row" key={cert.name} data-hover>
              <span className="cert-name">{cert.name}</span>
              <span className="cert-issuer">{cert.issuer}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
