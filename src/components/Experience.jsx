import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  })
}

const experiences = [
  {
    role: 'Data Science Intern',
    company: 'Celebal Technologies',
    type: 'On-Site',
    date: 'Oct 2025 – Present',
    points: [
      'Developed a Databricks-based contract intelligence system supporting large-scale document ingestion, metadata processing, and search pipelines.',
      'Implemented a proof-of-concept for automated SAP invoice validation using AWS-based document ingestion, OCR, and structured data extraction.',
    ],
  },
  {
    role: 'AI Research Intern',
    company: 'Coding Jr',
    type: 'Remote',
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
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section" id="experience" ref={ref}>
      <motion.h2
        className="section-title gradient-text"
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        Experience
      </motion.h2>
      <motion.p
        className="section-subtitle"
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        My professional journey in AI and data science.
      </motion.p>

      <div className="timeline">
        {experiences.map((exp, i) => (
          <motion.div
            key={exp.role}
            className="timeline-item"
            variants={fadeUp}
            custom={2 + i}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <div className="timeline-dot" />
            <div className="timeline-date">{exp.date}</div>
            <div className="timeline-content">
              <h3>{exp.role}</h3>
              <span className="company">{exp.company} · {exp.type}</span>
              <ul>
                {exp.points.map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="certifications-section"
        variants={fadeUp}
        custom={5}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <h3 style={{ fontSize: '1.4rem', marginBottom: 24 }}>
          <span className="gradient-text">Certifications</span>
        </h3>
        <div className="cert-grid">
          {certifications.map((cert) => (
            <span key={cert.name} className="cert-badge">
              {cert.name}
              <span className="cert-issuer">· {cert.issuer}</span>
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
