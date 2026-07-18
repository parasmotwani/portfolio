import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { heroState } from './heroState'
import { studyState } from './studyState'
import { makeWebSheetTexture, SpiderModel } from './RoomDressing'

// ============================================================
// Room I — the study, in real 3D like the entrance. Modeled on
// the reference photograph: mottled plaster walls, one bright
// window, a wardrobe sunk in shadow, a round pedestal table
// mid-floor, and the hutch on the right whose drawer sits ajar
// (the easter egg — the DOM hotspot over it opens the booklet).
// ============================================================

const rand = (a, b) => a + Math.random() * (b - a)

// soft dark blotch for damp stains on plaster
function makeBlotchTexture() {
  const c = document.createElement('canvas')
  c.width = 128; c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 6, 64, 64, 62)
  grad.addColorStop(0, 'rgba(0,0,0,0.5)')
  grad.addColorStop(0.6, 'rgba(0,0,0,0.24)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 5; i++) {
    const x = 20 + Math.random() * 88, y = 20 + Math.random() * 88, r = 8 + Math.random() * 18
    const sub = g.createRadialGradient(x, y, 0, x, y, r)
    sub.addColorStop(0, 'rgba(0,0,0,0.3)')
    sub.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = sub
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill()
  }
  return new THREE.CanvasTexture(c)
}

