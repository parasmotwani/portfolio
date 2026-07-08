import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePerformance } from '../context/PerformanceContext'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    title: 'Contract Intelligence System',
    description: 'Databricks contract intelligence platform: large-scale document ingestion across 13 waves, 200–500 contracts per wave. Toggle-driven notebooks with Delta table persistence across 3+ pipeline stages.',
    tech: ['Python', 'Databricks', 'LLMs', 'Delta Lake'],
    github: 'https://github.com/parasmotwani',
  },
  {
    title: 'Automated SAP Invoice Validation',
    description: 'End-to-end autonomous browser workflow for SAP invoice validation using Amazon NovaAct. Upstream pipelines across 6 AWS services for zero-touch SAP interactions post-ingestion.',
    tech: ['Python', 'AWS', 'Textract', 'Bedrock', 'NovaAct'],
    github: 'https://github.com/parasmotwani/agentic_ai_invoice_validator',
  },
  {
    title: 'Crypto Matching Engine',
    description: 'Real-time trading pipeline handling 62K+ orders/sec with optimized concurrency. 3 modular ETL flows for ingesting, validating, and streaming trade data with automated PyTest checks.',
    tech: ['Python', 'FastAPI', 'WebSocket', 'PyTest'],
    github: 'https://github.com/parasmotwani/crypto-exchange-matching-engine',
  },
  {
    title: 'Agentic AI Tutor',
    description: 'AI-powered tutoring system delivering interactive, personalized learning through agentic AI workflows.',
    tech: ['Python', 'AI Agents', 'LLMs'],
    github: 'https://github.com/parasmotwani/agentic_ai_tutor',
  },
  {
    title: 'Hybrid Recommendation System',
    description: 'Content-based + collaborative filtering hybrid recommending top-10 products per user with improved accuracy over either approach alone.',
    tech: ['Python', 'Scikit-learn', 'Pandas', 'ML'],
    github: 'https://github.com/parasmotwani/hybrid-recommendation-system',
  },
  {
    title: 'SkimLit — NLP Paper Classifier',
    description: 'NLP model classifying sentences in medical research abstracts — making literature skimming faster for researchers.',
    tech: ['Python', 'TensorFlow', 'NLP', 'Deep Learning'],
    github: 'https://github.com/parasmotwani/Skim_Lit_NLP',
  },
]

export default function Projects() {
  const outerRef = useRef(null)
  const trackRef = useRef(null)
  const { lowPower } = usePerformance()

  useEffect(() => {
    const isMobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isMobile || reduced || lowPower) return

    const track = trackRef.current
    const getDistance = () => track.scrollWidth - window.innerWidth

    const tween = gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: outerRef.current,
        start: 'top top',
        end: () => `+=${getDistance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [lowPower])

  return (
    <section className="artifacts-outer" id="projects" ref={outerRef}>
      <div className="chapter" style={{ minHeight: 'unset', paddingBottom: 36 }}>
        <header className="chapter-head" style={{ marginBottom: 0 }}>
          <span className="chapter-numeral">Chapter IV</span>
          <h2 className="chapter-title">Projects</h2>
          <p className="chapter-sub">Selected work — scroll, and the gallery moves sideways</p>
          <div className="orn-rule"><span className="gem" /></div>
        </header>
      </div>
      <div className="artifacts-viewport">
        <div className="artifacts-track" ref={trackRef}>
          {projects.map((project, i) => (
            <article
              key={project.title}
              className="artifact-card"
              data-hover
              onClick={() => window.open(project.github, '_blank', 'noopener')}
            >
              <div className="artifact-idx">
                {String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
              </div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="artifact-tech">
                {project.tech.map((t) => <span key={t}>{t}</span>)}
              </div>
              <span className="artifact-link">View on GitHub →</span>
            </article>
          ))}
        </div>
      </div>
      <div style={{ height: 'clamp(60px, 10vh, 120px)' }} />
    </section>
  )
}
