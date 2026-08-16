// Corner cobweb, line art. corner: 'tl' | 'tr' | 'bl' | 'br'
// Old webs are never geometric: spokes at uneven angles, rings that
// wander in radius and sag between anchors, torn gaps, loose wisps.
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export default function Cobweb({ corner = 'tl', size = 150 }) {
  const flip = {
    tl: '',
    tr: 'scale(-1, 1) translate(-160, 0)',
    bl: 'scale(1, -1) translate(0, -160)',
    br: 'scale(-1, -1) translate(-160, -160)',
  }[corner]
  const seed = { tl: 1, tr: 2, bl: 3, br: 4 }[corner]

  const spokes = [3, 21, 42, 66, 87].map((deg, i) => {
    const a = ((deg + (hash(seed * 17 + i) - 0.5) * 9) * Math.PI) / 180
    const len = 150 * (0.82 + hash(seed * 29 + i) * 0.3)
    return { a, len, x: Math.cos(a) * len, y: Math.sin(a) * len }
  })

  const rings = [30, 52, 76, 100, 124, 146].map((r, ri) => {
    let d = ''
    let prev = null
    spokes.forEach((sp, i) => {
      const rr = Math.min(r * (0.88 + hash(seed * 7 + ri * 5 + i * 3) * 0.24), sp.len)
      const x = Math.cos(sp.a) * rr
      const y = Math.sin(sp.a) * rr
      const torn = prev && hash(seed * 13 + ri * 11 + i * 7) < 0.16
      if (!prev || torn) {
        d += ` M ${x.toFixed(1)} ${y.toFixed(1)}`
      } else {
        const sag = 1 - (0.12 + hash(seed + ri * 3 + i) * 0.08)
        const cx = ((prev.x + x) / 2) * sag
        const cy = ((prev.y + y) / 2) * sag
        d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`
      }
      prev = { x, y }
    })
    return d
  })

  // loose wisps trailing outward past the broken outer ring
  const wisps = [1, 2, 3].map((i) => {
    const sp = spokes[i]
    const j = hash(seed * 43 + i)
    const dx = Math.cos(sp.a + (j - 0.5) * 0.6)
    const dy = Math.sin(sp.a + (j - 0.5) * 0.6)
    const l1 = 7 + j * 8
    return `M ${sp.x.toFixed(1)} ${sp.y.toFixed(1)} q ${(dx * l1).toFixed(1)} ${(dy * l1 + 3).toFixed(1)} ${(dx * l1 * 1.6).toFixed(1)} ${(dy * l1 * 1.6 + 8).toFixed(1)}`
  })

  return (
    <svg
      className={`cobweb cobweb-${corner}`}
      viewBox="0 0 160 160"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <g transform={flip} stroke="currentColor" fill="none">
        {spokes.map((sp, i) => (
          <line key={i} x1="0" y1="0" x2={sp.x} y2={sp.y} strokeWidth={0.9 - i * 0.06} />
        ))}
        {rings.map((d, i) => (
          <path key={i} d={d} strokeWidth="0.55" strokeOpacity={0.75 + hash(seed + i) * 0.25} />
        ))}
        {wisps.map((d, i) => (
          <path key={`w${i}`} d={d} strokeWidth="0.45" strokeOpacity="0.6" />
        ))}
      </g>
    </svg>
  )
}
