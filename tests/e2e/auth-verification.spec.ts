import { expect, test } from "@playwright/test";

import { seedMockSession } from "./helpers";

test("allows resending verification email from account", async ({ page }) => {
  await seedMockSession(page, {
    uid: "user-1",
    email: "cliente@test.com",
    displayName: "Cliente Test",
    role: "customer",
    emailVerified: false,
  });

  await page.route("**/api/auth/email-verification", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto("/account");
  await expect(page.getByText("Verificacion pendiente")).toBeVisible();
  await page.getByRole("button", { name: "Reenviar verificacion" }).click();
  await expect(page.getByText("Te reenviamos el email de verificacion.")).toBeVisible();
});
