import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  })
}

const skillCategories = [
  {
    icon: '⚡',
    title: 'Languages & Frameworks',
    skills: ['Python', 'SQL', 'FastAPI', 'Go'],
  },
  {
    icon: '📊',
    title: 'Libraries & Data',
    skills: ['NumPy', 'Pandas', 'Scikit-learn', 'Matplotlib', 'Seaborn', 'BeautifulSoup', 'MySQL', 'PostgreSQL'],
  },
  {
    icon: '☁️',
    title: 'Cloud & DevOps',
    skills: ['AWS', 'Docker', 'Git', 'Jenkins', 'Databricks'],
  },
]

export default function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section" id="skills" ref={ref}>
      <motion.h2
        className="section-title gradient-text"
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        Skills & Tools
      </motion.h2>
      <motion.p
        className="section-subtitle"
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        Technologies I work with daily to build intelligent systems.
      </motion.p>

      <div className="skills-grid">
        {skillCategories.map((cat, i) => (
          <motion.div
            key={cat.title}
            className="skill-category"
            variants={fadeUp}
            custom={2 + i}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <span className="skill-icon">{cat.icon}</span>
            <h3>{cat.title}</h3>
            <div className="skill-tags">
              {cat.skills.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
