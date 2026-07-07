// Alchemy circle that is secretly a neural network: concentric rings,
// an inner polygon, and layered nodes joined by edges. All strokes are
// [data-inscribe] so Chapter/Hero timelines can draw them in.
export default function MagicCircle({ className = '', nodes = true }) {
  const C = 200 // center
  const rings = [190, 172, 118]

  // three "layers" of nodes placed on inner rings — a radial neural net
  const layers = [
    { r: 150, n: 8 },
    { r: 92, n: 6 },
    { r: 40, n: 3 },
  ]
  const layerPts = layers.map(({ r, n }, li) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2 + li * 0.35
      return [C + r * Math.cos(a), C + r * Math.sin(a)]
    })
  )

  const edges = []
  for (let l = 0; l < layerPts.length - 1; l++) {
    for (const [x1, y1] of layerPts[l]) {
      for (let j = 0; j < layerPts[l + 1].length; j++) {
        if ((j + Math.round(x1)) % 2 === 0) continue // thin out edges
        const [x2, y2] = layerPts[l + 1][j]
        edges.push([x1, y1, x2, y2])
      }
    }
  }

  // heptagram vertices on ring 172
  const hepta = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2
    return `${C + 172 * Math.cos(a)},${C + 172 * Math.sin(a)}`
  })
  const heptaPath = Array.from({ length: 8 }, (_, i) => hepta[(i * 3) % 7]).join(' ')

  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true">
      <g stroke="#d4a94e" strokeWidth="0.8" fill="none">
        {rings.map((r) => (
          <circle key={r} cx={C} cy={C} r={r} data-inscribe opacity={0.7} />
        ))}
        <polyline points={heptaPath} data-inscribe opacity={0.35} />
        {nodes && edges.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} data-inscribe opacity={0.28} />
        ))}
      </g>
      {nodes && (
        <g fill="#d4a94e">
          {layerPts.flat().map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 3 : 2} opacity={0.85} />
          ))}
          <circle cx={C} cy={C} r={4.5} fill="#8e2f2f" />
        </g>
      )}
    </svg>
  )
}
