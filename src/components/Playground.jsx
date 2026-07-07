import { useEffect, useRef, useState, useCallback } from 'react'
import Chapter from './Chapter'

const COLORS = ['#d4a94e', '#b04040', '#e8e0cf', '#8a6f38', '#a89f8a', '#6e8a5e']
const BG = '#16120c'

function seedPoints(w, h) {
  const pts = []
  const blobs = [
    { x: 0.25, y: 0.35 }, { x: 0.7, y: 0.25 }, { x: 0.55, y: 0.72 },
  ]
  for (const b of blobs) {
    for (let i = 0; i < 28; i++) {
      pts.push({
        x: b.x * w + (Math.random() - 0.5) * w * 0.22,
        y: b.y * h + (Math.random() - 0.5) * h * 0.28,
      })
    }
  }
  return pts
}

export default function Playground() {
  const canvasRef = useRef(null)
  const pointsRef = useRef([])
  const centroidsRef = useRef([])
  const assignRef = useRef([])
  const animRef = useRef(null)
  const [k, setK] = useState(3)
  const [status, setStatus] = useState('Cast points upon the table')
  const kRef = useRef(k)
  kRef.current = k

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { width: w, height: h } = canvas
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, w, h)

    // faint grid, like ruled vellum
    ctx.strokeStyle = 'rgba(212, 169, 78, 0.05)'
    ctx.lineWidth = 1
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }

    const pts = pointsRef.current
    const cents = centroidsRef.current
    const assign = assignRef.current

    pts.forEach((p, i) => {
      const c = assign[i] !== undefined && cents.length ? COLORS[assign[i] % COLORS.length] : '#6e6757'
      ctx.fillStyle = c
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // centroids as wax seals: ring + diamond
    cents.forEach((c, i) => {
      ctx.strokeStyle = COLORS[i % COLORS.length]
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(c.x, c.y, 13, 0, Math.PI * 2)
      ctx.stroke()
      const s = 6
      ctx.beginPath()
      ctx.moveTo(c.x, c.y - s); ctx.lineTo(c.x + s, c.y)
      ctx.lineTo(c.x, c.y + s); ctx.lineTo(c.x - s, c.y)
      ctx.closePath()
      ctx.stroke()
    })
  }, [])

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    if (!pointsRef.current.length) {
      pointsRef.current = seedPoints(canvas.width, canvas.height)
    }
    draw()
  }, [draw])

  useEffect(() => {
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [resize])

  const addPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    pointsRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    draw()
    setStatus(`${pointsRef.current.length} points cast — invoke the rite`)
  }

  const run = () => {
    cancelAnimationFrame(animRef.current)
    const pts = pointsRef.current
    const kk = kRef.current
    if (pts.length < kk) {
      setStatus('More points than seals required')
      return
    }
    const chosen = [...pts].sort(() => Math.random() - 0.5).slice(0, kk)
    centroidsRef.current = chosen.map((p) => ({ x: p.x, y: p.y, tx: p.x, ty: p.y }))
    let iter = 0

    const step = () => {
      const cents = centroidsRef.current
      assignRef.current = pts.map((p) => {
        let best = 0, bd = Infinity
        cents.forEach((c, i) => {
          const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2
          if (d < bd) { bd = d; best = i }
        })
        return best
      })
      let moved = 0
      cents.forEach((c, i) => {
        const mine = pts.filter((_, j) => assignRef.current[j] === i)
        if (!mine.length) return
        const mx = mine.reduce((s, p) => s + p.x, 0) / mine.length
        const my = mine.reduce((s, p) => s + p.y, 0) / mine.length
        moved += Math.hypot(mx - c.tx, my - c.ty)
        c.tx = mx; c.ty = my
      })
      iter++
      setStatus(`Divination ${String(iter).padStart(2, '0')} — seals shift ${moved.toFixed(1)}px`)

      const animate = () => {
        let settling = 0
        cents.forEach((c) => {
          c.x += (c.tx - c.x) * 0.12
          c.y += (c.ty - c.y) * 0.12
          settling += Math.hypot(c.tx - c.x, c.ty - c.y)
        })
        draw()
        if (settling > 0.5) {
          animRef.current = requestAnimationFrame(animate)
        } else if (moved > 0.5 && iter < 30) {
          animRef.current = requestAnimationFrame(step)
        } else {
          setStatus(`The seals have settled — ${iter} passes · k=${kk}`)
        }
      }
      animRef.current = requestAnimationFrame(animate)
    }
    step()
  }

  const reset = () => {
    cancelAnimationFrame(animRef.current)
    centroidsRef.current = []
    assignRef.current = []
    const canvas = canvasRef.current
    pointsRef.current = seedPoints(canvas.width, canvas.height)
    draw()
    setStatus('The table is cleared')
  }

  return (
    <Chapter
      id="playground"
      numeral="Chapter III"
      title="The Divination Table"
      subtitle="A working of k-means, cast by hand — no libraries, only arithmetic"
    >
      <div className="divination-wrap">
        <div data-reveal>
          <p className="divination-desc">
            Click the table to cast data points, choose <em>k</em> seals, and
            invoke the rite. Watch each pass of k-means assign the points and
            draw the seals toward their centers, until all is settled.
          </p>
          <div className="divination-controls">
            <div className="divination-k">
              <span>Seals, k =</span>
              <button data-hover onClick={() => setK((v) => Math.max(2, v - 1))}>−</button>
              <span className="kval">{k}</span>
              <button data-hover onClick={() => setK((v) => Math.min(6, v + 1))}>+</button>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn solid" data-hover onClick={run}>Invoke</button>
              <button className="btn" data-hover onClick={reset}>Clear</button>
            </div>
            <div className="divination-status">{status}</div>
          </div>
        </div>
        <canvas className="divination-canvas" ref={canvasRef} onClick={addPoint} data-reveal />
      </div>
    </Chapter>
  )
}
