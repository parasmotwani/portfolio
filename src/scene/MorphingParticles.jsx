import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScroll } from '../hooks/useScrollProgress'
import { sceneState } from './sceneState'
import {
  neuralNetwork, neuralNetworkLines, dataCloud, clusters,
  grid, wave, converge, chaos,
} from './targets'

const vertexShader = /* glsl */ `
  attribute float aTint;
  attribute float aCluster;
  attribute float aSize;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTint;
  varying float vCluster;

  void main() {
    vTint = aTint;
    vCluster = aCluster;
    vec3 p = position;
    // organic drift
    p.x += sin(uTime * 0.6 + position.y * 1.7) * 0.06;
    p.y += cos(uTime * 0.5 + position.x * 1.3) * 0.06;
    p.z += sin(uTime * 0.4 + position.z * 2.1) * 0.05;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (36.0 / -mv.z);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uHighlight;
  uniform float uClusterMix;
  uniform float uOpacity;
  varying float vTint;
  varying float vCluster;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.15, d) * uOpacity;

    vec3 grey = vec3(0.82, 0.82, 0.79);
    vec3 red = vec3(0.902, 0.224, 0.275);

    float isHighlighted = step(abs(vCluster - uHighlight), 0.5) * uClusterMix;
    float redness = max(vTint, isHighlighted);

    gl_FragColor = vec4(mix(grey, red, redness), alpha);
  }
`

export default function MorphingParticles({ count = 4000 }) {
  const { scrollRef, boundariesRef } = useScroll()
  const pointsRef = useRef()
  const linesRef = useRef()
  const groupRef = useRef()

  const { states, current, tints, clusterIds, sizes, lineVerts } = useMemo(() => {
    const net = neuralNetwork(count)
    const cloud = dataCloud(count)
    const clus = clusters(count)
    const gridP = grid(count)
    const waveP = wave(count)
    const conv = converge(count)
    const tints = new Float32Array(count)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      tints[i] = i % 13 === 0 ? 1 : 0 // ~8% red
      sizes[i] = 1.6 + (i % 7) * 0.28
    }
    return {
      states: [net, cloud, clus.positions, gridP, waveP, conv],
      current: chaos(count),
      tints,
      clusterIds: clus.clusterIds,
      sizes,
      lineVerts: neuralNetworkLines(),
    }
  }, [count])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
    uHighlight: { value: -1 },
    uClusterMix: { value: 0 },
    uOpacity: { value: 0.85 },
  }), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    uniforms.uTime.value = t

    // --- which state pair are we between? ---
    const bounds = boundariesRef.current
    const vh = window.innerHeight
    const anchor = scrollRef.current + vh * 0.5
    let a = 0
    if (bounds.length) {
      for (let i = bounds.length - 1; i >= 0; i--) {
        if (anchor >= bounds[i]) { a = i; break }
      }
    }
    const b = Math.min(a + 1, states.length - 1)
    let blend = 0
    if (a !== b && bounds[b] !== undefined) {
      const raw = (anchor - bounds[a]) / Math.max(1, bounds[b] - bounds[a])
      // dwell in first half of a section, morph through the second half
      blend = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((raw - 0.5) * 2, 0, 1), 0, 1)
    }

    const stateA = states[Math.min(a, states.length - 1)]
    const stateB = states[b]

    // --- damped morph toward blended target ---
    const damp = 1 - Math.exp(-3.5 * delta)
    const geo = pointsRef.current.geometry
    const posAttr = geo.attributes.position
    const cur = posAttr.array
    for (let i = 0; i < cur.length; i++) {
      const target = stateA[i] + (stateB[i] - stateA[i]) * blend
      cur[i] += (target - cur[i]) * damp
    }
    posAttr.needsUpdate = true

    // --- state-dependent uniforms ---
    const CLUSTER_STATE = 2
    const clusterInfluence =
      (a === CLUSTER_STATE ? 1 - blend : 0) + (b === CLUSTER_STATE ? blend : 0)
    uniforms.uClusterMix.value = clusterInfluence
    uniforms.uHighlight.value = sceneState.highlightCluster

    // neural-net connection lines fade out when leaving hero
    const netInfluence = a === 0 ? 1 - blend : 0
    if (linesRef.current) {
      linesRef.current.material.opacity = 0.13 * netInfluence
      linesRef.current.visible = netInfluence > 0.01
    }

    // slow scene breathing
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.12
    }
  })

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={current} count={count} itemSize={3} />
          <bufferAttribute attach="attributes-aTint" array={tints} count={count} itemSize={1} />
          <bufferAttribute attach="attributes-aCluster" array={clusterIds} count={count} itemSize={1} />
          <bufferAttribute attach="attributes-aSize" array={sizes} count={count} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={lineVerts} count={lineVerts.length / 3} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#f2f2ed" transparent opacity={0.13} depthWrite={false} />
      </lineSegments>
    </group>
  )
}
