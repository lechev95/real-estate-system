import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000
  },
  preview: {
    host: '0.0.0.0', 
    allowedHosts: real-estate-crm-frontend.onrender.com,
    port: process.env.PORT || 3000
  }
})