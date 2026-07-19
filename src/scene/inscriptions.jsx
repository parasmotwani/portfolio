import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

// ============================================================
// Diegetic text: the resident was a sorcerer — which is what a
// data scientist would have been called back then. Their work
// is written ON the house: name painted over the stone, notes
// chalked beside the window, formulas by the shelves, and a
// neural network drawn on the floor the way one would chalk a
// summoning circle. All terms stay real — that's the joke.
// ============================================================

const FELL_SC = '"IM Fell English SC", serif'
const FELL_IT = '"IM Fell English", serif'

export function roughText(g, text, x, y, size, color, alpha, { font = FELL_SC, rot = 0, align = 'center' } = {}) {
  g.save()
  g.translate(x, y)
  g.rotate(rot)
  g.font = `${size}px ${font}`
  g.textAlign = align
  g.fillStyle = color
  g.globalAlpha = alpha * 0.45
  g.fillText(text, size * 0.02 + 1.5, 1.2)
  g.globalAlpha = alpha
  g.fillText(text, 0, 0)
  g.restore()
  g.globalAlpha = 1
}

// eat the paint away so it reads as centuries old
export function erode(g, w, h, n, seed = 7) {
  let s = seed
  const rng = () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
  g.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < n; i++) {
    g.globalAlpha = 0.2 + rng() * 0.5
    const x = rng() * w
    const y = rng() * h
    const r = 0.5 + rng() * 2.4
    g.fillStyle = '#000'
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill()
  }
  g.globalCompositeOperation = 'source-over'
  g.globalAlpha = 1
}

// A canvas-drawn plane pinned to a surface. Redraws once the site's
// fonts are ready so the scrawl really is IM Fell, not a serif stand-in.
export function Inscription({ draw, w = 1024, h = 512, position, rotation = [0, 0, 0], size = [4, 2], opacity = 1 }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    const t = new THREE.CanvasTexture(c)
    t.anisotropy = 4
    return t
  }, [w, h])

  useEffect(() => {
    let alive = true
    const render = () => {
      if (!alive) return
      const g = tex.image.getContext('2d')
      g.clearRect(0, 0, w, h)
      draw(g, w, h)
      tex.needsUpdate = true
    }
    render()
    document.fonts.ready.then(render)
    return () => { alive = false }
  }, [tex])

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  )
}

// an aged sheet nailed to the wall — the writing surface of the house
export function drawParchment(g, w, h, seed = 3) {
  const m = 26
  let s = seed
  const rng = () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
  g.beginPath()
  const pts = 28
  for (let i = 0; i <= pts; i++) {
    const p = i / pts
    let x, y
    if (p < 0.25) { x = m + (w - 2 * m) * (p / 0.25); y = m + (rng() - 0.5) * 16 }
    else if (p < 0.5) { x = w - m + (rng() - 0.5) * 16; y = m + (h - 2 * m) * ((p - 0.25) / 0.25) }
    else if (p < 0.75) { x = w - m - (w - 2 * m) * ((p - 0.5) / 0.25); y = h - m + (rng() - 0.5) * 16 }
    else { x = m + (rng() - 0.5) * 16; y = h - m - (h - 2 * m) * ((p - 0.75) / 0.25) }
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y)
  }
  g.closePath()
  const grad = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h) * 0.62)
  grad.addColorStop(0, '#ddd0ac')
  grad.addColorStop(0.72, '#cdbd93')
  grad.addColorStop(1, '#a8905f')
  g.fillStyle = grad
  g.fill()
  g.lineWidth = 10
  g.strokeStyle = 'rgba(74, 50, 22, 0.5)'
  g.stroke()
  g.lineWidth = 3
  g.strokeStyle = 'rgba(40, 26, 10, 0.6)'
  g.stroke()
  for (let i = 0; i < 5; i++) {
    const x = m + rng() * (w - 2 * m), y = m + rng() * (h - 2 * m), r = 26 + rng() * 70
    const st = g.createRadialGradient(x, y, 2, x, y, r)
    st.addColorStop(0, 'rgba(122, 92, 48, 0.15)')
    st.addColorStop(1, 'rgba(122, 92, 48, 0)')
    g.fillStyle = st
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill()
  }
  g.fillStyle = '#241c12'
  ;[[m + 16, m + 16], [w - m - 16, m + 20], [m + 20, h - m - 16], [w - m - 14, h - m - 18]].forEach(([x, y]) => {
    g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill()
  })
}

