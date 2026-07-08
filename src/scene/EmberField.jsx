import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Sparse golden ember motes — pure atmosphere. Never dense enough
// to compete with text; drifts slowly upward like candle sparks.
export default function EmberField({ count = 260 }) {
  const pointsRef = useRef()

  const { positions, seeds, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
      seeds[i] = Math.random() * Math.PI * 2
      sizes[i] = 1 + Math.random() * 2.2
    }
    return { positions, seeds, sizes }
  }, [count])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
  }), [])

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-aSeed" array={seeds} count={count} itemSize={1} />
        <bufferAttribute attach="attributes-aSize" array={sizes} count={count} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          attribute float aSeed;
          attribute float aSize;
          uniform float uTime;
          uniform float uPixelRatio;
          varying float vFlicker;
          void main() {
            vec3 p = position;
            // slow upward drift, wrapping vertically
            p.y = mod(p.y + uTime * 0.18 + aSeed, 14.0) - 7.0;
            p.x += sin(uTime * 0.25 + aSeed * 4.0) * 0.4;
            vFlicker = 0.45 + 0.55 * sin(uTime * (0.8 + aSeed * 0.3) + aSeed * 7.0);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * uPixelRatio * (24.0 / -mv.z);
          }
        `}
        fragmentShader={/* glsl */ `
          varying float vFlicker;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float alpha = smoothstep(0.5, 0.1, d) * 0.68 * vFlicker;
            gl_FragColor = vec4(0.83, 0.66, 0.31, alpha); // old gold
          }
        `}
      />
    </points>
  )
}
