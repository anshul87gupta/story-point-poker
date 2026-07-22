import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
    css: false,
    // Without this, Vitest's default glob also matches e2e/*.spec.js and tries to import/run
    // Playwright's test files itself — Playwright's test() then throws, since it's being
    // called by Vitest's runner instead of Playwright's own CLI-orchestrated one.
    exclude: ["node_modules/**", "e2e/**"],
  },
});
