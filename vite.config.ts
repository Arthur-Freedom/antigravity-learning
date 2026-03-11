import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  appType: 'spa',   // Serves index.html for all routes (SPA fallback)
})
