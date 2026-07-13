import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================
// Photoreal set dressing. Built from CC0 photoscanned PBR maps
// (Poly Haven): broken brick walls, a rubble field burying the
// floor, gauzy web sheets with real volume, daylight through a
// broken window — plus the tenants: spiders, beetles, a roach.
// ============================================================

const rand = (a, b) => a + Math.random() * (b - a)

// ---------- rubble chunk geometry: angular, displaced ----------
function chunkGeo(seed, box) {
  const geo = box
    ? new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
    : new THREE.DodecahedronGeometry(0.62, 0)
  const pos = geo.attributes.position
  const rng = (i) => {
    const n = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
    return (n - Math.floor(n)) - 0.5
  }
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) * (1 + rng(i) * 0.42),
      pos.getY(i) * (1 + rng(i + 7) * 0.38),
      pos.getZ(i) * (1 + rng(i + 13) * 0.42)
    )
  }
  geo.computeVertexNormals()
  return geo
}

// ---------- the rubble field: buries the floor like the reference ----------
export function RubbleField() {
  const [rockDiff, rockNor, floorDiff, floorNor] = useTexture([
    '/textures/gray_rocks_diff_1k.jpg',
    '/textures/gray_rocks_nor_gl_1k.jpg',
    '/textures/embedded_rock_floor_diff_1k.jpg',
    '/textures/embedded_rock_floor_nor_gl_1k.jpg',
  ])
  ;[rockDiff, rockNor].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.6, 1.6) })
  ;[floorDiff, floorNor].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 3) })

  const chunks = useMemo(() => {
    const arr = []
    // pile height: taller at the back and toward the left, like a collapse
    const pileY = (x, z) => {
      const back = THREE.MathUtils.clamp((z + 6) / 5, 0, 1)
      const left = THREE.MathUtils.clamp((2 - x) / 9, 0, 1)
      return -2.2 + (1 - back) * 1.15 + left * 0.5 + rand(-0.08, 0.14)
    }
    for (let i = 0; i < 58; i++) {
      const x = rand(-7.6, 7.6)
      const z = rand(-5.6, 2.8)
      const big = Math.random() > 0.6
      const s = big ? rand(0.55, 1.35) : rand(0.24, 0.6)
      arr.push({
        pos: [x, pileY(x, z) - s * 0.22, z],
        scale: [s * rand(0.8, 1.3), s * rand(0.5, 0.85), s * rand(0.8, 1.3)],
        rot: [rand(0, 3.1), rand(0, 3.1), rand(0, 3.1)],
        seed: i * 3.31 + 1,
        box: Math.random() > 0.45,
        tint: ['#ded7c8', '#cfc7b6', '#c2b9a8', '#e8e1d2'][i % 4],
      })
    }
    return arr
  }, [])

  const geos = useMemo(() => chunks.map((c) => chunkGeo(c.seed, c.box)), [chunks])

  return (
    <group>
      {/* debris-strewn ground under the chunks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.25, -1]}>
        <planeGeometry args={[18, 14, 24, 18]} />
        <meshStandardMaterial map={floorDiff} normalMap={floorNor} color="#c9c0b2" roughness={0.96} />
      </mesh>
      {chunks.map((c, i) => (
        <mesh key={i} geometry={geos[i]} position={c.pos} scale={c.scale} rotation={c.rot} castShadow receiveShadow>
          <meshStandardMaterial map={rockDiff} normalMap={rockNor} color={c.tint} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- brick shell: back + side walls, whitewashed like the ref ----------
export function BrickShell() {
  const [diff, nor] = useTexture([
    '/textures/broken_brick_wall_diff_1k.jpg',
    '/textures/broken_brick_wall_nor_gl_1k.jpg',
  ])
  const mk = (rx, ry) => {
    const d = diff.clone(); const n = nor.clone()
    ;[d, n].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true })
    return [d, n]
  }
  const [backD, backN] = useMemo(() => mk(3.4, 1.6), [diff, nor])
  const [sideD, sideN] = useMemo(() => mk(3, 1.6), [diff, nor])

  const Wall = ({ d, n, whitewash = true, ...props }) => (
    <mesh {...props} receiveShadow>
      <planeGeometry args={props.size} />
      {/* limewash = flat pale paint over brick RELIEF: normal map only,
          the red diff shows through faintly via a low-opacity second pass */}
      <meshStandardMaterial
        map={whitewash ? null : d}
        normalMap={n}
        normalScale={new THREE.Vector2(1.4, 1.4)}
        color={whitewash ? '#c9c2b2' : '#efe9db'}
        roughness={0.95}
      />
    </mesh>
  )

  return (
    <group>
      {/* back wall around the window opening (window x -2.9..0.5, top y 2.8, sill y 0.4) */}
      <Wall d={backD} n={backN} size={[10.2, 5.9]} position={[-6, 0.5, -6]} />
      <Wall d={backD} n={backN} size={[10.6, 5.9]} position={[5.8, 0.5, -6]} />
      <Wall d={backD} n={backN} size={[3.4, 1.3]} position={[-1.2, 2.85, -6]} />
      <Wall d={backD} n={backN} size={[3.4, 2.8]} position={[-1.2, -2.0, -6]} />
      {/* sides: right wall keeps exposed red brick where the wash peeled,
          like the reference's right-hand wall */}
      <Wall d={sideD} n={sideN} size={[15, 5.9]} position={[-8, 0.5, -0.5]} rotation={[0, Math.PI / 2, 0]} />
      <Wall d={sideD} n={sideN} whitewash={false} size={[15, 5.9]} position={[8, 0.5, -0.5]} rotation={[0, -Math.PI / 2, 0]} />
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.45, -0.5]}>
        <planeGeometry args={[18, 15]} />
        <meshStandardMaterial color="#4e483e" roughness={1} />
      </mesh>
    </group>
  )
}

