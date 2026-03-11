import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  })
}

const projects = [
  {
    title: 'Contract Intelligence System',
    description: 'Databricks-based contract intelligence platform supporting large-scale document ingestion across 13 waves with 200–500 contracts per wave. Toggle-driven notebooks for testing/production control with Delta table persistence across 3+ pipeline stages.',
    tech: ['Python', 'Databricks', 'LLMs', 'Delta Lake'],
    github: 'https://github.com/parasmotwani',
  },
  {
    title: 'Automated SAP Invoice Validation',
    description: 'End-to-end autonomous browser-based workflow for SAP invoice validation using Amazon NovaAct. Built upstream pipelines with 6 AWS services for 0-touch SAP interactions post-ingestion.',
    tech: ['Python', 'AWS', 'Textract', 'Bedrock', 'NovaAct'],
    github: 'https://github.com/parasmotwani/agentic_ai_invoice_validator',
  },
  {
    title: 'Crypto Matching Engine',
    description: 'Real-time trading data pipeline handling 62K+ orders/sec with optimized concurrency. 3 modular ETL flows for ingesting, validating, and streaming structured trade data with automated PyTest checks.',
    tech: ['Python', 'FastAPI', 'WebSocket', 'PyTest'],
    github: 'https://github.com/parasmotwani/crypto-exchange-matching-engine',
  },
  {
    title: 'Agentic AI Tutor',
    description: 'An intelligent AI-powered tutoring system designed to provide interactive, personalized learning experiences using agentic AI workflows.',
    tech: ['Python', 'AI Agents', 'LLMs'],
    github: 'https://github.com/parasmotwani/agentic_ai_tutor',
  },
  {
    title: 'Hybrid Recommendation System',
    description: 'Content-based filtering combined with collaborative filtering to recommend top 10 products for users, leveraging hybrid approaches for improved accuracy.',
    tech: ['Python', 'Scikit-learn', 'Pandas', 'ML'],
    github: 'https://github.com/parasmotwani/hybrid-recommendation-system',
  },
  {
    title: 'SkimLit — NLP Paper Classifier',
    description: 'NLP model for classifying sentences in medical research abstracts, making literature skimming faster and more efficient for researchers.',
    tech: ['Python', 'TensorFlow', 'NLP', 'Deep Learning'],
    github: 'https://github.com/parasmotwani/Skim_Lit_NLP',
  },
]

export default function Projects() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section" id="projects" ref={ref}>
      <motion.h2
        className="section-title gradient-text"
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        Featured Projects
      </motion.h2>
      <motion.p
        className="section-subtitle"
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        A selection of projects that showcase my expertise in AI, data engineering, and backend systems.
      </motion.p>

      <div className="projects-grid">
        {projects.map((project, i) => (
          <motion.div
            key={project.title}
            className="project-card"
            variants={fadeUp}
            custom={2 + i}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            whileHover={{ scale: 1.02 }}
            onClick={() => window.open(project.github, '_blank')}
          >
            <div className="project-number">0{i + 1}</div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="project-tech">
              {project.tech.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <span className="project-link">
              View on GitHub →
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
