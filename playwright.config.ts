import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright — pruebas E2E de los flujos de seguridad críticos.
 * Requieren la app corriendo (E2E_BASE_URL, por defecto http://localhost:3000)
 * y usuarios de prueba sembrados en Supabase (ver e2e/README.md). Los tests se
 * auto-omiten (test.skip) si faltan las credenciales por variables de entorno.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
