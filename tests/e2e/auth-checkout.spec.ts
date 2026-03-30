import { expect, test } from "@playwright/test";

import { seedCart, seedMockSession } from "./helpers";

test("allows a verified customer to review cart and submit checkout", async ({ page }) => {
  await seedMockSession(page, {
    uid: "user-1",
    email: "cliente@test.com",
    displayName: "Cliente Test",
    role: "customer",
    emailVerified: true,
  });
  await seedCart(page, [
    {
      product: {
        id: "goal-1",
        name: "Arco de Futbol 11 Soldado 3\"",
        slug: "arco-futbol-11-soldado-3",
        description: "Descripcion extensa",
        shortDescription: "Descripcion corta",
        price: 100000,
        category: "professional",
        size: "7,32 x 2,44 m",
        stock: 5,
        reservedStock: 0,
        images: ["/products/goal-11-soldado-3.svg"],
        featured: true,
        technicalSpecs: [{ label: "Material", value: "Acero" }],
        trackInventory: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      quantity: 1,
    },
  ]);

  await page.route("**/api/checkout", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          orderId: "order-1234",
          status: "awaiting_payment",
          paymentStatus: "pending",
          total: 100000,
          currency: "ARS",
          paymentProvider: "manual",
          paymentMethod: "manual",
        },
      }),
    });
  });

  await page.goto("/cart");
  await expect(page.getByText("Pedido en armado")).toBeVisible();
  await page.getByRole("link", { name: "Continuar al checkout" }).click();
  await page.getByLabel("Nombre").fill("Cliente Test");
  await page.getByLabel("Email").fill("cliente@test.com");
  await page.getByLabel("Direccion").fill("Calle 123");
  await page.getByLabel("Ciudad").fill("Buenos Aires");
  await page.getByLabel("Provincia").fill("Buenos Aires");
  await page.getByLabel("Codigo postal").fill("1000");
  await page.getByRole("button", { name: "Confirmar pedido" }).click();

  await expect(page).toHaveURL(/\/account$/);
});
