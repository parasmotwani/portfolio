import { Inscription, roughText, erode, drawParchment } from './inscriptions'
import { INK, INK_BODY, INK_SOFT, INK_RULE, INK_RED } from './palette'

// ============================================================
// A room's copy, inked on a board hung centre of its back wall.
//
// The rooms used to carry their text in a centred DOM panel floating over
// the canvas, which is the one thing that makes a 3D room read as a
// background image. A board on the wall is a thing in the room: it takes
// the room's light, it sits at the centre of the shot, and the camera
// walks toward it.
//
// The same words stay in the DOM as sr-only — a canvas texture cannot be
// selected, searched, or read aloud.
// ============================================================

const SERIF = '"IM Fell English", serif'
const MONO = '"JetBrains Mono", monospace'

// Centre of the back wall, hung clear of it. Two traps here: the kit's
// wall panels are ~0.38 deep once scaled, so a board at the panel's
// nominal z sits inside the masonry and never draws — and their raised
// bricks stand proud of that again, which punched dark rectangles through
// the copy. The height is held under the ceiling beams at y 2.55, which
// were slicing the heading off the top.
const AT = [0, 0.1, -5.36]
const SIZE = [8.2, 4.2]

// Layout is authored once in this design space; the real canvas is derived
// from the PLANE's own aspect and the context is scaled to match. The two
// used to be independent — a fixed 1230x735 canvas (1.673) mapped onto an
// 8.2x4.2 plane (1.952) — so every board was stretched 17% horizontally
// and the text came out flattened. Deriving it also raises the resolution,
// which is what made the lettering look soft up close.
const W = 1230
const H = 735
const PPU = 190          // canvas pixels per world unit

function boardCanvas([sw, sh]) {
  return { cw: Math.round(sw * PPU), ch: Math.round(sh * PPU) }
}

// draw in design space no matter what the real canvas measures
function inDesignSpace(g, cw, ch, fn) {
  g.save()
  g.scale(cw / W, ch / H)
  fn()
  g.restore()
}

function head(g, numeral, title, subtitle) {
  roughText(g, numeral.toUpperCase(), W / 2, 66, 26, INK_RULE, 0.7, { font: MONO })
  roughText(g, title, W / 2, 132, 62, INK, 0.96)
  g.strokeStyle = INK_RULE
  g.globalAlpha = 0.5
  g.lineWidth = 2.5
  g.beginPath(); g.moveTo(W * 0.28, 158); g.lineTo(W * 0.72, 160); g.stroke()
  g.globalAlpha = 1
  if (subtitle) {
    roughText(g, subtitle, W / 2, 208, 33, INK_RED, 0.82, { font: SERIF, style: 'italic' })
  }
}

// Heading + running prose. Used where a room has something to say rather
// than something to list.
export function ProseBoard({ numeral, title, subtitle, lines, foot, at = AT, size = SIZE }) {
  const { cw, ch } = boardCanvas(size)
  return (
    <Inscription
      position={at}
      size={size}
      w={cw}
      h={ch}
      draw={(g) => inDesignSpace(g, cw, ch, () => {
        drawParchment(g, W, H, 5)
        head(g, numeral, title, subtitle)
        lines.forEach((line, i) => {
          if (!line) return
          roughText(g, line, W / 2, 290 + i * 46, 33, INK_BODY, 0.93, { font: SERIF })
        })
        if (foot) {
          roughText(g, foot, W / 2, H - 52, 30, INK_SOFT, 0.75, { font: SERIF, style: 'italic' })
        }
        erode(g, W, H, 170, 6)
      })}
    />
  )
}

// Heading + categories in two columns. Technical terms stay technical —
// these are the real names, set as they are written.
export function ListBoard({ numeral, title, subtitle, groups, foot, at = AT, size = SIZE }) {
  const { cw, ch } = boardCanvas(size)
  return (
    <Inscription
      position={at}
      size={size}
      w={cw}
      h={ch}
      draw={(g) => inDesignSpace(g, cw, ch, () => {
        drawParchment(g, W, H, 9)
        head(g, numeral, title, subtitle)

        const mid = Math.ceil(groups.length / 2)
        const cols = [groups.slice(0, mid), groups.slice(mid)]
        cols.forEach((col, ci) => {
          const cx = ci === 0 ? W * 0.28 : W * 0.72
          let y = 286
          col.forEach((grp) => {
            roughText(g, grp.label, cx, y, 30, INK, 0.93, { font: SERIF })
            g.strokeStyle = INK_RULE
            g.globalAlpha = 0.28
            g.lineWidth = 1.5
            g.beginPath(); g.moveTo(cx - 190, y + 12); g.lineTo(cx + 190, y + 12); g.stroke()
            g.globalAlpha = 1
            y += 44
            grp.items.forEach((row) => {
              roughText(g, row, cx, y, 25, INK_SOFT, 0.88, { font: SERIF })
              y += 33
            })
            y += 20
          })
        })

        if (foot) {
          roughText(g, foot, W / 2, H - 44, 28, INK_SOFT, 0.72, { font: SERIF, style: 'italic' })
        }
        erode(g, W, H, 170, 11)
      })}
    />
  )
}
