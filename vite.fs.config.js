import { defineConfig, mergeConfig } from "vite";
import baseConfig from "./vite.config.js";

// Standalone build of the /fs (Foundation for School Students) pages only.
// Usage: npx vite build --config vite.fs.config.js  → dist-fs/fs.html
export default defineConfig((env) =>
  mergeConfig(baseConfig(env), {
    build: {
      outDir: "dist-fs",
      rollupOptions: { input: "fs.html" },
    },
  })
);
