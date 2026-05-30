import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = env.VITE_API_URL || 'http://localhost:8000/api';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(API_URL),
    },
  };
});
