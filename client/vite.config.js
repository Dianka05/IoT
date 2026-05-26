import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // '/api': {
      //   target: 'http://localhost:3001',
      //   changeOrigin: true,
      // },
      '/api': {
        target: 'https://hopeful-integrity-production-6100.up.railway.app',
        changeOrigin: true,
      },
    },
  },
})
