import { createContext, useContext, useEffect, useState } from 'react'
import { usePerformance } from '../context/PerformanceContext'

// The one answer to "which experience is this visitor getting".
//
//   immersive — the live manor: one Canvas, the camera journey, the torch
//   static    — the same rooms as baked plates: no Canvas, no pins, no torch
//
// Every branch in the app reads `mode` from here. Nothing re-derives the
// matchMedia checks locally: a visitor who is `static` for the plates but
// `immersive` for the pins would get a room that scrolls against a still.
const DeviceContext = createContext(null)

export function useDevice() {
  return useContext(DeviceContext)
}

function readTraits() {
  if (typeof window === 'undefined') return { coarse: true, reduced: true, small: true }
  return {
    coarse: window.matchMedia('(hover: none), (pointer: coarse)').matches,
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    small: window.innerWidth < 768,
  }
}

export function DeviceProvider({ children }) {
  const { lowPower } = usePerformance()
  const [traits, setTraits] = useState(readTraits)

  useEffect(() => {
    // a window opened small then maximized must gain the manor, and a
    // laptop that grows a touchscreen must lose it
    const update = () => setTraits(readTraits())
    const queries = [
      window.matchMedia('(hover: none), (pointer: coarse)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ]
    window.addEventListener('resize', update)
    queries.forEach((q) => q.addEventListener('change', update))
    return () => {
      window.removeEventListener('resize', update)
      queries.forEach((q) => q.removeEventListener('change', update))
    }
  }, [])

  const immersive = !traits.coarse && !traits.reduced && !traits.small && !lowPower

  const value = {
    ...traits,
    lowPower,
    immersive,
    mode: immersive ? 'immersive' : 'static',
    dust: immersive ? 260 : 0,
  }

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
}
