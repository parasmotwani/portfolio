import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Chapter from './Chapter'

gsap.registerPlugin(ScrollTrigger)

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
  const lineRef = useRef(null)

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
          trigger: lineRef.current.parentElement,
          start: 'top 75%',
          end: 'bottom 55%',
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
    <Chapter
      id="chronicle"
      numeral="Chapter V"
      title="The Chronicle"
      subtitle="A record of service, set down in order"
      pin={false}
    >
      <div className="chronicle">
        <div className="chronicle-line" ref={lineRef} />
        {experiences.map((exp) => (
          <div className="chronicle-item" key={exp.role} data-reveal>
            <div className="chronicle-date">{exp.date}</div>
            <h3>{exp.role}</h3>
            <span className="chronicle-company">{exp.company}</span>
            <ul>
              {exp.points.map((point, j) => <li key={j}>{point}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="seals" data-reveal>
        <div className="seals-head">✦ Nine Seals of Study ✦</div>
        <div className="seal-rows">
          {certifications.map((cert) => (
            <div className="seal-row" key={cert.name} data-hover>
              <span className="seal-name">{cert.name}</span>
              <span className="seal-issuer">{cert.issuer}</span>
            </div>
          ))}
        </div>
      </div>
    </Chapter>
  )
}
