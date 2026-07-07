import { useState, useEffect, useRef } from 'react'
import { useScroll } from '../hooks/useScrollProgress'

const SECTIONS = [
  { id: 'hero', label: 'Frontispiece', num: '·' },
  { id: 'about', label: 'The Scholar', num: 'I' },
  { id: 'skills', label: 'The Grimoire', num: 'II' },
  { id: 'playground', label: 'Divination', num: 'III' },
  { id: 'artifacts', label: 'Artifacts', num: 'IV' },
  { id: 'chronicle', label: 'Chronicle', num: 'V' },
  { id: 'summoning', label: 'Summoning', num: 'VI' },
]

export default function Navbar() {
  const { scrollTo, progressRef } = useScroll()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState(SECTIONS[0])
  const progressFillRef = useRef(null)

  useEffect(() => {
    let raf
    const loop = () => {
      if (progressFillRef.current) {
        progressFillRef.current.style.transform = `scaleX(${progressRef.current})`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const onScroll = () => {
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id)
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) {
          setActive(SECTIONS[i])
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [progressRef])

  const handleClick = (e, id) => {
    e.preventDefault()
    setMobileOpen(false)
    scrollTo(`#${id}`)
  }

  return (
    <>
      <div className="nav-progress">
        <div className="nav-progress-fill" ref={progressFillRef} />
      </div>
      <nav className="navbar">
        <div className="nav-logo" data-hover onClick={(e) => handleClick(e, 'hero')}>
          P<span className="dot">✦</span>M
        </div>
        <div className="nav-indicator">
          {active.num} — {active.label}
        </div>
        <ul className={`nav-links${mobileOpen ? ' open' : ''}`}>
          {SECTIONS.slice(1).map(({ id, label, num }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={active.id === id ? 'active' : ''}
                data-hover
                onClick={(e) => handleClick(e, id)}
              >
                {num} · {label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? 'Close' : 'Index'}
        </button>
      </nav>
    </>
  )
}
