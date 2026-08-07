import { test, expect } from "@playwright/test";

/**
 * Flujo 1 — Kill-switch de usuarios desactivados (H2).
 * Requiere un usuario de Supabase con credenciales válidas PERO con
 * perfiles.activo = false. Configura E2E_INACTIVO_EMAIL / E2E_INACTIVO_PASSWORD.
 */
const email = process.env.E2E_INACTIVO_EMAIL;
const password = process.env.E2E_INACTIVO_PASSWORD;

test.describe("Kill-switch de usuarios desactivados", () => {
  test.skip(
    !email || !password,
    "Define E2E_INACTIVO_EMAIL/E2E_INACTIVO_PASSWORD (usuario desactivado)",
  );

  test("un usuario inactivo es expulsado a /login?error=cuenta_desactivada", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', email!);
    await page.fill('input[name="password"]', password!);
    await page.click('button[type="submit"]');

    // Auth de Supabase tiene éxito, pero el middleware lo redirige por activo=false.
    await page.waitForURL(/\/login\?error=cuenta_desactivada/);
    await expect(page.getByText(/cuenta está desactivada/i)).toBeVisible();
  });
});
