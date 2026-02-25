import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/pwhl': {
        target: 'https://lscluster.hockeytech.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pwhl/, '/feed/index.php'),
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
  }
})
