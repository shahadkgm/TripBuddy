import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // fail instead of auto-switching to 5174/5175 etc.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
