import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://places.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1'),
        secure: false
      },
      '/api/place-photo': {
        target: 'https://maps.googleapis.com/maps/api/place/photo',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/place-photo/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
          });
        }
      }
    }
  }
})