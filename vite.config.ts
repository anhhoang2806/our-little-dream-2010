import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site from /<repo-name>/. Override with BASE_PATH=/ for a custom domain.
const base = process.env.BASE_PATH ?? '/our-little-dream-2010/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2019',
    assetsInlineLimit: 8192,
    chunkSizeWarningLimit: 600,
  },
})
