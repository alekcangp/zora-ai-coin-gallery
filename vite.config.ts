import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    // Let Vite handle chunking automatically
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       vendor: ['vue']
    //     }
    //   }
    // }
  },
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 3000,
    host: true
  }
})
