import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    open: 'chrome',
  },
  preview: {
    port: 5173,
    open: 'chrome',
  },
  build: {
    minify: 'esbuild',
    ssr: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (
              !id.includes('react') &&
              !id.includes('react-dom') &&
              !id.includes('react-router') &&
              !id.includes('@tanstack/react-query') &&
              !id.includes('lucide-react')
            ) {
              return 'vendor';
            }
          }
        },
      },
    },
  },
  ssr: {
    noExternal: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
