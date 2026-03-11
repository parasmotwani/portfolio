import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  })
}

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const stats = [
    { number: '16+', label: 'Projects' },
    { number: '2', label: 'Internships' },
    { number: '9+', label: 'Certifications' },
    { number: '2025', label: 'Graduating' },
  ]

  const education = [
    {
      degree: 'B.Tech in Computer Science & Engineering',
      school: 'Manipal University Jaipur',
      date: 'Oct 2021 – Jul 2025',
      location: 'Jaipur, Rajasthan'
    },
    {
      degree: 'Senior Secondary (12th) — 92.75%',
      school: 'Academic World School',
      date: 'Mar 2020 – Jul 2021',
      location: 'Bemetara, Chhattisgarh'
    },
  ]

  return (
    <section className="section" id="about" ref={ref}>
      <motion.h2
        className="section-title gradient-text"
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        About Me
      </motion.h2>
      <motion.p
        className="section-subtitle"
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        Building intelligent systems, one model at a time.
      </motion.p>

      <div className="about-grid">
        <div className="about-text">
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            I'm a Computer Science Engineering graduate from Manipal University Jaipur with a deep
            passion for <strong style={{ color: '#00f0ff' }}>Artificial Intelligence</strong>,{' '}
            <strong style={{ color: '#a855f7' }}>Data Science</strong>, and{' '}
            <strong style={{ color: '#ec4899' }}>Generative AI</strong>.
          </motion.p>
          <motion.p
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            From building agentic AI systems and real-time trading engines to designing
            scalable data pipelines on Databricks and AWS, I love turning complex problems
            into clean, automated solutions. I co-founded a gamified ed-tech startup and
            won top honors at The Startup Mela 2.0, Jaipur.
          </motion.p>

          <div className="about-stats">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                variants={fadeUp}
                custom={4 + i}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
              >
                <div className="stat-number gradient-text">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="about-education">
          {education.map((edu, i) => (
            <motion.div
              key={edu.degree}
              className="edu-card"
              variants={fadeUp}
              custom={5 + i}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <h4>{edu.degree}</h4>
              <div className="edu-school">{edu.school}</div>
              <div className="edu-date">{edu.date} · {edu.location}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
