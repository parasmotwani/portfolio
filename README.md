# Paras Motwani — Portfolio · The Codex

A portfolio written as an **ancient grimoire of AI and data science**. Chapters pin to the screen and scrolling inscribes them — headings ink in, alchemy circles (secretly neural networks) draw themselves stroke by stroke — then the page turns.

🔗 **Live:** [paras-portfolio.vercel.app](https://paras-portfolio-5thwzbdny-paras-projects-92cb4789.vercel.app)

---

## Tech Stack

| Layer | Tools |
|---|---|
| Framework | React 18 + Vite |
| Scroll | Lenis (smooth scroll) + GSAP ScrollTrigger (pinned scrub chapters) |
| Atmosphere | Three.js / R3F — sparse golden ember motes (custom GLSL) |
| Diagrams | Hand-built SVG (magic circles, sigils) with stroke-draw inscribing |
| Styling | Vanilla CSS design system — Cinzel · Cormorant Garamond · JetBrains Mono |
| Deployment | Vercel |

## The Chapters

- **Frontispiece** — a neural-network alchemy circle inscribes itself behind the name
- **I · The Scholar** — the author, stats as numerals, education
- **II · The Grimoire** — five schools of practice, each with its sigil
- **III · The Divination Table** — live k-means, zero dependencies: cast points, invoke the rite, watch the seals converge
- **IV · The Artifacts** — pinned horizontal relic gallery
- **V · The Chronicle** — timeline that draws itself on scroll
- **VI · The Summoning** — contact, inside a summoning circle

## Performance & Accessibility

- Ember motes: one draw call, ~260 points, dpr ≤ 1.5 — atmosphere never covers text
- **3D toggle** (bottom-right) disables the canvas; saved to `localStorage`
- `prefers-reduced-motion`: no pinning, everything visible immediately
- Mobile: normal scrolling, vertical galleries, no custom cursor

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:5173
```

Pushes to `main` auto-deploy to Vercel, or `npx vercel --prod`.

---

*Here ends the codex.* © 2026 Paras Motwani
