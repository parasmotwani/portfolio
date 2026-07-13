import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ============================================================
// Set dressing for the entrance: a broken window pouring cold
// light, a rubble heap draped in stringy webs, and the life
// that moved in after the people left — spiders, beetles, and
// a cockroach that bolts across the floor at intervals.
// ============================================================

const rand = (a, b) => a + Math.random() * (b - a)

// ---------- rubble ----------
function jitteredRock(seed) {
  const geo = new THREE.DodecahedronGeometry(1, 0)
  const pos = geo.attributes.position
  const rng = (i) => {
    const n = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
    return (n - Math.floor(n)) - 0.5
  }
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) * (1 + rng(i) * 0.5),
      pos.getY(i) * (1 + rng(i + 7) * 0.45),
      pos.getZ(i) * (1 + rng(i + 13) * 0.5)
    )
  }
  geo.computeVertexNormals()
  return geo
}

const ROCK_COLORS = ['#5c544a', '#514a40', '#464038', '#5a5248', '#3e3830']

export function Rubble() {
  const rocks = useMemo(() => {
    const arr = []
    // heap under the window (back-left) …
    for (let i = 0; i < 9; i++) {
      arr.push({
        pos: [rand(-6.4, -1.4), -2.2 + rand(0.05, 0.5), rand(-5.6, -3.6)],
        scale: [rand(0.35, 0.95), rand(0.22, 0.6), rand(0.35, 0.9)],
        rot: [rand(0, 3), rand(0, 3), rand(0, 3)],
        seed: i * 3.7 + 1,
        color: ROCK_COLORS[i % ROCK_COLORS.length],
      })
    }
    // …and a smaller spill in the right corner
    for (let i = 0; i < 5; i++) {
      arr.push({
        pos: [rand(5.4, 7.6), -2.2 + rand(0.03, 0.3), rand(-5.4, -4)],
        scale: [rand(0.25, 0.6), rand(0.15, 0.4), rand(0.25, 0.6)],
        rot: [rand(0, 3), rand(0, 3), rand(0, 3)],
        seed: i * 5.1 + 40,
        color: ROCK_COLORS[(i + 2) % ROCK_COLORS.length],
      })
    }
    return arr
  }, [])

  const geos = useMemo(() => rocks.map((r) => jitteredRock(r.seed)), [rocks])

  return (
    <group>
      {rocks.map((r, i) => (
        <mesh key={i} geometry={geos[i]} position={r.pos} scale={r.scale} rotation={r.rot}>
          <meshStandardMaterial color={r.color} roughness={0.96} />
        </mesh>
      ))}
      {/* fine debris scatter */}
      {rocks.slice(0, 8).map((r, i) => (
        <mesh key={`d${i}`} position={[r.pos[0] + rand(-0.9, 0.9), -2.18, r.pos[2] + rand(0.4, 1.3)]} rotation={[0, rand(0, 3), 0]}>
          <boxGeometry args={[rand(0.06, 0.16), 0.04, rand(0.06, 0.16)]} />
          <meshStandardMaterial color="#4a443c" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- broken window + cold light ----------
export function BrokenWindow({ lit }) {
  return (
    <group position={[-4.7, 1.45, -5.97]}>
      {/* recess + pale sky behind */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[2.5, 1.9]} />
        <meshBasicMaterial color="#0e1114" />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.3, 1.7]} />
        <meshBasicMaterial color="#5e6d78" />
      </mesh>
      <mesh position={[0.15, 0.1, 0]}>
        <planeGeometry args={[1.7, 1.25]} />
        <meshBasicMaterial color="#8b9aa4" />
      </mesh>
      {/* frame */}
      {[
        [0, 0.92, 2.6, 0.14], [0, -0.92, 2.6, 0.14],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.04]}>
          <boxGeometry args={[w, h, 0.1]} />
          <meshStandardMaterial color="#241d14" roughness={0.85} />
        </mesh>
      ))}
      {[[-1.24, 0], [1.24, 0]].map(([x, y], i) => (
        <mesh key={`v${i}`} position={[x, y, 0.04]}>
          <boxGeometry args={[0.14, 1.98, 0.1]} />
          <meshStandardMaterial color="#241d14" roughness={0.85} />
        </mesh>
      ))}
      {/* broken crossbars — one intact, one snapped and hanging */}
      <mesh position={[-0.62, 0.05, 0.03]} rotation={[0, 0, 0.04]}>
        <boxGeometry args={[1.1, 0.07, 0.06]} />
        <meshStandardMaterial color="#2a2217" roughness={0.9} />
      </mesh>
      <mesh position={[0.72, -0.28, 0.03]} rotation={[0, 0, -0.7]}>
        <boxGeometry args={[0.8, 0.07, 0.06]} />
        <meshStandardMaterial color="#2a2217" roughness={0.9} />
      </mesh>
      {/* glass shards left in the frame */}
      {[[-0.9, 0.55, 0.5], [0.4, 0.75, -0.4], [0.95, -0.6, 0.9]].map(([x, y, r], i) => (
        <mesh key={`g${i}`} position={[x, y, 0.02]} rotation={[0, 0, r]}>
          <coneGeometry args={[0.12, 0.34, 3]} />
          <meshStandardMaterial color="#6e7a82" transparent opacity={0.5} roughness={0.15} metalness={0.2} />
        </mesh>
      ))}
      {/* cold light pouring in */}
      <spotLight
        position={[0, 0.2, 0.4]}
        target-position={[1.6, -3.4, 3.4]}
        angle={0.72}
        penumbra={0.9}
        color="#a9b8c6"
        intensity={lit ? 5 : 2.6}
        distance={16}
        decay={1.6}
      />
      {/* faint volumetric shaft */}
      <mesh position={[0.7, -1.15, 1.5]} rotation={[0.62, 0.06, 0]}>
        <planeGeometry args={[2.3, 4.6]} />
        <meshBasicMaterial
          color="#9fb2c2"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ---------- draped webs: catenary strands between anchors ----------
export function DrapedWebs() {
  const { coarse, fine } = useMemo(() => {
    const coarse = []
    const fine = []
    const A = new THREE.Vector3(), B = new THREE.Vector3(), P = new THREE.Vector3(), Q = new THREE.Vector3()

    const strand = (ax, ay, az, bx, by, bz, sag, out, segs = 9) => {
      A.set(ax, ay, az); B.set(bx, by, bz)
      for (let i = 0; i < segs; i++) {
        const t0 = i / segs, t1 = (i + 1) / segs
        P.lerpVectors(A, B, t0); P.y -= Math.sin(t0 * Math.PI) * sag
        Q.lerpVectors(A, B, t1); Q.y -= Math.sin(t1 * Math.PI) * sag
        out.push(P.x, P.y, P.z, Q.x, Q.y, Q.z)
      }
      // occasional vertical drip from the low point
      if (sag > 0.25) {
        P.lerpVectors(A, B, 0.5); P.y -= sag
        out.push(P.x, P.y, P.z, P.x, P.y - sag * rand(0.5, 1.2), P.z + 0.05)
      }
    }

    // window ↔ rubble heap
    strand(-5.95, 2.35, -5.9, -5.9, -1.6, -4.6, 0.55, coarse)
    strand(-3.5, 2.4, -5.9, -2.2, -1.5, -4.2, 0.7, coarse)
    strand(-5.9, 0.55, -5.92, -2.6, -1.35, -4.4, 0.35, fine)
    // across the heap, rock to rock
    strand(-6.1, -1.55, -4.5, -3.4, -1.5, -4.0, 0.4, coarse)
    strand(-5.2, -1.5, -4.9, -1.6, -1.7, -3.9, 0.5, fine)
    strand(-3.3, -1.4, -4.3, -2.0, -2.0, -3.3, 0.3, fine)
    // corner web area ↔ wall
    strand(-7.95, 3.3, -4.4, -6.2, 1.5, -5.9, 0.45, fine)
    strand(-7.9, 2.2, -5.2, -6.6, -1.4, -4.8, 0.6, coarse)
    // right corner spill
    strand(7.95, 0.8, -4.6, 5.9, -1.8, -4.5, 0.5, fine)
    strand(6.3, -1.7, -5.1, 7.9, -1.9, -4.1, 0.3, fine)

    return { coarse: new Float32Array(coarse), fine: new Float32Array(fine) }
  }, [])

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={coarse} count={coarse.length / 3} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#d4cfc0" transparent opacity={0.3} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={fine} count={fine.length / 3} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#c9c4b4" transparent opacity={0.16} />
      </lineSegments>
    </group>
  )
}

// ---------- a spider that patrols the rubble on foot ----------
export function CrawlerSpider() {
  const rig = useRef()
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.8, -1.35, -4.4),
    new THREE.Vector3(-4.2, -1.2, -4.6),
    new THREE.Vector3(-2.6, -1.35, -4.1),
    new THREE.Vector3(-3.8, -1.85, -3.4),
    new THREE.Vector3(-5.6, -1.7, -3.8),
  ], true), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const ahead = useMemo(() => new THREE.Vector3(), [])
  const state = useRef({ t: 0, pause: 0 })

  useFrame(({ clock }, dt) => {
    if (!rig.current) return
    const s = state.current
    const tt = clock.elapsedTime
    // stop-and-go patrol
    if (s.pause > 0) {
      s.pause -= dt
    } else {
      s.t = (s.t + dt * 0.016) % 1
      if (Math.random() > 0.9985) s.pause = rand(1.5, 4)
    }
    path.getPointAt(s.t, pos)
    path.getPointAt((s.t + 0.01) % 1, ahead)
    rig.current.position.copy(pos)
    rig.current.lookAt(ahead)
    // legs skitter only while moving
    const moving = s.pause <= 0 ? 1 : 0.15
    rig.current.traverse((o) => {
      if (o.name?.startsWith('cl')) {
        const i = Number(o.name.slice(2))
        o.rotation.x = Math.sin(tt * 9 + i * 1.9) * 0.14 * moving
      }
    })
  })

  const legs = useMemo(() => {
    const arr = []
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        arr.push({ yaw: side * (0.5 + i * 0.44), side, i: arr.length })
      }
    }
    return arr
  }, [])

  return (
    <group ref={rig} scale={0.62}>
      <mesh position={[0, 0.07, -0.1]} scale={[1, 0.85, 1.35]}>
        <sphereGeometry args={[0.13, 14, 10]} />
        <meshStandardMaterial color="#221c13" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.06, 0.1]}>
        <sphereGeometry args={[0.08, 12, 8]} />
        <meshStandardMaterial color="#2a2318" roughness={0.75} />
      </mesh>
      {legs.map((l) => (
        <group key={l.i} name={`cl${l.i}`} rotation={[0, l.yaw, 0]}>
          <mesh position={[l.side * 0.16, 0.06, 0]} rotation={[0, 0, l.side * 0.75]}>
            <cylinderGeometry args={[0.008, 0.012, 0.3, 4]} />
            <meshStandardMaterial color="#1a140c" roughness={0.9} />
          </mesh>
          <mesh position={[l.side * 0.3, -0.03, 0]} rotation={[0, 0, -l.side * 0.9]}>
            <cylinderGeometry args={[0.005, 0.008, 0.26, 4]} />
            <meshStandardMaterial color="#15100a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ---------- interval critters: beetles + the cockroach ----------
function Beetle({ area }) {
  const ref = useRef()
  const s = useRef({
    from: new THREE.Vector3(), to: new THREE.Vector3(),
    t: 1, nextAt: rand(2, 8), dur: 3,
  })

  useFrame(({ clock }, dt) => {
    if (!ref.current) return
    const st = s.current
    const now = clock.elapsedTime
    if (st.t >= 1) {
      ref.current.visible = false
      if (now > st.nextAt) {
        st.from.set(rand(area[0], area[1]), -2.17, rand(area[2], area[3]))
        st.to.set(st.from.x + rand(-1.4, 1.4), -2.17, st.from.z + rand(-1, 1))
        st.t = 0
        st.dur = rand(2.5, 4.5)
      }
      return
    }
    ref.current.visible = true
    st.t += dt / st.dur
    const e = st.t
    ref.current.position.lerpVectors(st.from, st.to, e)
    ref.current.position.x += Math.sin(e * 26) * 0.02
    ref.current.lookAt(st.to.x, -2.17, st.to.z)
    if (st.t >= 1) st.nextAt = now + rand(6, 14)
  })

  return (
    <group ref={ref} visible={false}>
      <mesh scale={[1, 0.55, 1.5]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#171106" roughness={0.5} />
      </mesh>
    </group>
  )
}

function Cockroach() {
  const ref = useRef()
  const antL = useRef()
  const antR = useRef()
  const s = useRef({
    from: new THREE.Vector3(), to: new THREE.Vector3(),
    t: 1, nextAt: rand(6, 12), dur: 1.7, midPause: 0,
  })

  useFrame(({ clock }, dt) => {
    if (!ref.current) return
    const st = s.current
    const now = clock.elapsedTime
    if (st.t >= 1) {
      ref.current.visible = false
      if (now > st.nextAt) {
        // dash across the open floor in front of the rubble
        const dir = Math.random() > 0.5 ? 1 : -1
        st.from.set(-dir * rand(5, 7), -2.16, rand(-1.5, 3.5))
        st.to.set(dir * rand(4, 7), -2.16, st.from.z + rand(-1.5, 1.5))
        st.t = 0
        st.dur = rand(1.4, 2.1)
        st.midPause = Math.random() > 0.55 ? rand(0.4, 1.1) : 0
      }
      return
    }
    ref.current.visible = true
    // freeze mid-dash sometimes — the roach "listens", then bolts on
    if (st.midPause > 0 && st.t > 0.45 && st.t < 0.5) {
      st.midPause -= dt
    } else {
      st.t += dt / st.dur
    }
    ref.current.position.lerpVectors(st.from, st.to, st.t)
    ref.current.position.x += Math.sin(st.t * 34) * 0.045
    ref.current.lookAt(st.to.x, -2.16, st.to.z)
    // antennae sweep
    const sweep = Math.sin(now * 13)
    if (antL.current) antL.current.rotation.y = 0.5 + sweep * 0.25
    if (antR.current) antR.current.rotation.y = -0.5 - sweep * 0.25
    if (st.t >= 1) st.nextAt = now + rand(11, 22)
  })

  return (
    <group ref={ref} visible={false}>
      {/* glossy flattened body */}
      <mesh scale={[1, 0.42, 1.7]}>
        <sphereGeometry args={[0.085, 12, 8]} />
        <meshStandardMaterial color="#2c1a0a" roughness={0.28} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.01, 0.12]} scale={[0.7, 0.4, 0.6]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshStandardMaterial color="#1f1206" roughness={0.35} />
      </mesh>
      {/* antennae */}
      <group ref={antL} position={[0.02, 0.02, 0.16]}>
        <mesh position={[0.06, 0.02, 0.08]} rotation={[0.3, 0, -0.4]}>
          <cylinderGeometry args={[0.0022, 0.004, 0.22, 3]} />
          <meshBasicMaterial color="#1a0f05" />
        </mesh>
      </group>
      <group ref={antR} position={[-0.02, 0.02, 0.16]}>
        <mesh position={[-0.06, 0.02, 0.08]} rotation={[0.3, 0, 0.4]}>
          <cylinderGeometry args={[0.0022, 0.004, 0.22, 3]} />
          <meshBasicMaterial color="#1a0f05" />
        </mesh>
      </group>
    </group>
  )
}

export function Critters() {
  return (
    <group>
      <CrawlerSpider />
      <Beetle area={[-6, -1, -4.6, -2.6]} />
      <Beetle area={[4.6, 7.4, -5, -3]} />
      <Cockroach />
    </group>
  )
}
