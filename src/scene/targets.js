// Pure Float32Array position generators — one per scroll "state".
// All use a seeded PRNG so layouts are stable across renders.

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussian(rand) {
  // Box-Muller
  const u = Math.max(rand(), 1e-9)
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export const NUM_CLUSTERS = 5

// --- 0. HERO: layered neural network -------------------------------------
// Particles sit on layer "nodes" and along the edges between adjacent layers.
export function neuralNetwork(count) {
  const rand = mulberry32(101)
  const pos = new Float32Array(count * 3)
  const layers = [-6.4, -2.2, 2.2, 6.4]
  const nodesPerLayer = [6, 9, 9, 5]
  const nodes = []
  layers.forEach((x, li) => {
    const n = nodesPerLayer[li]
    for (let i = 0; i < n; i++) {
      const y = (i - (n - 1) / 2) * (9.5 / n)
      const z = (rand() - 0.5) * 1.6
      nodes.push({ x, y, z, layer: li })
    }
  })

  for (let i = 0; i < count; i++) {
    const onNode = rand() < 0.42
    let x, y, z
    if (onNode) {
      const n = nodes[Math.floor(rand() * nodes.length)]
      x = n.x + gaussian(rand) * 0.28
      y = n.y + gaussian(rand) * 0.28
      z = n.z + gaussian(rand) * 0.28
    } else {
      // along a random edge between adjacent layers
      const from = nodes.filter((n) => n.layer < layers.length - 1)
      const a = from[Math.floor(rand() * from.length)]
      const nextLayer = nodes.filter((n) => n.layer === a.layer + 1)
      const b = nextLayer[Math.floor(rand() * nextLayer.length)]
      const t = rand()
      x = a.x + (b.x - a.x) * t + gaussian(rand) * 0.05
      y = a.y + (b.y - a.y) * t + gaussian(rand) * 0.05
      z = a.z + (b.z - a.z) * t + gaussian(rand) * 0.05
    }
    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
  }
  return pos
}

// Node centers + edges for the LineSegments overlay (hero only)
export function neuralNetworkLines() {
  const rand = mulberry32(101)
  const layers = [-6.4, -2.2, 2.2, 6.4]
  const nodesPerLayer = [6, 9, 9, 5]
  const nodes = []
  layers.forEach((x, li) => {
    const n = nodesPerLayer[li]
    for (let i = 0; i < n; i++) {
      const y = (i - (n - 1) / 2) * (9.5 / n)
      const z = (rand() - 0.5) * 1.6
      nodes.push({ x, y, z, layer: li })
    }
  })
  const verts = []
  for (const a of nodes) {
    if (a.layer === layers.length - 1) continue
    const next = nodes.filter((n) => n.layer === a.layer + 1)
    for (const b of next) {
      if (rand() < 0.45) verts.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
  }
  return new Float32Array(verts)
}

// --- 1. ABOUT: 3D scatter-plot data cloud ---------------------------------
export function dataCloud(count) {
  const rand = mulberry32(202)
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // correlated blob — looks like a real dataset, not a sphere
    const x = gaussian(rand) * 3.4
    const y = x * 0.35 + gaussian(rand) * 2.2
    const z = gaussian(rand) * 2.6
    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
  }
  return pos
}

// --- 2. SKILLS: k-means style clusters ------------------------------------
// Returns { positions, clusterIds } — ids drive hover highlighting.
export function clusters(count) {
  const rand = mulberry32(303)
  const pos = new Float32Array(count * 3)
  const ids = new Float32Array(count)
  const centers = []
  for (let c = 0; c < NUM_CLUSTERS; c++) {
    const angle = (c / NUM_CLUSTERS) * Math.PI * 2
    centers.push({
      x: Math.cos(angle) * 4.6,
      y: Math.sin(angle) * 2.9,
      z: (rand() - 0.5) * 3,
    })
  }
  for (let i = 0; i < count; i++) {
    const c = i % NUM_CLUSTERS
    ids[i] = c
    pos[i * 3] = centers[c].x + gaussian(rand) * 0.95
    pos[i * 3 + 1] = centers[c].y + gaussian(rand) * 0.95
    pos[i * 3 + 2] = centers[c].z + gaussian(rand) * 0.95
  }
  return { positions: pos, clusterIds: ids }
}

// --- 3. PLAYGROUND/PROJECTS: receding grid plane ---------------------------
export function grid(count) {
  const rand = mulberry32(404)
  const pos = new Float32Array(count * 3)
  const cols = Math.ceil(Math.sqrt(count * 1.8))
  const rows = Math.ceil(count / cols)
  for (let i = 0; i < count; i++) {
    const cx = i % cols
    const cz = Math.floor(i / cols)
    pos[i * 3] = (cx / (cols - 1) - 0.5) * 22
    pos[i * 3 + 1] = -3.4 + gaussian(rand) * 0.06
    pos[i * 3 + 2] = (cz / (rows - 1) - 0.5) * 16 - 2
  }
  return pos
}

// --- 4. EXPERIENCE: flowing wave surface -----------------------------------
export function wave(count) {
  const rand = mulberry32(505)
  const pos = new Float32Array(count * 3)
  const cols = Math.ceil(Math.sqrt(count * 2.2))
  const rows = Math.ceil(count / cols)
  for (let i = 0; i < count; i++) {
    const cx = i % cols
    const cz = Math.floor(i / cols)
    const x = (cx / (cols - 1) - 0.5) * 20
    const z = (cz / (rows - 1) - 0.5) * 12
    const y = Math.sin(x * 0.55) * Math.cos(z * 0.7) * 1.6 - 1 + gaussian(rand) * 0.05
    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
  }
  return pos
}

// --- 5. CONTACT: converge to a dense core ----------------------------------
export function converge(count) {
  const rand = mulberry32(606)
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // dense core + sparse halo
    const r = rand() < 0.85 ? 0.6 + Math.pow(rand(), 2) * 1.4 : 3 + rand() * 5
    const theta = rand() * Math.PI * 2
    const phi = Math.acos(2 * rand() - 1)
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    pos[i * 3 + 2] = r * Math.cos(phi)
  }
  return pos
}

// --- initial chaos (pre-preloader scatter) ---------------------------------
export function chaos(count) {
  const rand = mulberry32(707)
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rand() - 0.5) * 40
    pos[i * 3 + 1] = (rand() - 0.5) * 40
    pos[i * 3 + 2] = (rand() - 0.5) * 40
  }
  return pos
}
