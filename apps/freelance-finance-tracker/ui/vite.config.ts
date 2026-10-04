import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/login': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/register': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/transactions': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
      '/health': { target: 'http://127.0.0.1:8000', changeOrigin: true, secure: false },
    },
  },
});