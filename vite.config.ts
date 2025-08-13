import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://31.97.62.51:4000",
        changeOrigin: true,
        secure: false,
      },
      "/login": {
        target: "http://31.97.62.51:4000",
        changeOrigin: true,
        secure: false,
      },
      "/auth-status": {
        target: "http://31.97.62.51:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