// what the window actually looks out on: moon, hills, one dead tree
export function drawNightScene(g, w, h) {
  const sky = g.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#101828')
  sky.addColorStop(0.55, '#1a2438')
  sky.addColorStop(1, '#0c111c')
  g.fillStyle = sky
  g.fillRect(0, 0, w, h)
  let s = 5
  const rng = () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
  for (let i = 0; i < 120; i++) {
    g.globalAlpha = 0.25 + rng() * 0.7
    g.fillStyle = '#dfe8f2'
    g.fillRect(rng() * w, rng() * h * 0.72, 0.6 + rng() * 1.6, 0.6 + rng() * 1.6)
  }
  g.globalAlpha = 1
  // framed by the arch: keep the moon and tree inside its view
  const mx = w * 0.44, my = h * 0.4
  const halo = g.createRadialGradient(mx, my, 20, mx, my, 190)
  halo.addColorStop(0, 'rgba(226, 235, 240, 0.5)')
  halo.addColorStop(1, 'rgba(226, 235, 240, 0)')
  g.fillStyle = halo
  g.beginPath(); g.arc(mx, my, 190, 0, 7); g.fill()
  g.fillStyle = '#eff5f0'
  g.beginPath(); g.arc(mx, my, 58, 0, 7); g.fill()
  g.fillStyle = 'rgba(180, 195, 200, 0.5)'
  ;[[-18, -8, 12], [16, 14, 9], [4, -22, 7]].forEach(([dx, dy, r]) => {
    g.beginPath(); g.arc(mx + dx, my + dy, r, 0, 7); g.fill()
  })
  g.fillStyle = '#0b1018'
  g.beginPath()
  g.moveTo(0, h * 0.72)
  g.quadraticCurveTo(w * 0.22, h * 0.6, w * 0.45, h * 0.7)
  g.quadraticCurveTo(w * 0.7, h * 0.8, w, h * 0.66)
  g.lineTo(w, h); g.lineTo(0, h)
  g.closePath(); g.fill()
  g.strokeStyle = '#070a10'
  g.lineCap = 'round'
  const branch = (x, y, a, len, depth) => {
    if (depth === 0 || len < 8) return
    const nx = x + Math.cos(a) * len
    const ny = y + Math.sin(a) * len
    g.lineWidth = depth * 2.2
    g.beginPath(); g.moveTo(x, y); g.lineTo(nx, ny); g.stroke()
    branch(nx, ny, a - 0.35 - rng() * 0.3, len * 0.72, depth - 1)
    branch(nx, ny, a + 0.3 + rng() * 0.35, len * 0.66, depth - 1)
  }
  branch(w * 0.56, h * 0.72, -Math.PI / 2 + 0.08, h * 0.19, 6)
  const mist = g.createLinearGradient(0, h * 0.7, 0, h)
  mist.addColorStop(0, 'rgba(140, 160, 175, 0)')
  mist.addColorStop(1, 'rgba(140, 160, 175, 0.18)')
  g.fillStyle = mist
  g.fillRect(0, h * 0.7, w, h * 0.3)
}

// the neural network, chalked the way you'd chalk a summoning circle
export function drawSigil(g, w, h) {
  const cx = w / 2, cy = h / 2
  const gold = '#e8cf8f'
  const rings = [470, 442, 330, 195]
  g.strokeStyle = gold
  g.globalAlpha = 0.9
  rings.forEach((r, i) => {
    g.lineWidth = i === 0 ? 3 : 1.6
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke()
  })

  // the litany around the outer band — real terms, chalked in a ring
  const litany = ' ATTENTION · GRADIENT DESCENT · BACKPROPAGATION · TRANSFORMERS · RETRIEVAL · DIFFUSION ·'
  g.font = `34px ${FELL_SC}`
  g.fillStyle = gold
  const rText = 456
  for (let i = 0; i < litany.length; i++) {
    const a = (i / litany.length) * Math.PI * 2 - Math.PI / 2
    g.save()
    g.translate(cx + Math.cos(a) * rText, cy + Math.sin(a) * rText)
    g.rotate(a + Math.PI / 2)
    g.globalAlpha = 0.85
    g.fillText(litany[i], 0, 0)
    g.restore()
  }

  // input ring → hidden ring → the output at the centre
  const ringNodes = (r, n, offset = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + offset
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
    })
  const inputs = ringNodes(330, 10)
  const hidden = ringNodes(195, 6, 0.3)

  g.globalAlpha = 0.3
  g.lineWidth = 1
  inputs.forEach(([x1, y1]) => hidden.forEach(([x2, y2]) => {
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke()
  }))
  g.globalAlpha = 0.5
  hidden.forEach(([x1, y1]) => {
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(cx, cy); g.stroke()
  })

  g.globalAlpha = 0.95
  g.fillStyle = gold
  inputs.forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill() })
  hidden.forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill() })

  // the output: an eye
  g.lineWidth = 2.4
  g.beginPath(); g.arc(cx, cy, 46, 0, Math.PI * 2); g.stroke()
  g.beginPath(); g.arc(cx, cy, 16, 0, Math.PI * 2); g.fill()

  // glyphs at the cardinal points — the working symbols
  const glyphs = ['∇', 'θ', 'Σ', 'η']
  g.font = `64px ${FELL_SC}`
  glyphs.forEach((s, i) => {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 4
    roughText(g, s, cx + Math.cos(a) * 262, cy + Math.sin(a) * 262 + 20, 64, gold, 0.9)
  })

  erode(g, w, h, 2400, 13)
}
