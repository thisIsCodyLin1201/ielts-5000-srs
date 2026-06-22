import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' -> relative asset URLs so the build works under
// https://<user>.github.io/<repo>/ without hardcoding the repo name.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // keep the large word deck in its own cacheable chunk, app code small
        manualChunks(id) {
          if (id.endsWith('deck.json')) return 'deck';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
