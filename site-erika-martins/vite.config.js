import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// Endereço do back-end durante o desenvolvimento (npm run dev)
const API = 'http://localhost:3001'

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      jpg: { quality: 70 },
      jpeg: { quality: 70 },
      png: { quality: 70 }
    }),
  ],
  server: {
    proxy: {
      '/api': API,
      '/uploads': API,
    },
  },
})
