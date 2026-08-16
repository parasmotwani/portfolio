import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useDevice } from '../hooks/useDevice'
import { journey } from '../scene/journey'
import { plateStyle } from '../scene/plate'
import Reach from './Reach'
import { PROJECTS as projects } from '../scene/projects'
import { projectAt } from '../scene/RoomCopy'

gsap.registerPlugin(ScrollTrigger)

export default function Projects() {
  const outerRef = useRef(null)
  const trackRef = useRef(null)
  const shadeRef = useRef(null)
  const { immersive } = useDevice()

  useEffect(() => {
    if (!immersive) return

    const track = trackRef.current
    const getDistance = () => track.scrollWidth - window.innerWidth

    // one pinned pass: dark → gallery slides sideways → dark again,
    // so the room has both a way in and a way out
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: outerRef.current,
        start: 'top top',
        end: () => `+=${getDistance() + window.innerHeight * 0.7}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        // room IV of the manor — the gallery the camera walks along
        onUpdate: (self) => { journey.t = 4 + self.progress },
      },
    })
    tl.to(track, { x: () => -getDistance(), ease: 'none', duration: 0.78 }, 0.08)

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [immersive])

  // In the room the board shows one project at a time and scrolling walks
  // along the wall, so the control here just opens whichever one the
  // visitor is standing in front of. The cards stay in the DOM for screen
  // readers, search and the static track — hidden, not deleted.
  const openCurrent = () => {
    const frac = Math.max(0, Math.min(0.999, journey.t - 4))
    const p = projects[projectAt(frac, projects.length)]
    if (p) window.open(p.github, '_blank', 'noopener')
  }

  return (
    <div className="pin-slot">
      {immersive && (
        <Reach name="project" onClick={openCurrent} label="View this project on GitHub" title="View on GitHub" />
      )}
    <section
      className={`artifacts-outer${immersive ? ' chapter--diegetic' : ' chapter--plated'}`}
      id="projects"
      ref={outerRef}
      style={immersive ? undefined : plateStyle(4)}
    >
      <div className="room-shade" ref={shadeRef} aria-hidden="true" />
      <div className="chapter" style={{ minHeight: 'unset', paddingBottom: 36 }}>
        <header className="chapter-head" style={{ marginBottom: 0 }}>
          <span className="chapter-numeral">Room IV</span>
          <h2 className="chapter-title">Projects</h2>
          <p className="chapter-sub">A gallery nobody dusted. Scroll, and it moves sideways.</p>
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
              data-magnetic
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
    </div>
  )
}
