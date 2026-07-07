import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { sceneState } from '../scene/sceneState'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
}

// cluster index maps to particle clusters in the 3D scene (hover = highlight)
const skillCategories = [
  {
    cluster: 0,
    title: 'Languages & Frameworks',
    skills: ['Python', 'SQL', 'Go', 'FastAPI'],
  },
  {
    cluster: 1,
    title: 'ML & Data',
    skills: ['NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Matplotlib', 'Seaborn'],
  },
  {
    cluster: 2,
    title: 'GenAI & Agents',
    skills: ['LLMs', 'AI Agents', 'RAG', 'Amazon Bedrock', 'Hugging Face'],
  },
  {
    cluster: 3,
    title: 'Data Engineering',
    skills: ['Databricks', 'Delta Lake', 'MySQL', 'PostgreSQL', 'ETL Pipelines'],
  },
  {
    cluster: 4,
    title: 'Cloud & DevOps',
    skills: ['AWS', 'Docker', 'Git', 'Jenkins', 'Vercel'],
  },
]

const CLUSTER_DOTS = ['#f2f2ed', '#c9c9c2', '#e63946', '#a3a39c', '#7a7a73']

export default function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section" id="skills" ref={ref} data-scene>
      <div className="section-head">
        <span className="section-num">02</span>
        <h2 className="section-title">Skills</h2>
        <span className="section-sub">Hover a category — watch the clusters respond</span>
      </div>

      <div className="skills-rows">
        {skillCategories.map((cat, i) => (
          <motion.div
            className="skill-row"
            key={cat.title}
            data-hover
            variants={fadeUp} custom={i} initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            onMouseEnter={() => { sceneState.highlightCluster = cat.cluster }}
            onMouseLeave={() => { sceneState.highlightCluster = -1 }}
          >
            <span
              className="skill-cluster-dot"
              style={{ background: CLUSTER_DOTS[cat.cluster] }}
            />
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
