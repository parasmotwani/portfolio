// Bake one still per room straight out of the live scene.
//
// Mobile gets the same manor the desktop walks through, as flat images —
// one art source, so the plates cannot drift from the rooms. Re-run
// whenever a room's dressing, lighting or camera changes:
//
//   npm run preview   # serve the production build
//   npm run bake
//
// Output: public/plates/room-{0..6}.jpg

import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../public/plates')
const URL = process.env.BAKE_URL || 'http://localhost:4173'
const ROOMS = 7

// Where in each room the plate is taken from. Slightly past the entry
// pose so the room is established rather than caught in the doorway.
//
// Room 0 is taken late, once the camera has turned toward its exit: the
// entrance's proclamation carries the name and title as scene geometry,
// and the static track renders that same copy as live DOM on top. Baked
// head-on you get it twice.
const POSE = [0.62, 0.32, 0.32, 0.32, 0.32, 0.32, 0.32]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const exec = process.env.CHROME_PATH
if (!exec) {
  console.error('Set CHROME_PATH to a Chromium/headless-shell binary.')
  process.exit(1)
}

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: exec })
// wide and tall enough that a phone can crop the plate to any aspect
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1.5,
})
const page = await ctx.newPage()

await page.goto(URL, { waitUntil: 'networkidle' })
await sleep(3000)

// Hang the lantern: the plates are the lit house. Wait for the hook's
// hotspot to resolve — it is positioned from the 3D object, so it does not
// exist until the scene has streamed in.
await page.waitForFunction(() => {
  const e = [...document.querySelectorAll('.reach')].find((x) => /hook/.test(x.getAttribute('aria-label') || ''))
  return e && e.style.opacity === '1'
}, null, { timeout: 60000 })
await page.click('button[aria-label*="hook"]', { force: true })
await sleep(3500)

// strip every DOM layer — the plate is scenery only, the copy stays live
await page.addStyleTag({
  content: `.app, .perf-toggle, .corner-whisper, .cursor-dot, .cursor-ring,
            .flashlight-shade, .flashlight-glow { display: none !important; }`,
})
await sleep(500)

for (let i = 0; i < ROOMS; i++) {
  await page.evaluate((t) => { window.__journey.t = t }, i + POSE[i])
  // let the rig damp into the pose and the flames settle
  await sleep(2200)
  await page.screenshot({
    path: `${OUT}/room-${i}.jpg`,
    type: 'jpeg',
    quality: 82,
  })
  console.log(`baked room-${i}.jpg`)
}

await browser.close()
console.log(`\n${ROOMS} plates written to public/plates/`)
