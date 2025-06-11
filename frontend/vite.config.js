import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api/user": {
        target: "http://localhost:5006",
        changeOrigin: true,
      },
      "/api/production-management": {
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/production-management/, ""),
        target: "http://localhost:5001",
      },
      "/api/production-planning": {
        target: "http://localhost:5002",
        changeOrigin: true,
      },
      "/api/machine-queue": {
        target: "http://localhost:5003",
        changeOrigin: true,
      },
      "/api/material-inventory": {
        target: "http://localhost:5004",
        changeOrigin: true,
      },
      "/api/production-feedback": {
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/production-feedback/, ""),
        target: "http://localhost:5005",
      },
    },
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['@mui/material', '@emotion/react', '@emotion/styled']
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  esbuild: {
    jsx: 'automatic'
  }
});
