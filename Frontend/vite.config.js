import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: ['6313-102-189-207-6.ngrok-free.app']
  },
  plugins: [react(),tailwindcss(),],
})