// ---------- the window: big, bright, broken ----------
export function BrokenWindow({ lit }) {
  const sunRef = useRef()
  return (
    <group position={[-1.2, 1.6, -5.96]}>
      {/* blown-out sky + soft foliage tint, like overgrown daylight */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[3.5, 2.5]} />
        <meshBasicMaterial color="#f4f8ee" toneMapped={false} />
      </mesh>
      <mesh position={[-0.7, -0.5, -0.02]} rotation={[0, 0, 0.4]}>
        <planeGeometry args={[1.8, 1.2]} />
        <meshBasicMaterial color="#b9c9a8" transparent opacity={0.5} toneMapped={false} />
      </mesh>
      {/* frame + mullions, weathered */}
      {[[0, 1.18, 3.6, 0.16], [0, -1.18, 3.6, 0.16]].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.05]} castShadow>
          <boxGeometry args={[w, h, 0.14]} />
          <meshStandardMaterial color="#4a4136" roughness={0.9} />
        </mesh>
      ))}
      {[[-1.72, 0], [0, 0], [1.72, 0]].map(([x, y], i) => (
        <mesh key={`v${i}`} position={[x, y, 0.05]} castShadow>
          <boxGeometry args={[0.16, 2.5, 0.14]} />
          <meshStandardMaterial color="#4a4136" roughness={0.9} />
        </mesh>
      ))}
      {/* broken X-brace like the reference, one bar snapped */}
      <mesh position={[-0.85, 0.1, 0.04]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[1.9, 0.07, 0.05]} />
        <meshStandardMaterial color="#3c352c" roughness={0.9} />
      </mesh>
      <mesh position={[0.9, 0.28, 0.04]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[1.6, 0.07, 0.05]} />
        <meshStandardMaterial color="#3c352c" roughness={0.9} />
      </mesh>
      <mesh position={[1.35, -0.75, 0.04]} rotation={[0, 0, -1.2]}>
        <boxGeometry args={[0.7, 0.07, 0.05]} />
        <meshStandardMaterial color="#3c352c" roughness={0.9} />
      </mesh>

      {/* daylight: strong directional through the opening + soft fill */}
      <directionalLight
        ref={sunRef}
        position={[-0.4, 1.6, 1.2]}
        target-position={[0.8, -4.2, 3.2]}
        color="#eef4e8"
        intensity={lit ? 4.2 : 1.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 0, 0.8]} color="#dfe8d8" intensity={lit ? 1.6 : 0.55} distance={9} decay={1.8} />
      {/* volumetric shaft, wider and softer */}
      <mesh position={[0.9, -1.7, 2.1]} rotation={[0.7, 0.08, 0]}>
        <planeGeometry args={[3.6, 5.6]} />
        <meshBasicMaterial
          color="#e5eede"
          transparent
          opacity={lit ? 0.075 : 0.035}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ---------- gauzy web sheets: canvas-painted fiber texture ----------
