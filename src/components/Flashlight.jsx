import { useEffect, useRef } from 'react'
import { useLight } from '../context/LightContext'

// Darkness overlay + torch beam. While the lights are off, a warm beam
// with a soft penumbra follows the cursor. When the switch flips on, the
// light SPREADS from the switch (top-right) across the room, then the
// overlay unmounts. Flipping off contracts back to the torch.
export default function Flashlight() {
  const { lit } = useLight()
  const shadeRef = useRef(null)
  const glowRef = useRef(null)
  const stateRef = useRef({
    mx: window.innerWidth / 2, my: window.innerHeight / 2,
    cx: window.innerWidth / 2, cy: window.innerHeight / 2,
    r: 170,          // current beam radius
    spread: 0,       // 0 = torch, 1 = fully lit
    wasLit: lit,
  })
  const doneRef = useRef(lit) // true once fully expanded → render nothing

  useEffect(() => {
    const s = stateRef.current
    if (!lit) doneRef.current = false
    s.wasLit = lit
    if (doneRef.current) return

    const shade = shadeRef.current
    const glow = glowRef.current
    if (!shade) return
    let raf

    const onMove = (e) => { s.mx = e.clientX; s.my = e.clientY }
    window.addEventListener('pointermove', onMove, { passive: true })

    // the switch lives near the top-right corner — light spreads from there
    const switchX = () => window.innerWidth - 60
    const switchY = () => 110
    const maxR = () => Math.hypot(window.innerWidth, window.innerHeight) * 1.1

    const loop = (t) => {
      // ease spread toward its target (1 when lit, 0 when dark)
      const target = lit ? 1 : 0
      s.spread += (target - s.spread) * 0.055
      if (lit && s.spread > 0.995) {
        shade.style.opacity = '0'
        glow.style.opacity = '0'
        doneRef.current = true
        // force a re-render-free hide; component output is already mounted
        shade.style.display = 'none'
        glow.style.display = 'none'
        return
      }

      // torch follows cursor; while spreading, the origin glides to the switch
      s.cx += (s.mx - s.cx) * 0.16
      s.cy += (s.my - s.cy) * 0.16
      const ox = s.cx + (switchX() - s.cx) * s.spread
      const oy = s.cy + (switchY() - s.cy) * s.spread

      const flicker = 1 + Math.sin(t * 0.011) * 0.028 + Math.sin(t * 0.037) * 0.018
      const r = (290 + (maxR() - 290) * s.spread * s.spread) * flicker

      // wide, warm lantern spread — long soft penumbra, never a hard spot
      shade.style.display = ''
      shade.style.opacity = '1'
      shade.style.background = `radial-gradient(circle ${r}px at ${ox}px ${oy}px,
        rgba(8,6,4,0) 0%,
        rgba(8,6,4,0.04) 28%,
        rgba(8,6,4,0.18) 48%,
        rgba(8,6,4,0.48) 66%,
        rgba(8,6,4,0.8) 82%,
        rgba(8,6,4,0.96) 94%,
        rgba(8,6,4,0.985) 100%)`

      // warm candle-colored cast filling most of the beam
      glow.style.display = ''
      glow.style.opacity = String(0.95 * (1 - s.spread))
      glow.style.background = `radial-gradient(circle ${r * 0.85}px at ${ox}px ${oy}px,
        rgba(255, 190, 100, 0.2) 0%,
        rgba(255, 170, 80, 0.1) 45%,
        rgba(255, 150, 60, 0.03) 75%,
        rgba(255, 150, 60, 0) 100%)`

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [lit])

  return (
    <>
      <div className="flashlight-shade" ref={shadeRef} aria-hidden="true" />
      <div className="flashlight-glow" ref={glowRef} aria-hidden="true" />
    </>
  )
}
