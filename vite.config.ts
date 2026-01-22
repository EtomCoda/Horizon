import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/ph/static': {
        target: 'https://us-assets.i.posthog.com/static',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ph\/static/, ''),
      },
      '/ph': {
        target: 'https://us.i.posthog.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ph/, ''),
      },
    },
  },
});
