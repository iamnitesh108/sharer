import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Not VITE_-prefixed, so it stays on the Node side and out of the browser bundle
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Fail instead of silently moving to another port
    strictPort: true,
    proxy: {
      '/api': apiTarget,
    },
  },
})
