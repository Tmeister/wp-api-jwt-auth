import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: '',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.tsx')
      },
      output: {
        entryFileNames: 'main.js',
        chunkFileNames: 'main.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'main.css'
          }
          return '[name][extname]'
        }
      }
    },
    // Ensure single file output
    cssCodeSplit: false,
    minify: true
  },
  css: {
    postcss: './postcss.config.js'
  },
  server: {
    host: 'localhost',
    port: 5173,
    cors: true,
    hmr: {
      port: 5173,
    },
    // Allow loading from WordPress admin
    origin: 'http://localhost:5173'
  }
})