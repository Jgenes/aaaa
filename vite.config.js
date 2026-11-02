import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Stamped into the bundle at build time so a running deployment can prove
// which build it is serving (shown in the catalogue diagnostics panel).
const buildTime = new Date().toISOString();

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    // The preview proxy serves the app from a generated *.e2b.app host
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:5174", // ✅ backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});
