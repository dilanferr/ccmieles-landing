import { test, expect } from "@playwright/test";

/**
 * Flujo 2 — Gating del AdminShell por rol (RBAC · H1).
 * Requiere un usuario con rol 'tesorero' activo.
 * Configura E2E_TESORERO_EMAIL / E2E_TESORERO_PASSWORD.
 *
 * Un tesorero debe ver Finanzas (Tesorería) pero NO Fichas de Miembros.
 * Nota: si el markup del menú cambia, ajusta los selectores de abajo.
 */
const email = process.env.E2E_TESORERO_EMAIL;
const password = process.env.E2E_TESORERO_PASSWORD;

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email!);
  await page.fill('input[name="password"]', password!);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/);
}

test.describe("Gating del AdminShell por rol (tesorero)", () => {
  test.skip(
    !email || !password,
    "Define E2E_TESORERO_EMAIL/E2E_TESORERO_PASSWORD (usuario tesorero)",
  );

  test("el tesorero VE Finanzas", async ({ page }) => {
    await login(page);
    await expect(page.getByText(/Finanzas/i).first()).toBeVisible();
  });

  test("el tesorero NO ve Fichas de Miembros", async ({ page }) => {
    await login(page);
    await expect(page.getByText(/Fichas de Miembros/i)).toHaveCount(0);
  });
});
