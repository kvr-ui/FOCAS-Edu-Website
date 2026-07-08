import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,

    // ✅ ADD THIS
    allowedHosts: [
      "september-subsphenoid-celia.ngrok-free.dev",
      "carole-accommodative-rogelio.ngrok-free.dev",
      "endorsingly-portulacaceous-velva.ngrok-free.dev"
    ],

    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(new URL('.', import.meta.url).pathname, "./src"),
    },
  },
}));
