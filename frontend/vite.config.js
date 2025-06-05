import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:6789',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    'process.env': {
      VITE_API_URL: JSON.stringify('http://localhost:6789/api')
    }
  }
})
