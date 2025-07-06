/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './admin/ui/src'),
    },
  },
  build: {
    outDir: 'admin/ui/dist',
    assetsDir: '',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'admin/ui/src/main.tsx'),
      },
      output: {
        entryFileNames: 'main.js',
        chunkFileNames: 'main.js',
        assetFileNames: assetInfo => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'main.css'
          }
          return '[name][extname]'
        },
      },
    },
    // Ensure single file output
    cssCodeSplit: false,
    minify: true,
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    host: 'localhost',
    port: 5173,
    cors: true,
    hmr: {
      port: 5173,
    },
    // Allow loading from WordPress admin
    origin: 'http://localhost:5173',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./admin/ui/src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'admin/ui/src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/*.config.js',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
})
