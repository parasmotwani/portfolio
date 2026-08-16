import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        // three is deliberately NOT a manual chunk: naming it here puts it in
        // the initial graph, so Vite emits a modulepreload for it in
        // index.html and every static (mobile) visit downloads ~1 MB it will
        // never use. Left alone, Rollup keeps it inside the lazy SceneCanvas
        // chunk, which only an immersive visit ever imports.
        manualChunks: {
          motion: ['gsap', 'lenis'],
        }
      }
    }
  }
})
