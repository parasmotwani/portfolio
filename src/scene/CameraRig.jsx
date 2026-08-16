import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { journey, ROOMS, THRESHOLD, roomOffset, roomShift } from './journey'

// ============================================================
// The only thing in the scene that touches the camera.
//
// Rooms used to each move it themselves, arbitrated by a pair of `active`
// booleans — which is why leaving a room had to fade to black: two rooms
// both claiming the camera can only be separated by darkness. Here the
// camera simply walks, and the cut disappears: past the threshold it
// travels through the doorway while both rooms are still on screen.
// ============================================================

const _eye = new THREE.Vector3()
const _look = new THREE.Vector3()
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()

// One curve per doorway, built once. Catmull-Rom rather than a Bézier
// because the camera has to pass THROUGH the opening — a Bézier only bends
// toward its control point, which walks you into the wall beside the door.
const WALKS = ROOMS.slice(0, -1).map((room, i) => {
  const next = ROOMS[i + 1]
  const off = roomOffset(i), sx = roomShift(i)
  const nOff = roomOffset(i + 1), nsx = roomShift(i + 1)
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(room.exit[0] + sx, room.exit[1], room.exit[2] + off),
    new THREE.Vector3(room.door[0] + sx, room.door[1], room.door[2] + off),
    new THREE.Vector3(next.eye[0] + nsx, next.eye[1], next.eye[2] + nOff),
  ], false, 'catmullrom', 0.5)
})

function poseAt(t, eye, look) {
  const last = ROOMS.length - 1
  const i = Math.min(last, Math.max(0, Math.floor(t)))
  const f = Math.min(1, Math.max(0, t - i))
  const room = ROOMS[i]
  const off = roomOffset(i)
  const sx = roomShift(i)

  if (f <= THRESHOLD || i === last) {
    // crossing the room: a slow drift from where you came in toward the
    // way out, turning to face it as you go
    const k = THRESHOLD > 0 ? Math.min(1, f / THRESHOLD) : 0
    const e = k * k * (3 - 2 * k)
    _a.fromArray(room.eye)
    _b.fromArray(room.exit)
    eye.lerpVectors(_a, _b, e)
    eye.z += off; eye.x += sx
    _a.fromArray(room.look)
    _b.fromArray(room.lookExit)
    // hold the establishing view for the first half, then turn
    look.lerpVectors(_a, _b, THREE.MathUtils.smoothstep(k, 0.45, 1))
    look.z += off; look.x += sx
    return { fov: room.fov, sway: room.sway, i, f }
  }

  // through the doorway — the walk that makes a room change read as a room
  // change instead of a cut
  const next = ROOMS[i + 1]
  const nOff = roomOffset(i + 1)
  const w = (f - THRESHOLD) / (1 - THRESHOLD)
  const k = w * w * (3 - 2 * w)

  WALKS[i].getPoint(k, eye)

  _a.fromArray(room.lookExit); _a.z += off; _a.x += sx
  _b.fromArray(next.look); _b.z += nOff; _b.x += roomShift(i + 1)
  look.lerpVectors(_a, _b, k)

  return {
    fov: THREE.MathUtils.lerp(room.fov, next.fov, k),
    sway: THREE.MathUtils.lerp(room.sway, next.sway, k),
    i, f,
  }
}

export default function CameraRig() {
  const { camera } = useThree()
  const smooth = useRef({ ready: false })
  const pos = useMemo(() => new THREE.Vector3(), [])
  const tgt = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    const { fov, sway } = poseAt(journey.t, _eye, _look)

    // parallax rides on top of the path so the room breathes with the
    // cursor without ever pulling the camera off its walk
    _eye.x += journey.mouse.x * 0.5 * sway
    _eye.y += journey.mouse.y * 0.26 * sway
    _look.x += journey.mouse.x * 1.0 * sway
    _look.y += journey.mouse.y * 0.45 * sway

    // frame-rate independent damping — a 30 fps machine must not travel
    // at half speed
    const k = 1 - Math.pow(0.0016, Math.min(delta, 0.1))
    if (!smooth.current.ready) {
      pos.copy(_eye); tgt.copy(_look)
      smooth.current.ready = true
    } else {
      pos.lerp(_eye, k)
      tgt.lerp(_look, k)
    }

    camera.position.copy(pos)
    camera.lookAt(tgt)

    // Rooms declare framing as a HORIZONTAL field of view, converted here
    // against the live aspect. three's `fov` is vertical, so on a narrow
    // window the same number shows less of the room sideways — which is
    // what cut the entrance's board in half on anything below 16:9. Framing
    // a wall means holding the horizontal angle and letting the vertical
    // give, never the reverse.
    const hFov = THREE.MathUtils.degToRad(fov * 1.42)
    const vFov = THREE.MathUtils.radToDeg(
      2 * Math.atan(Math.tan(hFov / 2) / Math.max(0.6, camera.aspect))
    )
    const want = THREE.MathUtils.clamp(vFov, 34, 86)
    if (Math.abs(camera.fov - want) > 0.02) {
      camera.fov += (want - camera.fov) * k
      camera.updateProjectionMatrix()
    }

    for (let r = 0; r < ROOMS.length; r++) {
      journey.visible[r] = Math.abs(r - journey.t) < 1.35
    }
  })

  return null
}
