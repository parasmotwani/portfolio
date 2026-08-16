import { lazy, Suspense, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import DrawerRoom from './components/DrawerRoom'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Flashlight from './components/Flashlight'
import LanternHook from './components/LanternHook'
import HouseFlicker from './components/HouseFlicker'
import Whisper from './components/Whisper'
import Cursor from './components/Cursor'
import PerformanceToggle from './components/PerformanceToggle'
import { ScrollProvider, useScroll } from './hooks/useScrollProgress'
import { PerformanceProvider } from './context/PerformanceContext'
import { DeviceProvider, useDevice } from './hooks/useDevice'
import { LightProvider } from './context/LightContext'

// the game streams in behind the darkness — nobody reaches Room III
// in the first seconds of a visit
const WorldGame = lazy(() => import('./components/WorldGame'))

// three.js and the whole scene graph live behind this boundary so a static
// visit never downloads them — the chunk is ~1 MB on the devices least able
// to afford it
const SceneCanvas = lazy(() => import('./scene/SceneCanvas'))

function Manor() {
  const { immersive } = useDevice()
  const { start } = useScroll()

  // scroll was previously locked until the visitor struck a light; they now
  // arrive carrying one, so there is nothing to wait for
  useEffect(() => { start() }, [start])

  return (
    <>
      {immersive ? (
        <Suspense fallback={<div className="static-bg" />}>
          <SceneCanvas />
        </Suspense>
      ) : (
        <div className="static-bg" />
      )}
      <div className="app">
        <Navbar />
        {immersive && <Whisper />}
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
      {immersive && (
        <>
          <LanternHook />
          <Flashlight />
          <HouseFlicker />
          <Cursor />
        </>
      )}
      <PerformanceToggle />
    </>
  )
}

export default function App() {
  return (
    <PerformanceProvider>
      <DeviceProvider>
        <LightProvider>
          <ScrollProvider>
            <Manor />
          </ScrollProvider>
        </LightProvider>
      </DeviceProvider>
    </PerformanceProvider>
  )
}
