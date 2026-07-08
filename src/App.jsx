import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import WorldGame from './components/WorldGame'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import PerformanceToggle from './components/PerformanceToggle'
import SceneCanvas from './scene/SceneCanvas'
import { ScrollProvider } from './hooks/useScrollProgress'
import { PerformanceProvider } from './context/PerformanceContext'

export default function App() {
  return (
    <PerformanceProvider>
      <ScrollProvider>
        <Preloader />
        <SceneCanvas />
        <div className="app">
          <Navbar />
          <Hero />
          <About />
          <Skills />
          <WorldGame />
          <Projects />
          <Experience />
          <Contact />
          <footer className="footer">
            <p className="colophon">Thanks for reading.</p>
            <p className="fine">© 2026 Paras Motwani · Built with React, GSAP & Three.js</p>
          </footer>
        </div>
        <PerformanceToggle />
        <Cursor />
      </ScrollProvider>
    </PerformanceProvider>
  )
}
