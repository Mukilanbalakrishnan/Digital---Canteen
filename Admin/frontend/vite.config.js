import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
  // 👇 This helps with Netlify routing
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