// ---------- shell: plaster walls, plank floor, stained ceiling ----------
function Shell() {
  const [plankD, plankN, plasterD, plasterN] = useTexture([
    '/textures/worn_planks_diff_1k.jpg',
    '/textures/worn_planks_nor_gl_1k.jpg',
    '/textures/painted_plaster_wall_diff_1k.jpg',
    '/textures/painted_plaster_wall_nor_gl_1k.jpg',
  ])
  ;[plankD, plankN].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4.5, 3.5) })
  const mkPlaster = (rx, ry) => {
    const d = plasterD.clone(); const n = plasterN.clone()
    ;[d, n].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true })
    return [d, n]
  }
  const [wallD, wallN] = useMemo(() => mkPlaster(3.2, 1.4), [plasterD, plasterN])
  const [ceilD, ceilN] = useMemo(() => mkPlaster(3.6, 3), [plasterD, plasterN])
  const blotch = useMemo(() => makeBlotchTexture(), [])

  const Wall = ({ size, tint = '#8f8a78', ...props }) => (
    <mesh {...props} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial map={wallD} normalMap={wallN} color={tint} roughness={0.96} />
    </mesh>
  )

  const peels = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    pos: [rand(-5, 5), 2.688, rand(-5.2, 1.4)],
    rot: [Math.PI / 2, 0, rand(0, 3.14)],
    size: [rand(0.3, 0.85), rand(0.18, 0.45)],
    tint: ['#6e6759', '#7a7364', '#655f52'][i % 3],
  })), [])

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0.4]} receiveShadow>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial map={plankD} normalMap={plankN} color="#9a8f7c" roughness={0.9} />
      </mesh>
      {/* back wall around the window (opening x -3.0..-0.4, y -0.3..2.1) */}
      <Wall size={[4.5, 5.1]} position={[-5.25, 0.15, -6]} />
      <Wall size={[7.9, 5.1]} position={[3.55, 0.15, -6]} />
      <Wall size={[2.6, 0.6]} position={[-1.7, 2.4, -6]} />
      <Wall size={[2.6, 2.1]} position={[-1.7, -1.35, -6]} />
      {/* sides */}
      <Wall size={[14, 5.1]} position={[-7.5, 0.15, 0.4]} rotation={[0, Math.PI / 2, 0]} tint="#837e6c" />
      <Wall size={[14, 5.1]} position={[7.5, 0.15, 0.4]} rotation={[0, -Math.PI / 2, 0]} tint="#7d7867" />
      {/* ceiling, stained + peeling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.7, 0.4]}>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial map={ceilD} normalMap={ceilN} color="#453f34" roughness={1} />
      </mesh>
      {peels.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={p.rot}>
          <planeGeometry args={p.size} />
          <meshStandardMaterial color={p.tint} roughness={1} />
        </mesh>
      ))}
      {/* damp blotches */}
      {[
        { pos: [1.4, 2.2, -5.96], size: [4.2, 1.6] },
        { pos: [-5.8, 1.3, -5.95], size: [2.6, 2.2] },
        { pos: [7.44, 0.9, -1.6], rot: [0, -Math.PI / 2, 0], size: [4, 2.6] },
        { pos: [0.4, 2.68, -2.2], rot: [Math.PI / 2, 0, 0.6], size: [5, 3] },
        { pos: [-7.44, 0.4, -2.8], rot: [0, Math.PI / 2, 0], size: [3, 3.4] },
      ].map((b, i) => (
        <mesh key={i} position={b.pos} rotation={b.rot ?? [0, 0, 0]}>
          <planeGeometry args={b.size} />
          <meshBasicMaterial map={blotch} transparent opacity={0.55} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- the window: blown-out daylight, one pane dead ----------
function StudyWindow({ lit }) {
  return (
    <group>
      <mesh position={[-1.7, 0.9, -6.04]}>
        <planeGeometry args={[2.6, 2.4]} />
        <meshBasicMaterial color="#f2f6ea" toneMapped={false} />
      </mesh>
      <mesh position={[-2.25, 0.35, -6.02]} rotation={[0, 0, 0.5]}>
        <planeGeometry args={[1.2, 0.9]} />
        <meshBasicMaterial color="#b7c4a4" transparent opacity={0.45} toneMapped={false} />
      </mesh>
      <mesh position={[-1.15, 1.55, -6.02]} rotation={[0, 0, -0.3]}>
        <planeGeometry args={[0.9, 0.7]} />
        <meshBasicMaterial color="#c2cdb0" transparent opacity={0.35} toneMapped={false} />
      </mesh>
      {/* the dead pane, lower right */}
      <mesh position={[-1.05, 0.1, -6.01]}>
        <planeGeometry args={[1.1, 0.72]} />
        <meshBasicMaterial color="#252b20" transparent opacity={0.85} />
      </mesh>
      {/* frame + mullions */}
      {[
        { pos: [-1.7, 2.14, -5.95], size: [2.9, 0.14, 0.14] },
        { pos: [-1.7, -0.34, -5.95], size: [2.9, 0.14, 0.14] },
        { pos: [-3.02, 0.9, -5.95], size: [0.14, 2.62, 0.14] },
        { pos: [-0.38, 0.9, -5.95], size: [0.14, 2.62, 0.14] },
        { pos: [-1.7, 0.9, -5.96], size: [0.08, 2.5, 0.09] },
        { pos: [-1.7, 0.5, -5.96], size: [2.6, 0.08, 0.09] },
        { pos: [-1.7, 1.3, -5.96], size: [2.6, 0.08, 0.09] },
      ].map((f, i) => (
        <mesh key={i} position={f.pos} castShadow>
          <boxGeometry args={f.size} />
          <meshStandardMaterial color="#3a3129" roughness={0.9} />
        </mesh>
      ))}
      {/* sill + shards of glass */}
      <mesh position={[-1.7, -0.42, -5.84]} castShadow>
        <boxGeometry args={[3.0, 0.09, 0.3]} />
        <meshStandardMaterial color="#332a21" roughness={0.85} />
      </mesh>
      <mesh position={[-1.15, -0.36, -5.8]} rotation={[0.3, 0.5, 0]}>
        <planeGeometry args={[0.16, 0.22]} />
        <meshStandardMaterial color="#dfe6d6" transparent opacity={0.4} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.8, -2.36, -5.2]} rotation={[-Math.PI / 2, 0, 0.8]}>
        <planeGeometry args={[0.2, 0.14]} />
        <meshStandardMaterial color="#d6ddcb" transparent opacity={0.35} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* daylight */}
      <directionalLight
        position={[-1.7, 1.5, -5.4]}
        target-position={[1.8, -2.4, 1.6]}
        color="#e9f1e2"
        intensity={lit ? 3.6 : 1.05}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-1.7, 0.9, -5.1]} color="#dfe8d8" intensity={lit ? 1.3 : 0.45} distance={9} decay={1.8} />
      {/* volumetric shaft toward the table */}
      <mesh position={[-0.9, -0.7, -3.7]} rotation={[0.66, 0.14, 0]}>
        <planeGeometry args={[3.0, 5.4]} />
        <meshBasicMaterial
          color="#e5eede"
          transparent
          opacity={lit ? 0.07 : 0.03}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ---------- wardrobe, sunk in the left shadow, one door ajar ----------
