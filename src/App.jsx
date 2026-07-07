import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Playground from './components/Playground'
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
          <Playground />
          <Projects />
          <Experience />
          <Contact />
          <footer className="footer">
            <span>© 2026 Paras Motwani</span>
            <span>Designed & built in React + Three.js</span>
          </footer>
        </div>
        <PerformanceToggle />
        <Cursor />
      </ScrollProvider>
    </PerformanceProvider>
  )
}
