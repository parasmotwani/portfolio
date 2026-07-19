import { createContext, useContext, useEffect, useState } from 'react'

// Power state of the house. Every visit starts in the dark (that's the
// experience) — except touch devices and reduced-motion, which start lit
// because a cursor-torch doesn't work there.
const LightContext = createContext()

export function useLight() {
  return useContext(LightContext)
}

export function LightProvider({ children }) {
  const [lit, setLit] = useState(() => {
    if (typeof window === 'undefined') return true
    const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return touch || reduced
  })
  // the visitor's own light: struck on the first click in the dark.
  // Devices that start lit never need to strike it.
  const [lantern, setLantern] = useState(() => {
    if (typeof window === 'undefined') return true
    const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return touch || reduced
  })

  useEffect(() => {
    document.documentElement.classList.toggle('lights-on', lit)
    document.documentElement.classList.toggle('lights-off', !lit)
  }, [lit])

  return (
    <LightContext.Provider value={{ lit, setLit, lantern, lightLantern: () => setLantern(true) }}>
      {children}
    </LightContext.Provider>
  )
}
