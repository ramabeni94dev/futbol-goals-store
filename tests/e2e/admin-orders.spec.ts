import { expect, test } from "@playwright/test";

import { seedMockSession } from "./helpers";

test("allows an admin to update an order from the oms panel", async ({ page }) => {
  await seedMockSession(page, {
    uid: "admin-1",
    email: "admin@test.com",
    displayName: "Admin Test",
    role: "admin",
    emailVerified: true,
  });

  await page.route("**/api/admin/orders", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: [
          {
            id: "order-1",
            userId: "user-1",
            customerName: "Cliente Test",
            customerEmail: "cliente@test.com",
            items: [
              {
                productId: "goal-1",
                slug: "arco-futbol-11-soldado-3",
                name: "Arco de Futbol 11 Soldado 3\"",
                image: "/products/goal-11-soldado-3.svg",
                unitPrice: 100000,
                quantity: 1,
                lineTotal: 100000,
              },
            ],
            currency: "ARS",
            subtotal: 100000,
            shippingCost: 0,
            tax: 0,
            discount: 0,
            total: 100000,
            shippingMethod: "pickup",
            shippingAddress: {
              street: "Calle 123",
              city: "Buenos Aires",
              province: "Buenos Aires",
              postalCode: "1000",
            },
            status: "paid",
            paymentStatus: "paid",
            fulfillmentStatus: "preparing",
            paymentMethod: "checkout_pro",
            paymentProvider: "mercado_pago",
            paymentLogs: [],
            webhookEvents: [],
            adminNotes: [],
            statusHistory: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }),
    });
  });

  await page.route("**/api/admin/orders/order-1", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          id: "order-1",
          userId: "user-1",
          customerName: "Cliente Test",
          customerEmail: "cliente@test.com",
          items: [],
          currency: "ARS",
          subtotal: 100000,
          shippingCost: 0,
          tax: 0,
          discount: 0,
          total: 100000,
          shippingMethod: "pickup",
          shippingAddress: {
            street: "Calle 123",
            city: "Buenos Aires",
            province: "Buenos Aires",
            postalCode: "1000",
          },
          status: "paid",
          paymentStatus: "paid",
          fulfillmentStatus: "shipped",
          paymentMethod: "checkout_pro",
          paymentProvider: "mercado_pago",
          trackingNumber: "AR123456",
          carrier: "Correo Argentino",
          paymentLogs: [],
          webhookEvents: [],
          adminNotes: [],
          statusHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    });
  });

  await page.goto("/admin/orders");
  await expect(page.getByText("Gestion operativa de ordenes")).toBeVisible();
  await page.getByLabel("Fulfillment").selectOption("shipped");
  await page.getByLabel("Tracking").fill("AR123456");
  await page.getByLabel("Carrier").fill("Correo Argentino");
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page.locator('input[value="AR123456"]')).toBeVisible();
});
