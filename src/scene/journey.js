// ============================================================
// The manor as one continuous space.
//
// Rooms are built in their own local coordinates and pushed down the -Z
// axis until each one's front edge meets the back wall of the room before
// it. Nothing overlaps and there is no void between them, so the visitor
// can walk from one into the next through a real doorway with both rooms
// on screen at once. That walk is the whole point: a cut to black is what
// makes a portfolio feel like a set of pages instead of a place.
//
// Doorways alternate sides down the house, so the route bends through the
// building instead of running straight like a tunnel. `x` shifts a room
// sideways when its own walls are narrower than the doorway feeding it —
// the study is, which is why it alone is offset.
//
// `journey.t` is the single scalar the scene reads:
//   floor(t) — which room
//   frac(t)  — progress through it, 0 at the threshold, 1 at the next
// Per-room ScrollTriggers write it (they already own the pinning, which
// works); CameraRig is the only thing that reads it and moves the camera.
// ============================================================

// frac(t) past this is the walk through the doorway into the next room
export const THRESHOLD = 0.72

// Each room in ITS OWN local coordinates:
//   front/back    — the z extent, used to butt rooms together
//   x             — sideways shift of the whole room, world units
//   eye/look      — where the visitor stands on entering, and what they read
//   exit/lookExit — where they've crossed to, now facing the way out
//   door          — the opening itself; the walk curves through this point,
//                   which is what stops the transition being a dolly
export const ROOMS = [
  {
    id: 'hero',
    fov: 58, front: 9.3, back: -6, x: 0, sway: 1,
    eye: [0, -0.25, 8.0],
    look: [0, -0.3, -3.5],
    // the proclamation owns the centre of the back wall (x -3.7..3.7), so
    // the way out is the far-right panel
    exit: [4.6, -0.35, 1.4],
    lookExit: [7.65, -0.85, -7.2],
    door: [7.65, -0.8, -5.9],
  },
  {
    id: 'about',
    // shifted right so its own right wall (local 7.5) still contains the
    // hall's doorway at world x 7.65
    fov: 52, front: 7.4, back: -6, x: 2.2, sway: 0.8,
    eye: [4.4, -0.3, 5.0],
    look: [-2.4, -0.15, -3.2],
    exit: [3.2, -0.35, 1.0],
    lookExit: [4.5, -0.85, -7.0],
    door: [4.5, -0.8, -5.7],
  },
  // Rooms II–VI stand back near the front wall and look DOWN into the
  // room. Level with the back wall, a 20-unit-wide room just fills the
  // frame with masonry; tilted down, the floor, the dressing and the
  // candle pools carry the shot.
  {
    id: 'skills',
    fov: 55, front: 9.3, back: -6, x: 0, sway: 0.85,
    eye: [5.0, -0.05, 7.6],
    look: [0.4, -1.4, -2.6],
    exit: [-4.6, -0.4, 0.6],
    lookExit: [-7.65, -0.9, -7.0],
    door: [-7.65, -0.85, -5.9],
  },
  {
    id: 'world',
    fov: 55, front: 9.3, back: -6, x: 0, sway: 0.85,
    eye: [-5.6, -0.05, 7.6],
    look: [-0.6, -1.4, -2.8],
    exit: [4.6, -0.4, 0.6],
    lookExit: [7.65, -0.9, -7.0],
    door: [7.65, -0.85, -5.9],
  },
  {
    id: 'projects',
    fov: 56, front: 9.3, back: -6, x: 0, sway: 0.85,
    eye: [5.6, -0.05, 7.6],
    look: [0.2, -1.4, -2.6],
    exit: [-4.6, -0.4, 0.6],
    lookExit: [-7.65, -0.9, -7.0],
    door: [-7.65, -0.85, -5.9],
  },
  {
    id: 'experience',
    fov: 55, front: 9.3, back: -6, x: 0, sway: 0.85,
    eye: [-5.6, -0.05, 7.6],
    look: [0.2, -1.4, -2.8],
    exit: [4.6, -0.4, 0.6],
    lookExit: [7.65, -0.9, -7.0],
    door: [7.65, -0.85, -5.9],
  },
  {
    id: 'contact',
    // the last room — entered, never left
    fov: 54, front: 9.3, back: -6, x: 0, sway: 0.7,
    eye: [5.6, -0.05, 7.6],
    look: [0, -1.4, -2.6],
    exit: [0.4, -0.4, 2.2],
    lookExit: [0, -1.2, -3.2],
    door: [0, -0.85, -5.9],
  },
]

const OFFSETS = ROOMS.reduce((acc, room, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + ROOMS[i - 1].back - room.front)
  return acc
}, [])

export function roomOffset(i) {
  const k = Math.min(OFFSETS.length - 1, Math.max(0, i))
  return OFFSETS[k]
}

export function roomShift(i) {
  const k = Math.min(ROOMS.length - 1, Math.max(0, i))
  return ROOMS[k].x
}

export const journey = {
  t: 0,
  mouse: { x: 0, y: 0 },
  // set by CameraRig each frame so rooms can cheaply ask "am I on screen?"
  // instead of each one re-deriving it from t
  visible: ROOMS.map((_, i) => i === 0),
}

if (typeof window !== 'undefined') window.__journey = journey
