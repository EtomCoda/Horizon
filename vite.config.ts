import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Enable minification for production
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Configure chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
        },
      },
    },
    // Increase chunk size warning limit (optional)
    chunkSizeWarningLimit: 500,
    // Enable source maps for debugging (disable in production if needed)
    sourcemap: false,
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
