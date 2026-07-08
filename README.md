# Paras Motwani — Portfolio

A portfolio with an ancient-grimoire visual identity and strictly technical content. Chapters pin to the screen and scrolling inscribes them — headings ink in, an alchemy-circle neural network draws itself stroke by stroke. Chapter III is a **retro 2D open world**: walk around a little pixel village and explore the portfolio building by building.

🔗 **Live:** [paras-portfolio.vercel.app](https://paras-portfolio-5thwzbdny-paras-projects-92cb4789.vercel.app)

---

## Tech Stack

| Layer | Tools |
|---|---|
| Framework | React 18 + Vite |
| Scroll | Lenis (smooth scroll) + GSAP ScrollTrigger (pinned scrub chapters) |
| Atmosphere | Three.js / R3F — sparse golden ember motes (custom GLSL) |
| Game | Hand-rolled canvas 2D engine — tile map, collision, camera, sprite (zero deps) |
| Diagrams | Hand-built SVG (neural-net circle, sigils) with stroke-draw animation |
| Styling | Vanilla CSS design system — Cinzel · Cormorant Garamond · JetBrains Mono |
| Deployment | Vercel |

## The Chapters

- **Hero** — a neural-network circle inscribes itself behind the name
- **I · About** — stats, education, background
- **II · Skills & Tools** — five categories, each with its hand-drawn sigil
- **III · The World** — retro open-world game: WASD/arrows to walk, E to read About/Skills/Projects/Experience/Contact inside the world; touch d-pad on mobile
- **IV · Projects** — pinned horizontal gallery, six projects with GitHub links
- **V · Experience** — timeline that draws itself on scroll, certifications
- **VI · Contact** — links + mailto form

## Performance & Accessibility

- Ember motes: one draw call, ~260 points, dpr ≤ 1.5 — atmosphere never covers text
- Game loop runs only while playing; arrow keys don't scroll the page mid-game
- **3D toggle** (bottom-right) disables the canvas; saved to `localStorage`
- `prefers-reduced-motion`: no pinning, everything visible immediately
- Mobile: normal scrolling, vertical galleries, touch d-pad, no custom cursor

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:5173
```

Pushes to `main` auto-deploy to Vercel, or `npx vercel --prod`.

---

© 2026 Paras Motwani
