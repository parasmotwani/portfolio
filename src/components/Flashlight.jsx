import { useEffect, useRef } from 'react'
import { useLight } from '../context/LightContext'

// Darkness overlay + lantern beam. The room is pitch black until the
// visitor strikes their lantern (first click) — the beam sputters to
// life with a flicker, then follows the cursor with a warm penumbra.
// When the switch flips on, the light SPREADS from the switch across
// the room, lingers as a golden afterglow, and crossfades away — it
// never just disappears. Flipping off contracts back to the lantern.
//
// ONE persistent rAF loop, state read through refs — the loop is never
// re-created on state changes, so there are no stale closures and no
// cancel races between renders.
export default function Flashlight() {
  const { lit, lantern } = useLight()
  const shadeRef = useRef(null)
  const glowRef = useRef(null)
  const flags = useRef({ lit, lantern })
  const s = useRef({
    mx: window.innerWidth / 2, my: window.innerHeight / 2,
    cx: window.innerWidth / 2, cy: window.innerHeight / 2,
    spread: lit ? 1 : 0,
    fade: lit ? 1 : 0,
    ig: 0,
    igStart: 0,
    done: lit,
  }).current

  useEffect(() => {
    flags.current.lit = lit
    flags.current.lantern = lantern
    if (!lit) { s.done = false; s.fade = 0 }
  }, [lit, lantern])

  useEffect(() => {
    const shade = shadeRef.current
    const glow = glowRef.current
    if (!shade || !glow) return
    let raf
    let last = performance.now()

    const onMove = (e) => { s.mx = e.clientX; s.my = e.clientY }
    window.addEventListener('pointermove', onMove, { passive: true })

    const switchX = () => window.innerWidth - 60
    const switchY = () => window.innerHeight * 0.42 + 45
    const maxR = () => Math.hypot(window.innerWidth, window.innerHeight) * 1.1

    const loop = (t) => {
      raf = requestAnimationFrame(loop)
      const { lit: isLit, lantern: hasLantern } = flags.current

      if (s.done) {
        if (shade.style.display !== 'none') {
          shade.style.display = 'none'
          glow.style.display = 'none'
        }
        last = t
        return
      }

      // time-based easing, step-capped: heavy frames (shader compiles)
      // may not skip the spread — it always plays out as a visible sweep
      const dt = Math.min((t - last) / 1000, 0.09)
      last = t
      s.spread += ((isLit ? 1 : 0) - s.spread) * Math.min(1, dt * 2.1)

      // lantern ignition: sputters for the first moment after striking
      if (hasLantern) {
        if (!s.igStart) s.igStart = t
        s.ig = Math.min(1, (t - s.igStart) / 900)
      }
      const sputter = s.ig >= 1
        ? 1
        : 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 0.05) * Math.sin(t * 0.017))
      const lanternR = hasLantern ? 290 * (0.35 + 0.65 * s.ig) * sputter : 0

      // after the spread completes, crossfade the shade away — no pop
      if (isLit && s.spread > 0.985) {
        s.fade = Math.min(1, s.fade + dt / 0.5)
        shade.style.opacity = String(1 - s.fade)
        glow.style.opacity = String(0.4 * (1 - s.fade))
        if (s.fade >= 1) s.done = true
        return
      }

      // lantern follows cursor; while spreading, the origin glides to the switch
      s.cx += (s.mx - s.cx) * 0.16
      s.cy += (s.my - s.cy) * 0.16
      const ox = s.cx + (switchX() - s.cx) * s.spread
      const oy = s.cy + (switchY() - s.cy) * s.spread

      const flicker = 1 + Math.sin(t * 0.011) * 0.028 + Math.sin(t * 0.037) * 0.018
      const r = (lanternR + (maxR() - lanternR) * s.spread * s.spread) * flicker

      shade.style.display = ''
      shade.style.opacity = '1'
      shade.style.background = r < 6
        ? 'rgba(8,6,4,0.995)'
        : `radial-gradient(circle ${r}px at ${ox}px ${oy}px,
            rgba(8,6,4,0) 0%,
            rgba(8,6,4,0.04) 28%,
            rgba(8,6,4,0.18) 48%,
            rgba(8,6,4,0.48) 66%,
            rgba(8,6,4,0.8) 82%,
            rgba(8,6,4,0.96) 94%,
            rgba(8,6,4,0.985) 100%)`

      // warm cast: strongest inside the lantern beam, plus a golden
      // afterglow that blooms outward mid-spread
      glow.style.display = ''
      const lanternGlow = hasLantern ? 0.95 * (1 - s.spread) * (0.5 + 0.5 * s.ig) * sputter : 0
      const afterglow = 1.3 * s.spread * (1 - s.spread)
      glow.style.opacity = String(Math.max(lanternGlow, afterglow))
      glow.style.background = `radial-gradient(circle ${Math.max(r * 0.85, 120)}px at ${ox}px ${oy}px,
        rgba(255, 190, 100, 0.2) 0%,
        rgba(255, 170, 80, 0.1) 45%,
        rgba(255, 150, 60, 0.03) 75%,
        rgba(255, 150, 60, 0) 100%)`
    }
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="flashlight-shade" ref={shadeRef} aria-hidden="true" />
      <div className="flashlight-glow" ref={glowRef} aria-hidden="true" />
    </>
  )
}
