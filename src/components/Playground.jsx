import { useEffect, useRef, useState, useCallback } from 'react'

const COLORS = ['#e63946', '#f2f2ed', '#a3a39c', '#c9c9c2', '#7a7a73', '#8d99ae']
const BG = '#141414'

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
  const [status, setStatus] = useState('Click canvas to add points')
  const kRef = useRef(k)
  kRef.current = k

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { width: w, height: h } = canvas
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, w, h)

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
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
      const c = assign[i] !== undefined && cents.length ? COLORS[assign[i] % COLORS.length] : '#62625c'
      ctx.fillStyle = c
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    cents.forEach((c, i) => {
      ctx.strokeStyle = COLORS[i % COLORS.length]
      ctx.lineWidth = 2
      const s = 9
      ctx.beginPath()
      ctx.moveTo(c.x - s, c.y - s); ctx.lineTo(c.x + s, c.y + s)
      ctx.moveTo(c.x + s, c.y - s); ctx.lineTo(c.x - s, c.y + s)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(c.x, c.y, 14, 0, Math.PI * 2)
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
    setStatus(`${pointsRef.current.length} points — press RUN`)
  }

  const run = () => {
    cancelAnimationFrame(animRef.current)
    const pts = pointsRef.current
    const kk = kRef.current
    if (pts.length < kk) {
      setStatus('Need more points than k')
      return
    }
    // init centroids at random points
    const chosen = [...pts].sort(() => Math.random() - 0.5).slice(0, kk)
    centroidsRef.current = chosen.map((p) => ({ x: p.x, y: p.y, tx: p.x, ty: p.y }))
    let iter = 0

    const step = () => {
      const cents = centroidsRef.current
      // assign
      assignRef.current = pts.map((p) => {
        let best = 0, bd = Infinity
        cents.forEach((c, i) => {
          const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2
          if (d < bd) { bd = d; best = i }
        })
        return best
      })
      // new targets = cluster means
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
      setStatus(`Iteration ${String(iter).padStart(2, '0')} — shift ${moved.toFixed(1)}px`)

      // animate centroids toward targets, then next iteration
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
          setStatus(`Converged in ${iter} iterations · k=${kk}`)
        }
      }
      animRef.current = requestAnimationFrame(animate)
    }
    step()
  }

  const reset = () => {
    cancelAnimationFrame(animRef.current)
    pointsRef.current = []
    centroidsRef.current = []
    assignRef.current = []
    const canvas = canvasRef.current
    pointsRef.current = seedPoints(canvas.width, canvas.height)
    draw()
    setStatus('Reset — click to add points')
  }

  return (
    <section className="section" id="playground" data-scene>
      <div className="section-head">
        <span className="section-num">03</span>
        <h2 className="section-title">Playground</h2>
        <span className="section-sub">Live k-means clustering — no libraries, just math</span>
      </div>

      <div className="playground-wrap">
        <div>
          <p className="playground-desc">
            Click the canvas to drop data points, pick <em>k</em>, and watch
            k-means converge in real time — assignments and centroid updates,
            animated step by step.
          </p>
          <div className="playground-controls">
            <div className="playground-k">
              <span>k =</span>
              <button data-hover onClick={() => setK((v) => Math.max(2, v - 1))}>−</button>
              <span className="kval">{k}</span>
              <button data-hover onClick={() => setK((v) => Math.min(6, v + 1))}>+</button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn solid" data-hover onClick={run}>Run</button>
              <button className="btn" data-hover onClick={reset}>Reset</button>
            </div>
            <div className="playground-status">{status}</div>
          </div>
        </div>
        <canvas className="playground-canvas" ref={canvasRef} onClick={addPoint} />
      </div>
    </section>
  )
}
