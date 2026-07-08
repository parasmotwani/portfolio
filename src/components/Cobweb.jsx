// Corner cobweb, line art. corner: 'tl' | 'tr' | 'bl' | 'br'
export default function Cobweb({ corner = 'tl', size = 150 }) {
  const flip = {
    tl: '',
    tr: 'scale(-1, 1) translate(-160, 0)',
    bl: 'scale(1, -1) translate(0, -160)',
    br: 'scale(-1, -1) translate(-160, -160)',
  }[corner]

  // radial spokes from the corner + connecting arcs
  const spokes = [90, 68, 45, 22, 0].map((deg) => {
    const a = (deg * Math.PI) / 180
    return [Math.cos(a) * 150, Math.sin(a) * 150]
  })

  return (
    <svg
      className={`cobweb cobweb-${corner}`}
      viewBox="0 0 160 160"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <g transform={flip} stroke="currentColor" fill="none" strokeWidth="0.8">
        {spokes.map(([x, y], i) => (
          <line key={i} x1="0" y1="0" x2={x} y2={y} />
        ))}
        {[40, 75, 110, 140].map((r) => (
          <path
            key={r}
            d={spokes
              .map(([x, y], i) => {
                const px = (x / 150) * r
                const py = (y / 150) * r
                // sag each segment toward the corner for that hung-web look
                return i === 0 ? `M ${px} ${py}` : `Q ${px * 0.82} ${py * 0.82} ${px} ${py}`
              })
              .join(' ')}
          />
        ))}
      </g>
    </svg>
  )
}
