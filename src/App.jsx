import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Contact from './components/Contact'
import PerformanceToggle from './components/PerformanceToggle'
import { PerformanceProvider } from './context/PerformanceContext'

export default function App() {
  return (
    <PerformanceProvider>
      <div className="app">
        <Navbar />
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
        <footer className="footer">
          <p>
            © 2025 Paras Motwani. Built with <span className="heart">♥</span> and React + Three.js
          </p>
        </footer>
        <PerformanceToggle />
      </div>
    </PerformanceProvider>
  )
}
