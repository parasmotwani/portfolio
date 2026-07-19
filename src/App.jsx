import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import DrawerRoom from './components/DrawerRoom'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Preloader from './components/Preloader'
import Flashlight from './components/Flashlight'
import LightSwitch from './components/LightSwitch'
import HouseFlicker from './components/HouseFlicker'
import Whisper from './components/Whisper'
import PerformanceToggle from './components/PerformanceToggle'
import SceneCanvas from './scene/SceneCanvas'
import { ScrollProvider } from './hooks/useScrollProgress'
import { PerformanceProvider } from './context/PerformanceContext'
import { LightProvider } from './context/LightContext'

// the game streams in behind the darkness — nobody reaches Room III
// in the first seconds of a visit
const WorldGame = lazy(() => import('./components/WorldGame'))

export default function App() {
  return (
    <PerformanceProvider>
      <LightProvider>
        <ScrollProvider>
          <Preloader />
          <SceneCanvas />
          <div className="app">
            <Navbar />
            <Whisper />
            <Hero />
            <DrawerRoom />
            <Skills />
            {/* stable slot: GSAP pin-spacers reparent siblings, so the lazy
                swap must happen inside a node React fully owns */}
            <div className="world-slot">
              <Suspense fallback={<section id="world" style={{ minHeight: '50vh' }} />}>
                <WorldGame />
              </Suspense>
            </div>
            <Projects />
            <Experience />
            <Contact />
            <footer className="footer">
              <p className="colophon">You can leave now. Thanks for visiting.</p>
              <p className="fine">© 2026 Paras Motwani · Built with React, GSAP & Three.js</p>
            </footer>
          </div>
          <LightSwitch />
          <Flashlight />
          <HouseFlicker />
          <PerformanceToggle />
        </ScrollProvider>
      </LightProvider>
    </PerformanceProvider>
  )
}
