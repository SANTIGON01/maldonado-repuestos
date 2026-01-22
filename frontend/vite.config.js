import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    // Optimizaciones de producción
    target: 'es2020',
    minify: 'esbuild',  // esbuild viene incluido con Vite (terser requiere instalación aparte)
    // Mejor code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendors pesados
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-ui': ['lucide-react', 'zustand'],
        },
      },
    },
    // Optimización de chunks
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    // Compresión de assets
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline assets < 4KB como base64
  },
  // Optimizaciones de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react', 'zustand'],
  },
})
