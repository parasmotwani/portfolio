import { useState, useEffect, useRef } from 'react'
import { useScroll } from '../hooks/useScrollProgress'

const SECTIONS = [
  { id: 'hero', label: 'Home', num: '00' },
  { id: 'about', label: 'About', num: '01' },
  { id: 'skills', label: 'Skills', num: '02' },
  { id: 'playground', label: 'Playground', num: '03' },
  { id: 'projects', label: 'Work', num: '04' },
  { id: 'experience', label: 'Experience', num: '05' },
  { id: 'contact', label: 'Contact', num: '06' },
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
          PM<span className="dot">.</span>
        </div>
        <div className="nav-indicator">
          {active.num} — {active.label}
        </div>
        <ul className={`nav-links${mobileOpen ? ' open' : ''}`}>
          {SECTIONS.slice(1).map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={active.id === id ? 'active' : ''}
                data-hover
                onClick={(e) => handleClick(e, id)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
      </nav>
    </>
  )
}
