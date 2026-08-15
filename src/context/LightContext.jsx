import { createContext, useContext, useEffect, useState } from 'react'
import { useDevice } from '../hooks/useDevice'

// Power state of the house. An immersive visit starts in the dark — that's
// the experience. Static visits are always lit: there is no hovering cursor
// to carry a torch with, and the plates are baked lit.
const LightContext = createContext()

export function useLight() {
  return useContext(LightContext)
}

export function LightProvider({ children }) {
  const { immersive } = useDevice()
  const [switched, setSwitched] = useState(false)

  // The visitor arrives already carrying a lit lantern — nobody is ever
  // shown a black screen and asked to guess. The faint carried pool is the
  // whole invitation: enough to see that the room needs light, and to go
  // find the hook. Hanging it is what lights the house.
  const lantern = true

  // derived rather than stored, so a resize across the breakpoint can never
  // strand a static visitor in a dark room they have no way to light
  const lit = switched || !immersive

  useEffect(() => {
    document.documentElement.classList.toggle('lights-on', lit)
    document.documentElement.classList.toggle('lights-off', !lit)
  }, [lit])

  return (
    <LightContext.Provider
      value={{ lit, setLit: setSwitched, lantern, lightLantern: () => {} }}
    >
      {children}
    </LightContext.Provider>
  )
}
