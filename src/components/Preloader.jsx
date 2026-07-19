import { useEffect, useState } from 'react'
import { useScroll } from '../hooks/useScrollProgress'
import { useLight } from '../context/LightContext'

// No loading screen — the dark IS the loading screen. The site starts
// instantly; heavy scenes stream in behind the darkness while the
// visitor hunts for the switch. The only ceremony: the first click
// strikes their lantern. Devices that start lit skip all of it.
export default function Preloader() {
  const { start } = useScroll()
  const { lantern, lightLantern } = useLight()
  const [enabled] = useState(() => !lantern)
  const [gone, setGone] = useState(false)

  useEffect(() => { start() }, [start])

  useEffect(() => {
    if (!enabled) return
    if (lantern) {
      const t = setTimeout(() => setGone(true), 1400)
      return () => clearTimeout(t)
    }
    const strike = () => lightLantern()
    window.addEventListener('pointerdown', strike, { once: true })
    window.addEventListener('keydown', strike, { once: true })
    return () => {
      window.removeEventListener('pointerdown', strike)
      window.removeEventListener('keydown', strike)
    }
  }, [enabled, lantern])

  if (!enabled || gone) return null
  return (
    <div className={`strike-veil${lantern ? ' struck' : ''}`} role="status">
      <p className="strike-hint">pitch dark — <span>click</span> to strike your lantern</p>
    </div>
  )
}
