import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ============================================================
// A burning flame. The kit's candles/torches bake the flame into
// the texture atlas — it never emits — so we lay a real flame over
// the wick: a camera-facing additive sprite the bloom pass catches,
// plus a warm point light. Each flame manages its own lit→unlit fade
// (staggered by `delay`) with NO per-frame React state. `base` keeps
// a pilot flame burning even before the room is lit. Only the flame
// emits — never the wax, never the whole object.
// ============================================================

let _core
function coreTex() {
  if (_core) return _core
  const c = document.createElement('canvas'); c.width = 64; c.height = 96
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(32, 62, 1, 32, 56, 48)
  grad.addColorStop(0, 'rgba(255,255,247,1)')
  grad.addColorStop(0.22, 'rgba(255,233,162,0.97)')
  grad.addColorStop(0.5, 'rgba(255,160,68,0.55)')
  grad.addColorStop(1, 'rgba(255,120,40,0)')
  g.fillStyle = grad
  g.beginPath()
  g.moveTo(32, 3)
  g.quadraticCurveTo(62, 55, 32, 95)
  g.quadraticCurveTo(2, 55, 32, 3)
  g.closePath(); g.fill()
  _core = new THREE.CanvasTexture(c)
  return _core
}

let _halo
function haloTex() {
  if (_halo) return _halo
  const c = document.createElement('canvas'); c.width = 128; c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 2, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,196,116,0.6)')
  grad.addColorStop(0.5, 'rgba(255,162,72,0.17)')
  grad.addColorStop(1, 'rgba(255,150,60,0)')
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128)
  _halo = new THREE.CanvasTexture(c)
  return _halo
}

export function Flame({
  position = [0, 0, 0],
  size = 0.34,
  light = 1.6,
  distance = 8,
  decay = 2,
  delay = 0,
  base = 0,
  lit = true,
  color = '#ffbe70',
  castLight = true,
}) {
  const core = useRef()
  const halo = useRef()
  const lightRef = useRef()
  const st = useRef({ prev: null, at: -100, on: lit ? 1 : base }).current
  const ctex = useMemo(coreTex, [])
  const htex = useMemo(haloTex, [])
  const seed = useMemo(() => position[0] * 3.1 + position[2] * 1.7, [position])

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    if (lit !== st.prev) { st.prev = lit; st.at = t }
    const since = t - st.at
    // lit: catch the flame a beat after the lantern is hung (delay);
    // unlit: snuff back down to the pilot level (base — 0 for most)
    const target = lit
      ? Math.max(base, THREE.MathUtils.smoothstep(since - delay, 0, 0.7))
      : base
    st.on += (target - st.on) * 0.12

    const flick =
      0.8 + Math.sin(t * 11 + seed) * 0.1 + Math.sin(t * 23.7 + seed * 2) * 0.06 +
      (Math.random() > 0.99 ? -0.24 : 0)
    const on = Math.max(0, st.on)

    if (core.current) {
      core.current.quaternion.copy(camera.quaternion)
      const s = size * (0.86 + flick * 0.18)
      core.current.scale.set(s * 0.62, s, s)
      core.current.material.opacity = Math.min(1, on * 1.15) * (0.82 + flick * 0.18)
      core.current.visible = on > 0.01
    }
    if (halo.current) {
      halo.current.quaternion.copy(camera.quaternion)
      const s = size * (2.9 + flick * 0.5)
      halo.current.scale.set(s, s, s)
      halo.current.material.opacity = on * 0.6 * flick
      halo.current.visible = on > 0.01
    }
    if (lightRef.current) lightRef.current.intensity = light * flick * on
  })

  return (
    <group position={position}>
      <mesh ref={halo}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={htex} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={core} position={[0, size * 0.55, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={ctex} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {castLight && (
        <pointLight ref={lightRef} color={color} intensity={0} distance={distance} decay={decay} position={[0, size * 0.55, 0]} />
      )}
    </group>
  )
}
