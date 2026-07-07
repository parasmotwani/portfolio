# Paras Motwani — Portfolio

A cinematic, scroll-driven 3D portfolio. One persistent particle scene morphs through data-science-themed states as you scroll — neural network → data cloud → k-means clusters → grid → wave → convergence.

🔗 **Live:** [paras-portfolio.vercel.app](https://paras-portfolio-5thwzbdny-paras-projects-92cb4789.vercel.app)

---

## Tech Stack

| Layer | Tools |
|---|---|
| Framework | React 18 + Vite |
| 3D / WebGL | Three.js, React Three Fiber (custom GLSL point shader) |
| Scroll | Lenis (smooth scroll) + GSAP ScrollTrigger (scrubbed/pinned timelines) |
| Micro-animation | Framer Motion |
| Styling | Vanilla CSS design system (monochrome + red accent, Archivo/Inter/JetBrains Mono) |
| Deployment | Vercel |

---

## The Experience

- **Preloader** — mono percent counter, then the curtain lifts
- **Hero** — a neural network assembles from chaos behind the name; typed role line
- **About** — particles scatter into a 3D data cloud; stats count up on scroll
- **Skills** — particles form k-means-style clusters; hovering a category highlights its cluster in red
- **Playground** — live, dependency-free k-means: click to add points, watch centroids converge
- **Selected Work** — pinned horizontal gallery, scroll moves it sideways
- **Experience** — timeline draws itself as you scroll
- **Contact** — every particle converges to a single pulsing core
- **Custom cursor** with magnetic buttons (desktop only)

## Performance & Accessibility

- Single WebGL context, one particle draw call (~4000 pts desktop / 1500 mobile), dpr ≤ 1.5
- **3D toggle** (bottom-right) disables the scene entirely; saved to `localStorage`
- `prefers-reduced-motion` respected — smoothing and scrubs collapse to simple fades
- Mobile: vertical project stack, no pinning, no custom cursor

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Deploying

Pushes to `main` auto-deploy to Vercel, or `npx vercel --prod`.

## Project Structure

```
src/
├── scene/                    # persistent 3D layer
│   ├── SceneCanvas.jsx       # fixed Canvas + low-power fallback
│   ├── MorphingParticles.jsx # morphing particle system + neural-net lines
│   ├── CameraRig.jsx         # scroll-driven camera path + mouse parallax
│   ├── targets.js            # per-state position generators
│   └── sceneState.js         # DOM ↔ scene shared refs
├── hooks/
│   └── useScrollProgress.jsx # Lenis + ScrollTrigger provider
├── components/               # Preloader, Cursor, Navbar, sections
├── context/
│   └── PerformanceContext.jsx
├── App.jsx
└── index.css                 # entire design system
```

---

© 2026 Paras Motwani
