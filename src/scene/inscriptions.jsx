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
