/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-plotly.js', 'plotly.js'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Augmente le seuil pour les chunks Plotly (volumineux par nature)
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // Plotly = chunk dédié (volumineux, chargé à la demande)
            if (id.includes('plotly.js') || id.includes('react-plotly')) return 'plotly';
            // Stack React + routing
            if (id.includes('react-router') || id.includes('/react-dom/') || id.includes('/react/')) return 'react-vendor';
            // Redux toolkit + RTK Query
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) return 'redux-vendor';
            // Icônes
            if (id.includes('lucide-react')) return 'icons';
          }
          return undefined;
        },
      },
    },
  },
});
