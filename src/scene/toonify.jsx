import { useMemo } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

// ============================================================
// The anime pipeline: authored glTF assets (KayKit, CC0) are
// regraded on load into ONE house look — every material becomes
// a MeshToonMaterial stepped through a shared 3-tone ramp, with
// an optional per-piece tint so any sourced asset lands in the
// palette. Flames are detected and made emissive so bloom can
// pick them up.
// ============================================================

let _ramp
export function toonRamp() {
  if (!_ramp) {
    const steps = [72, 156, 255]
    const data = new Uint8Array(steps.length * 4)
    steps.forEach((v, i) => {
      data[i * 4] = v; data[i * 4 + 1] = v; data[i * 4 + 2] = v; data[i * 4 + 3] = 255
    })
    _ramp = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat)
    _ramp.minFilter = THREE.NearestFilter
    _ramp.magFilter = THREE.NearestFilter
    _ramp.needsUpdate = true
  }
  return _ramp
}

const FLAME = /flame|fire|lava/i

export function toonify(root, { tint = '#ffffff' } = {}) {
  const ramp = toonRamp()
  const tintC = new THREE.Color(tint)
  root.traverse((o) => {
    if (!o.isMesh) return
    o.castShadow = true
    o.receiveShadow = true
    const src = o.material
    if (!src) return
    const isFlame = FLAME.test(src.name || '') || FLAME.test(o.name || '')
    const m = new THREE.MeshToonMaterial({
      map: src.map || null,
      color: (src.color ? src.color.clone() : new THREE.Color('#ffffff')).multiply(tintC),
      gradientMap: ramp,
      transparent: src.transparent || false,
      opacity: src.opacity ?? 1,
      side: src.side ?? THREE.FrontSide,
      vertexColors: src.vertexColors || false,
    })
    if (isFlame) {
      m.emissive = new THREE.Color('#ffb45e')
      m.emissiveIntensity = 1.5
      o.castShadow = false
    }
    o.material = m
  })
  return root
}

// A placed kit asset: cloned, toonified, scaled, and floor-anchored
// (bbox bottom sits exactly on `position[1]`).
export function Piece({ file, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, tint = '#ffffff', anchor = 'floor' }) {
  const { scene } = useGLTF(`/models/dungeon/${file}.glb`)
  const s = Array.isArray(scale) ? scale : [scale, scale, scale]

  const obj = useMemo(() => {
    const c = scene.clone(true)
    toonify(c, { tint })
    return c
  }, [scene, tint])

  const lift = useMemo(() => {
    if (anchor !== 'floor') return 0
    const box = new THREE.Box3().setFromObject(obj)
    return -box.min.y
  }, [obj, anchor])

  return (
    <primitive
      object={obj}
      position={[position[0], position[1] + lift * s[1], position[2]]}
      rotation={rotation}
      scale={s}
    />
  )
}

export function preloadPieces(files) {
  files.forEach((f) => useGLTF.preload(`/models/dungeon/${f}.glb`))
}
