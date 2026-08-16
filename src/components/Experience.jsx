import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Chapter from './Chapter'

gsap.registerPlugin(ScrollTrigger)

const experiences = [
  {
    role: 'Software Engineer',
    company: 'Celebal Technologies · Jaipur',
    date: 'Jun 2026 – Present',
    points: [
      'Engineered a reusable BFF authentication architecture enabling Microsoft Entra ID users without native Databricks accounts to securely access Databricks Apps, evolving the platform into a centralized App Center.',
      'Built Pluto, an enterprise AI FinOps agent for natural-language querying of cost, usage, forecasting and optimization insights across all Databricks workspaces, powered by Databricks system tables.',
      "Cut Pluto's maximum response time by 96% (236 sec to 8.6 sec) by materializing frequently queried views and engineering hourly data refresh pipelines.",
      'Architecting enterprise MCP security middleware that validates every tool request against organizational security policies before execution, enforcing least-privilege access.',
    ],
  },
  {
    role: 'Data Science Trainee',
    company: 'Celebal Technologies · Jaipur',
    date: 'Feb 2026 – May 2026',
    points: [
      'Removed LLM dependency as a point of failure and cost, cutting execution latency by up to 46% and reducing LLM runtime cost to 0 by replacing agentic decision loops with deterministic Playwright DOM-based automation.',
      'Benchmarked fully LLM-driven, hybrid Playwright+LLM and deterministic Playwright strategies for Oracle Transportation Management, comparing latency, reliability, hallucination risk and operational cost.',
      'Designed a toggle-driven notebook enabling 1-configuration control for test-to-production environment switching, persisting validated outputs into Delta tables across 3+ pipeline stages.',
    ],
  },
  {
    role: 'Data Science Intern',
    company: 'Celebal Technologies · Jaipur',
    date: 'Oct 2025 – Jan 2026',
    points: [
      "Redesigned Lexi, a production chatbot for querying enterprise contracts, consolidating 3 manual notebooks into a single curated workflow processing 27 waves of 20–50 contracts each, with OCR fallback when Databricks' ai_parse_document missed content.",
      'Automated invoice validation end-to-end using Amazon NovaAct (Preview), building upstream pipelines across 6 AWS services to extract and structure invoice data across ingestion, OCR, structuring and SAP execution.',
    ],
  },
  {
    role: 'AI Research Intern',
    company: 'Coding Jr · Remote',
    date: 'Feb 2025 – Jun 2025',
    points: [
      "Built backend workflows for Coding Jr's VS Code extension AI copilot, enabling code rewriting, explanation and test generation on selected code portions.",
      'Delivered 3+ production features for code assistance and documentation querying, directly shaping product capabilities used by developers.',
    ],
  },
]

const certifications = [
  { name: 'Design and Analysis of Algorithms', issuer: 'NPTEL' },
  { name: 'CCNAv7: Enterprise Networking, Security & Automation', issuer: 'Cisco' },
  { name: 'CCNAv7: Switching, Routing & Wireless Essentials', issuer: 'Cisco' },
  { name: 'Getting Started with Enterprise-grade AI', issuer: 'IBM' },
  { name: 'Red Hat System Administration II (RH134)', issuer: 'Red Hat' },
  { name: 'Database Foundations', issuer: 'Oracle Academy' },
  { name: 'Tools for Data Science', issuer: 'Coursera' },
  { name: 'Python Essentials 1', issuer: 'Cisco' },
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
      id="experience"
      room={5}
      numeral="Room V"
      title="Experience"
      subtitle="The records room — everything filed, nothing forgotten"
      pin={false}
      className="room"
    >
      <div className="chronicle" data-diegetic>
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
        <div className="seals-head">✦ Certifications ✦</div>
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
