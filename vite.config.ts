import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed to GitHub Pages under a project path, so assets are served from
// /SRGBASE/. Must match the repo name's capitalisation exactly — Pages paths are
// case-sensitive. This is the single source of truth for the base path; the
// router picks it up via import.meta.env.BASE_URL in src/App.tsx.
export default defineConfig({
  base: '/SRGBASE/',
  plugins: [react()],
})
