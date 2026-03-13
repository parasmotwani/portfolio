# Paras Motwani — Portfolio

An interactive 3D portfolio website built with React, Three.js, and Framer Motion.

🔗 **Live:** [paras-portfolio.vercel.app](https://paras-portfolio-5thwzbdny-paras-projects-92cb4789.vercel.app)

---

## Tech Stack

| Layer | Tools |
|---|---|
| Framework | React 18 + Vite |
| 3D / WebGL | Three.js, React Three Fiber, Drei |
| Animations | Framer Motion |
| Styling | Vanilla CSS (custom design system) |
| Deployment | Vercel |

---

## Features

- **3D Hero Scene** — Animated particle field and floating wireframe geometry with distortion shaders
- **Scroll-triggered Animations** — Every section fades in using Framer Motion + `useInView`
- **Low Power Mode** — Toggle button (bottom-right) to disable 3D effects for smooth performance on any device; preference saved to `localStorage`
- **Dark Futuristic Theme** — Cyan/purple gradient palette, glassmorphism cards, Space Grotesk typography
- **Fully Responsive** — Works on mobile, tablet, and desktop
- **Contact Form** — mailto-powered form opens native email client

## Sections

`Hero` → `About` → `Skills` → `Projects` → `Experience & Certifications` → `Contact`

---

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Deploying

Pushes to `main` on GitHub auto-deploy to Vercel.

To deploy manually:

```bash
npx vercel --prod
```

---

## Project Structure

```
src/
├── components/
│   ├── HeroScene.jsx        # Three.js canvas wrapper
│   ├── ParticleField.jsx    # Animated particle system
│   ├── FloatingGeometry.jsx # Floating 3D wireframe shapes
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Skills.jsx
│   ├── Projects.jsx
│   ├── Experience.jsx
│   ├── Contact.jsx
│   └── PerformanceToggle.jsx # Low power mode button
├── context/
│   └── PerformanceContext.jsx
├── App.jsx
├── main.jsx
└── index.css
```

---

© 2025 Paras Motwani
