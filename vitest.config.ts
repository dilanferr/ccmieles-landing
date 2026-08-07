import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest — pruebas unitarias/integración (Server Actions con Supabase mockeado).
 * Solo toma los archivos de tests/ para no chocar con los E2E de Playwright (e2e/).
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
