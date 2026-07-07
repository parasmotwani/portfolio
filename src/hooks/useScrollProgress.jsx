import { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ScrollContext = createContext(null)

export function useScroll() {
  return useContext(ScrollContext)
}

export function ScrollProvider({ children }) {
  const lenisRef = useRef(null)
  const progressRef = useRef(0)
  const scrollRef = useRef(0)
  const velocityRef = useRef(0)
  // scroll offsets (px) where each scene state begins; measured from [data-scene] sections
  const boundariesRef = useRef([])
  const [started, setStarted] = useState(false)

  const measure = useCallback(() => {
    const sections = document.querySelectorAll('[data-scene]')
    boundariesRef.current = Array.from(sections).map((el) => {
      const rect = el.getBoundingClientRect()
      return rect.top + window.scrollY
    })
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const lenis = new Lenis({
      duration: reduced ? 0 : 1.15,
      smoothWheel: !reduced,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    lenisRef.current = lenis
    lenis.stop()

    lenis.on('scroll', (e) => {
      scrollRef.current = e.scroll
      velocityRef.current = e.velocity
      const max = document.documentElement.scrollHeight - window.innerHeight
      progressRef.current = max > 0 ? e.scroll / max : 0
      ScrollTrigger.update()
    })

    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    measure()
    const onResize = () => {
      measure()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)
    // re-measure once content/fonts settle
    const t = setTimeout(measure, 600)

    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(raf)
      lenis.destroy()
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [measure])

  const start = useCallback(() => {
    lenisRef.current?.start()
    measure()
    ScrollTrigger.refresh()
    setStarted(true)
  }, [measure])

  const scrollTo = useCallback((target) => {
    // If the target is a pinned scrub chapter, land at the END of its pin
    // span so the content arrives fully inscribed — landing at the start
    // would show a blank page (reveal timeline at progress 0).
    const el = typeof target === 'string' ? document.querySelector(target) : target
    if (el) {
      const st = ScrollTrigger.getAll().find((s) => s.trigger === el && s.pin)
      if (st && el.querySelector('[data-reveal]')) {
        lenisRef.current?.scrollTo(st.end - 1)
        return
      }
    }
    lenisRef.current?.scrollTo(target, { offset: 0 })
  }, [])

  return (
    <ScrollContext.Provider
      value={{ progressRef, scrollRef, velocityRef, boundariesRef, start, started, scrollTo, measure }}
    >
      {children}
    </ScrollContext.Provider>
  )
}