function Wardrobe() {
  return (
    <group position={[-5.6, 0, -4.0]} rotation={[0, 0.18, 0]}>
      <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 3.3, 0.75]} />
        <meshStandardMaterial color="#241a10" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.97, 0]} castShadow>
        <boxGeometry args={[1.9, 0.14, 0.85]} />
        <meshStandardMaterial color="#1c130b" roughness={0.85} />
      </mesh>
      {/* closed left door */}
      <mesh position={[-0.42, -0.75, 0.385]}>
        <boxGeometry args={[0.78, 3.0, 0.03]} />
        <meshStandardMaterial color="#2b2015" roughness={0.8} />
      </mesh>
      {/* dark slit + right door swung open a crack */}
      <mesh position={[0.42, -0.75, 0.36]}>
        <boxGeometry args={[0.72, 3.0, 0.02]} />
        <meshStandardMaterial color="#050403" roughness={1} />
      </mesh>
      <group position={[0.8, -0.75, 0.385]} rotation={[0, -0.5, 0]}>
        <mesh position={[-0.39, 0, 0]}>
          <boxGeometry args={[0.78, 3.0, 0.03]} />
          <meshStandardMaterial color="#2b2015" roughness={0.8} />
        </mesh>
        <mesh position={[-0.7, -0.12, 0.03]}>
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshStandardMaterial color="#6b5a3a" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>
      <mesh position={[-0.1, -0.12, 0.41]}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshStandardMaterial color="#6b5a3a" roughness={0.5} metalness={0.4} />
      </mesh>
      {[[-0.75, 0.32], [0.75, 0.32], [-0.75, -0.28], [0.75, -0.28]].map(([x, z], i) => (
        <mesh key={i} position={[x, -2.32, z]}>
          <boxGeometry args={[0.12, 0.16, 0.12]} />
          <meshStandardMaterial color="#1c130b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- the hutch: shelves of what was left, and THE drawer ----------
function Hutch({ glintRef }) {
  const wood = { color: '#2e2114', roughness: 0.8 }
  const woodDark = { color: '#221709', roughness: 0.85 }
  return (
    <group position={[5.55, 0, -2.4]} rotation={[0, -Math.PI / 2, 0]}>
      {/* lower cabinet + counter */}
      <mesh position={[0, -1.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 1.35, 0.85]} />
        <meshStandardMaterial {...wood} />
      </mesh>
      <mesh position={[0, -1.01, 0.02]} castShadow>
        <boxGeometry args={[3.2, 0.08, 0.95]} />
        <meshStandardMaterial {...woodDark} />
      </mesh>
      {/* upper shelf unit */}
      <mesh position={[0, 0.25, -0.36]}>
        <boxGeometry args={[3.0, 2.4, 0.06]} />
        <meshStandardMaterial color="#191007" roughness={0.9} />
      </mesh>
      {[[-1.47], [1.47]].map(([x], i) => (
        <mesh key={i} position={[x, 0.25, 0]} castShadow>
          <boxGeometry args={[0.07, 2.4, 0.8]} />
          <meshStandardMaterial {...wood} />
        </mesh>
      ))}
      <mesh position={[0, 1.49, 0]} castShadow>
        <boxGeometry args={[3.15, 0.09, 0.85]} />
        <meshStandardMaterial {...woodDark} />
      </mesh>
      {[[-0.3], [0.5]].map(([y], i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[2.9, 0.05, 0.72]} />
          <meshStandardMaterial {...wood} />
        </mesh>
      ))}
      {/* plates leaning against the back, one tipped */}
      {[[-0.9, 0.5, 0], [-0.45, 0.5, 0], [0.9, -0.3, 0.45]].map(([x, y, tip], i) => (
        <mesh key={i} position={[x, y + 0.22, -0.22]} rotation={[-0.35, 0, tip]}>
          <cylinderGeometry args={[0.2, 0.2, 0.025, 18]} />
          <meshStandardMaterial color="#bdb5a0" roughness={0.4} />
        </mesh>
      ))}
      {[[0.3, 0.5], [0.55, 0.5]].map(([x, y], i) => (
        <mesh key={i} position={[x, y + 0.07, 0.1]}>
          <cylinderGeometry args={[0.055, 0.045, 0.09, 10]} />
          <meshStandardMaterial color="#a89f8a" roughness={0.5} />
        </mesh>
      ))}
      {/* the books that survived, leaning */}
      {[[-1.1, 0, '#3a2c1a'], [-0.95, 0.06, '#2c2317'], [-0.78, -0.06, '#41331e'], [-0.55, 0.28, '#33281a'], [0.15, 0.1, '#2a2013']].map(([x, lean, c], i) => (
        <mesh key={i} position={[x, -0.09, 0.05]} rotation={[0, 0, lean]} castShadow>
          <boxGeometry args={[0.06, 0.38, 0.26]} />
          <meshStandardMaterial color={c} roughness={0.75} />
        </mesh>
      ))}
      {/* THE DRAWER — pulled part-way, paper catching the light */}
      <group position={[-0.55, -1.24, 0]}>
        <mesh position={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.95, 0.26, 0.6]} />
          <meshStandardMaterial color="#180f07" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.62]} castShadow>
          <boxGeometry args={[1.0, 0.3, 0.045]} />
          <meshStandardMaterial color="#332516" roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.02, 0.66]}>
          <sphereGeometry args={[0.035, 10, 8]} />
          <meshStandardMaterial color="#6b5a3a" roughness={0.45} metalness={0.4} />
        </mesh>
        <mesh ref={glintRef} position={[0.1, 0.16, 0.5]} rotation={[-1.25, 0.1, 0.08]}>
          <planeGeometry args={[0.46, 0.14]} />
          <meshStandardMaterial
            color="#d8d2c0"
            emissive="#d8d2c0"
            emissiveIntensity={0.25}
            roughness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      {/* second drawer, shut tight */}
      <mesh position={[0.75, -1.24, 0.44]}>
        <boxGeometry args={[1.0, 0.3, 0.045]} />
        <meshStandardMaterial color="#2e2114" roughness={0.8} />
      </mesh>
      <mesh position={[0.75, -1.26, 0.47]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color="#57482e" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* cabinet doors */}
      {[[-0.75], [0.75]].map(([x], i) => (
        <mesh key={i} position={[x, -1.95, 0.44]}>
          <boxGeometry args={[1.2, 0.8, 0.03]} />
          <meshStandardMaterial color="#271b0e" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- round pedestal table + what was abandoned on it ----------
function Table() {
  return (
    <group position={[-0.5, 0, -1.8]}>
      <mesh position={[0, -1.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.15, 1.15, 0.06, 28]} />
        <meshStandardMaterial color="#4a3a28" roughness={0.55} />
      </mesh>
      <mesh position={[0, -1.34, 0]}>
        <cylinderGeometry args={[1.06, 1.06, 0.06, 28]} />
        <meshStandardMaterial color="#3a2c1c" roughness={0.7} />
      </mesh>
      <mesh position={[0, -1.82, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 0.95, 12]} />
        <meshStandardMaterial color="#382a19" roughness={0.75} />
      </mesh>
      <mesh position={[0, -1.44, 0]}>
        <cylinderGeometry args={[0.17, 0.14, 0.08, 12]} />
        <meshStandardMaterial color="#42321f" roughness={0.7} />
      </mesh>
      <mesh position={[0, -2.26, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.42, 0.14, 12]} />
        <meshStandardMaterial color="#332616" roughness={0.8} />
      </mesh>
      {[0, 2.09, -2.09].map((a, i) => (
        <group key={i} rotation={[0, a, 0]}>
          <mesh position={[0.3, -2.36, 0]} rotation={[0, 0, -0.12]} castShadow>
            <boxGeometry args={[0.4, 0.06, 0.1]} />
            <meshStandardMaterial color="#2c2010" roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* the bottle */}
      <mesh position={[-0.35, -1.05, 0.1]} castShadow>
        <cylinderGeometry args={[0.085, 0.09, 0.4, 14]} />
        <meshStandardMaterial color="#26331f" roughness={0.12} />
      </mesh>
      <mesh position={[-0.35, -0.79, 0.1]}>
        <cylinderGeometry args={[0.03, 0.045, 0.16, 10]} />
        <meshStandardMaterial color="#22301c" roughness={0.15} />
      </mesh>
      <mesh position={[-0.35, -0.7, 0.1]}>
        <cylinderGeometry args={[0.026, 0.026, 0.04, 8]} />
        <meshStandardMaterial color="#8a6f4a" roughness={0.8} />
      </mesh>
      {/* bowl */}
      <mesh position={[0.28, -1.2, -0.18]} castShadow>
        <cylinderGeometry args={[0.17, 0.11, 0.1, 16]} />
        <meshStandardMaterial color="#a39a85" roughness={0.5} />
      </mesh>
      <mesh position={[0.28, -1.155, -0.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.145, 16]} />
        <meshStandardMaterial color="#3c352a" roughness={0.9} />
      </mesh>
      {/* a shut book, pages browned */}
      <group position={[0.18, -1.22, 0.34]} rotation={[0, 0.35, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.36, 0.06, 0.26]} />
          <meshStandardMaterial color="#3a2a16" roughness={0.7} />
        </mesh>
        <mesh position={[0.012, 0, 0]}>
          <boxGeometry args={[0.34, 0.042, 0.24]} />
          <meshStandardMaterial color="#c9bd9d" roughness={0.9} />
        </mesh>
      </group>
      {/* loose papers */}
      {[[-0.05, 0.42, 0.4], [0.55, 0.12, -0.5]].map(([x, z, r], i) => (
        <mesh key={i} position={[x, -1.246 - i * 0.002, z]} rotation={[-Math.PI / 2, 0, r]}>
          <planeGeometry args={[0.32, 0.23]} />
          <meshStandardMaterial color="#d3ccb8" roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* oil lamp */}
      <group position={[-0.02, 0, -0.38]}>
        <mesh position={[0, -1.2, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.095, 0.1, 12]} />
          <meshStandardMaterial color="#5a4a2e" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, -1.08, 0]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color="#c9b287" transparent opacity={0.35} roughness={0.1} />
        </mesh>
      </group>
    </group>
  )
}

// ---------- bentwood chair ----------
function Chair({ position, rotY = 0 }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, -1.5, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.4, 0.05, 16]} />
        <meshStandardMaterial color="#241a10" roughness={0.8} />
      </mesh>
      {[[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]].map(([x, z], i) => (
        <mesh key={i} position={[x * 1.1, -1.96, z * 1.1]} rotation={[z * 0.22, 0, -x * 0.22]} castShadow>
          <cylinderGeometry args={[0.026, 0.034, 0.88, 8]} />
          <meshStandardMaterial color="#20170d" roughness={0.85} />
        </mesh>
      ))}
      {/* steam-bent hoop back */}
      <mesh position={[0, -0.98, -0.34]} rotation={[0.06, 0, 0]} castShadow>
        <torusGeometry args={[0.4, 0.03, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#241a10" roughness={0.8} />
      </mesh>
      {[[-0.13], [0.13]].map(([x], i) => (
        <mesh key={i} position={[x, -1.2, -0.36]} rotation={[0.06, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.6, 6]} />
          <meshStandardMaterial color="#20170d" roughness={0.85} />
        </mesh>
      ))}
      {[[-0.4], [0.4]].map(([x], i) => (
        <mesh key={i} position={[x, -1.24, -0.35]} rotation={[0.06, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.026, 0.55, 6]} />
          <meshStandardMaterial color="#241a10" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- chandelier: iron, askew, one warm bulb ----------
function Chandelier({ lit, swayRef, bulbRef }) {
  return (
    <group ref={swayRef} position={[0.3, 2.7, -2.1]}>
      <mesh position={[0, -0.27, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.55, 6]} />
        <meshStandardMaterial color="#17110a" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.58, 0]} castShadow>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#17110a" roughness={0.6} metalness={0.3} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a, i) => (
        <group key={i} rotation={[0, a + 0.4, 0]}>
          <mesh position={[0.17, -0.62, 0]} rotation={[0, 0, 1.15]}>
            <cylinderGeometry args={[0.012, 0.016, 0.34, 6]} />
            <meshStandardMaterial color="#17110a" roughness={0.7} />
          </mesh>
          <mesh position={[0.32, -0.68, 0]}>
            <cylinderGeometry args={[0.05, 0.035, 0.06, 8]} />
            <meshStandardMaterial color="#1c150c" roughness={0.7} />
          </mesh>
          <mesh position={[0.32, -0.6, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.024, 0.12, 6]} />
            <meshStandardMaterial color="#c9c2b0" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* the one bulb that still answers the switch */}
      <mesh position={[0, -0.72, 0]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial
          color={lit ? '#f5cd85' : '#26201a'}
          emissive={lit ? '#e8ab55' : '#000000'}
          emissiveIntensity={lit ? 1.1 : 0}
          roughness={0.35}
        />
      </mesh>
      <pointLight ref={bulbRef} position={[0, -0.74, 0]} color="#ffbe70" distance={9} decay={1.9} />
    </group>
  )
}

// ---------- plaster flakes + grit drifted over the boards ----------
function Debris() {
  const flakes = useMemo(() => Array.from({ length: 34 }, (_, i) => ({
    pos: [rand(-6.4, 6.4), -2.38, rand(-5.6, 2.6)],
    rot: [-Math.PI / 2, 0, rand(0, 3.14)],
    size: [rand(0.07, 0.3), rand(0.05, 0.2)],
    tint: ['#d8d2c0', '#c9c2ae', '#b5ad97', '#8a8272'][i % 4],
  })), [])
  const chunks = useMemo(() => Array.from({ length: 7 }, () => ({
    pos: [rand(-6, 6), -2.39, rand(-5.4, 1.8)],
    rot: [rand(0, 3), rand(0, 3), rand(0, 3)],
    s: rand(0.035, 0.09),
  })), [])
  return (
    <group>
      {flakes.map((f, i) => (
        <mesh key={i} position={f.pos} rotation={f.rot}>
          <planeGeometry args={f.size} />
          <meshStandardMaterial color={f.tint} roughness={1} />
        </mesh>
      ))}
      {chunks.map((c, i) => (
        <mesh key={`c${i}`} position={c.pos} rotation={c.rot} scale={c.s} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#5c564a" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- corner webs + the room's one spider ----------
function StudyWebs() {
  const sheets = useMemo(() => [
    { pos: [-3.15, 1.95, -5.7], rot: [-0.4, 0.3, 0.2], size: [1.8, 1.4], o: 0.4, seed: 91 },
    { pos: [-4.9, 1.9, -4.2], rot: [0.2, 0.7, -0.3], size: [2.0, 1.6], o: 0.42, seed: 17 },
    { pos: [4.6, 1.7, -3.1], rot: [0.1, -0.8, 0.2], size: [1.7, 1.5], o: 0.38, seed: 29 },
    { pos: [0.75, 2.3, -2.3], rot: [0.5, 0.2, 0.4], size: [1.3, 1.0], o: 0.3, seed: 47 },
  ].map((d) => ({ ...d, tex: makeWebSheetTexture(d.seed) })), [])
  return (
    <group>
      {sheets.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot}>
          <planeGeometry args={s.size} />
          <meshBasicMaterial map={s.tex} transparent opacity={s.o} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

function StudySpider() {
  const rig = useRef()
  const anchor = [-0.55, 2.1, -5.35]
  useFrame(({ clock }) => {
    if (!rig.current) return
    const t = clock.elapsedTime
    rig.current.position.y = 0.95 + Math.sin(t * 1.4) * 0.05
    rig.current.rotation.y = Math.sin(t * 0.3) * 0.4
  })
  return (
    <group>
      <mesh position={[anchor[0], 1.55, anchor[2]]}>
        <cylinderGeometry args={[0.0035, 0.0035, 1.1, 3]} />
        <meshBasicMaterial color="#3a352c" transparent opacity={0.7} />
      </mesh>
      <group ref={rig} position={[anchor[0], 0.95, anchor[2]]} scale={0.5}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <SpiderModel raise={0.55} curl={1.5} />
        </group>
      </group>
    </group>
  )
}

// ---------- the room ----------
export default function StudyRoom({ lit }) {
  const group = useRef()
  const fadeRef = useRef()
  const swayRef = useRef()
  const bulbRef = useRef()
  const glintRef = useRef()
  const { camera } = useThree()
  const camPos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    if (!group.current) return
    const active = studyState.active && !heroState.active
    group.current.visible = active
    if (!active) return
    const t = clock.elapsedTime
    const p = studyState.p

    // camera: seated low in the room, slight parallax, slow push toward the table
    camPos.set(
      0.35 + heroState.mouse.x * 0.35,
      -0.3 + heroState.mouse.y * 0.22,
      5.8 - p * 0.7
    )
    camera.position.lerp(camPos, 0.07)
    look.set(-0.3 + heroState.mouse.x * 0.8, -0.4 + heroState.mouse.y * 0.4, -2.2)
    camera.lookAt(look)
    if (Math.abs(camera.fov - 52) > 0.05) {
      camera.fov += (52 - camera.fov) * 0.08
      camera.updateProjectionMatrix()
    }

    if (swayRef.current) {
      swayRef.current.rotation.z = Math.sin(t * 0.55) * 0.05
      swayRef.current.rotation.x = Math.sin(t * 0.38 + 1) * 0.03
    }
    if (bulbRef.current) {
      const flick = 0.9 + Math.sin(t * 11) * 0.02 + Math.sin(t * 23.7) * 0.03 + (Math.random() > 0.994 ? -0.3 : 0)
      bulbRef.current.intensity = lit ? 1.7 * flick : 0
    }
    if (glintRef.current) {
      glintRef.current.material.emissiveIntensity = 0.22 + Math.sin(t * 2.1) * 0.16
    }
    if (fadeRef.current) {
      const fin = Math.max(0, 1 - p / 0.16)
      const fout = Math.max(0, (p - 0.86) / 0.12)
      fadeRef.current.material.opacity = Math.min(1, fin + fout)
    }
  })

  return (
    <group ref={group} visible={false}>
      <hemisphereLight args={['#b8c0b0', '#3a352c', lit ? 0.7 : 0.26]} />
      <Shell />
      <StudyWindow lit={lit} />
      <Wardrobe />
      <Hutch glintRef={glintRef} />
      <Table />
      <Chair position={[1.35, 0, -1.05]} rotY={-0.5} />
      <Chair position={[-2.7, 0, -3.15]} rotY={3.5} />
      <Chandelier lit={lit} swayRef={swayRef} bulbRef={bulbRef} />
      <Debris />
      <StudyWebs />
      <StudySpider />
      {/* entry/exit darkness */}
      <mesh ref={fadeRef} position={[0.3, 0, 4.5]}>
        <planeGeometry args={[42, 24]} />
        <meshBasicMaterial color="#060504" transparent opacity={1} depthWrite={false} />
      </mesh>
    </group>
  )
}
