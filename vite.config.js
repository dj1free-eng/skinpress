import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/top-down-race-2/tools/skinpress/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  define: {
    'import.meta.env.BUILD_TIME': JSON.stringify(Date.now().toString())
  }
});