function makeWebSheetTexture(seed = 1) {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 256
  const g = c.getContext('2d')
  g.clearRect(0, 0, 256, 256)
  let s = seed
  const rng = () => { s = (s * 16807) % 2147483647; return (s / 2147483647) }
  // soft haze base
  const haze = g.createRadialGradient(128, 128, 10, 128, 128, 130)
  haze.addColorStop(0, 'rgba(235,232,222,0.34)')
  haze.addColorStop(0.7, 'rgba(235,232,222,0.12)')
  haze.addColorStop(1, 'rgba(235,232,222,0)')
  g.fillStyle = haze
  g.fillRect(0, 0, 256, 256)
  // fibrous strands criss-crossing
  for (let i = 0; i < 46; i++) {
    const x0 = rng() * 256, y0 = rng() * 256
    const x1 = x0 + (rng() - 0.5) * 240, y1 = y0 + (rng() - 0.5) * 240
    const mx = (x0 + x1) / 2 + (rng() - 0.5) * 50
    const my = (y0 + y1) / 2 + (rng() - 0.5) * 50
    g.strokeStyle = `rgba(240,238,228,${0.1 + rng() * 0.3})`
    g.lineWidth = 0.5 + rng() * 1.3
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke()
  }
  // knots / dust clumps
  for (let i = 0; i < 12; i++) {
    const x = rng() * 256, y = rng() * 256, r = 2 + rng() * 7
    const cl = g.createRadialGradient(x, y, 0, x, y, r)
    cl.addColorStop(0, 'rgba(238,236,226,0.5)')
    cl.addColorStop(1, 'rgba(238,236,226,0)')
    g.fillStyle = cl
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  return t
}

export function WebSheets() {
  const sheets = useMemo(() => {
    const defs = [
      // draped over the rubble peaks, mid-frame — the reference's signature
      { pos: [-3.4, -0.8, -3.4], rot: [-0.9, 0.15, 0.2], size: [3.4, 2.4], o: 0.5, seed: 11 },
      { pos: [0.6, -1.15, -2.2], rot: [-1.1, -0.1, 0.5], size: [2.8, 2.0], o: 0.42, seed: 23 },
      { pos: [3.6, -1.0, -3.6], rot: [-0.85, 0.2, -0.3], size: [2.6, 1.9], o: 0.4, seed: 37 },
      // strung from the window down to the heap
      { pos: [-2.9, 0.7, -5.2], rot: [-0.35, 0.1, 0.1], size: [2.6, 2.6], o: 0.46, seed: 5 },
      { pos: [0.4, 1.0, -5.5], rot: [-0.2, -0.2, -0.4], size: [2.2, 2.4], o: 0.36, seed: 41 },
      // corners
      { pos: [-7.5, 2.2, -4.9], rot: [0, 1.2, 0.3], size: [2.8, 2.6], o: 0.5, seed: 53 },
      { pos: [7.4, 0.4, -5.1], rot: [0, -1.1, -0.2], size: [2.4, 2.8], o: 0.42, seed: 67 },
      // low veil across the foreground rubble
      { pos: [-1.2, -1.7, 0.6], rot: [-1.25, 0, 0.15], size: [4.2, 2.2], o: 0.3, seed: 79 },
    ]
    return defs.map((d) => ({ ...d, tex: makeWebSheetTexture(d.seed) }))
  }, [])

  return (
    <group>
      {sheets.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot}>
          <planeGeometry args={s.size} />
          <meshBasicMaterial
            map={s.tex}
            transparent
            opacity={s.o}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

// ---------- thick anchor strands (tubes, not hairlines) ----------
export function AnchorStrands() {
  const tubes = useMemo(() => {
    const mk = (ax, ay, az, bx, by, bz, sag) => {
      const mid = new THREE.Vector3((ax + bx) / 2, (ay + by) / 2 - sag, (az + bz) / 2)
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(ax, ay, az), mid, new THREE.Vector3(bx, by, bz),
      ])
      return new THREE.TubeGeometry(curve, 14, 0.011, 4, false)
    }
    return [
      mk(-2.9, 2.75, -5.9, -4.6, -0.6, -3.8, 0.5),
      mk(0.4, 2.8, -5.9, 2.6, -0.7, -3.2, 0.7),
      mk(-7.9, 3.2, -4.2, -4.9, 0.4, -5.1, 0.5),
      mk(-6.8, -0.2, -5.4, -2.3, -0.9, -3.3, 0.35),
      mk(3.4, -0.75, -3.5, 7.5, 0.6, -5.0, 0.45),
      mk(1.2, -1.2, -1.6, -2.4, -1.5, 0.8, 0.3),
    ]
  }, [])
  return (
    <group>
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color="#e2ddcf" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- a spider that patrols the rubble on foot ----------
export function CrawlerSpider() {
  const rig = useRef()
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.8, -0.7, -3.9),
    new THREE.Vector3(-3.0, -0.75, -4.2),
    new THREE.Vector3(-1.5, -0.95, -3.4),
    new THREE.Vector3(-2.9, -1.3, -2.4),
    new THREE.Vector3(-4.6, -1.05, -3.0),
  ], true), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const ahead = useMemo(() => new THREE.Vector3(), [])
  const state = useRef({ t: 0, pause: 0 })

  useFrame(({ clock }, dt) => {
    if (!rig.current) return
    const s = state.current
    const tt = clock.elapsedTime
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
      <mesh position={[0, 0.07, -0.1]} scale={[1, 0.85, 1.35]} castShadow>
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
        st.from.set(rand(area[0], area[1]), area[4] ?? -2.1, rand(area[2], area[3]))
        st.to.set(st.from.x + rand(-1.4, 1.4), st.from.y, st.from.z + rand(-1, 1))
        st.t = 0
        st.dur = rand(2.5, 4.5)
      }
      return
    }
    ref.current.visible = true
    st.t += dt / st.dur
    ref.current.position.lerpVectors(st.from, st.to, st.t)
    ref.current.position.x += Math.sin(st.t * 26) * 0.02
    ref.current.lookAt(st.to.x, st.from.y, st.to.z)
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
        const dir = Math.random() > 0.5 ? 1 : -1
        st.from.set(-dir * rand(4, 6.5), -2.02, rand(0.5, 3.5))
        st.to.set(dir * rand(3.5, 6.5), -2.02, st.from.z + rand(-1.2, 1.2))
        st.t = 0
        st.dur = rand(1.4, 2.1)
        st.midPause = Math.random() > 0.55 ? rand(0.4, 1.1) : 0
      }
      return
    }
    ref.current.visible = true
    if (st.midPause > 0 && st.t > 0.45 && st.t < 0.5) {
      st.midPause -= dt
    } else {
      st.t += dt / st.dur
    }
    ref.current.position.lerpVectors(st.from, st.to, st.t)
    ref.current.position.x += Math.sin(st.t * 34) * 0.045
    ref.current.lookAt(st.to.x, -2.02, st.to.z)
    const sweep = Math.sin(now * 13)
    if (antL.current) antL.current.rotation.y = 0.5 + sweep * 0.25
    if (antR.current) antR.current.rotation.y = -0.5 - sweep * 0.25
    if (st.t >= 1) st.nextAt = now + rand(11, 22)
  })

  return (
    <group ref={ref} visible={false}>
      <mesh scale={[1, 0.42, 1.7]} castShadow>
        <sphereGeometry args={[0.085, 12, 8]} />
        <meshStandardMaterial color="#2c1a0a" roughness={0.28} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.01, 0.12]} scale={[0.7, 0.4, 0.6]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshStandardMaterial color="#1f1206" roughness={0.35} />
      </mesh>
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
      <Beetle area={[-5.5, -1, -4.2, -2.4, -0.9]} />
      <Beetle area={[3.5, 6.5, -4.6, -2.6, -1.4]} />
      <Cockroach />
    </group>
  )
}
