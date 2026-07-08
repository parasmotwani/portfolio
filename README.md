# Paras Motwani — Portfolio

An **abandoned-house portfolio**. The lights are out when you arrive — your cursor is a torch. Find the glowing switch in the top-right and the light spreads across the room. Then explore: a study with a desk drawer that opens into an old paper résumé, walls of framed skills, a game room where an old machine still runs a playable open world, a gallery of project paintings, and a records room.

🔗 **Live:** [paras-portfolio.vercel.app](https://paras-portfolio-5thwzbdny-paras-projects-92cb4789.vercel.app)

---

## Tech Stack

| Layer | Tools |
|---|---|
| Framework | React 18 + Vite |
| Scroll | Lenis + GSAP ScrollTrigger (pinned scrub rooms) |
| Torch & light spread | CSS radial gradients driven per-frame (no WebGL needed) |
| Atmosphere | Three.js / R3F — sparse dust motes (custom GLSL) |
| Game | Hand-rolled canvas 2D engine — tile map, collision, camera (zero deps) |
| Styling | Vanilla CSS — IM Fell English · Cormorant Garamond · JetBrains Mono |
| Deployment | Vercel |

## The Rooms

- **Entrance** — dark. Name + summary revealed by torchlight; spooky whisper top-left, glowing switch top-right
- **I · About** — a study; pull the ajar drawer and an aged paper unfolds with the condensed résumé
- **II · Skills & Tools** — five categories framed on the wall
- **III · Game Room** — a CRT machine running a retro open world: walk with WASD, press E to read the portfolio inside the game
- **IV · Projects** — horizontal gallery of framed work, GitHub links
- **V · Experience** — timeline + certifications
- **VI · Contact** — links + mailto form

## Performance & Accessibility

- Touch devices and `prefers-reduced-motion` start with the lights **on**
- Dust motes: one draw call, dpr ≤ 1.5; flashlight is two fixed divs, no re-renders
- **3D toggle** (bottom-right) disables the canvas
- Mobile: normal scrolling, touch d-pad in the game, no custom cursor

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:5173
```

Pushes to `main` auto-deploy to Vercel, or `npx vercel --prod`.

---

© 2026 Paras Motwani
