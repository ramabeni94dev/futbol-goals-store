import { beforeEach, describe, expect, it, vi } from "vitest";

const createAuthoritativeOrder = vi.fn();
const initializeMercadoPagoCheckout = vi.fn();
const releaseOrderReservation = vi.fn();
const requireAuthenticatedUser = vi.fn();
const sendOrderCreatedEmail = vi.fn();
const getOrderByIdServer = vi.fn();
const isMercadoPagoConfigured = vi.fn();

vi.mock("@/server/orders/create-authoritative-order", () => ({
  createAuthoritativeOrder,
}));

vi.mock("@/server/orders/initialize-mercado-pago-checkout", () => ({
  initializeMercadoPagoCheckout,
}));

vi.mock("@/server/orders/release-order-reservation", () => ({
  releaseOrderReservation,
}));

vi.mock("@/server/auth", () => ({
  requireAuthenticatedUser,
}));

vi.mock("@/server/emails/notifications", () => ({
  sendOrderCreatedEmail,
}));

vi.mock("@/repositories/server-orders-repository", () => ({
  getOrderByIdServer,
}));

vi.mock("@/server/env", async () => {
  const actual = await vi.importActual<typeof import("@/server/env")>("@/server/env");
  return {
    ...actual,
    isMercadoPagoConfigured,
  };
});

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("creates order and initializes mercado pago checkout", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      token: { uid: "user-1", email_verified: true },
    });
    createAuthoritativeOrder.mockResolvedValue({
      orderId: "order-1",
      status: "awaiting_payment",
      paymentStatus: "pending",
      total: 123,
      currency: "ARS",
      paymentProvider: "manual",
      paymentMethod: "manual",
    });
    isMercadoPagoConfigured.mockReturnValue(true);
    initializeMercadoPagoCheckout.mockResolvedValue({
      preferenceId: "pref-1",
      checkoutUrl: "https://mp.test/checkout",
    });
    getOrderByIdServer.mockResolvedValue({
      id: "order-1",
      customerEmail: "cliente@test.com",
      items: [],
      total: 123,
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          customerName: "Cliente",
          customerEmail: "cliente@test.com",
          street: "Calle 123",
          city: "Buenos Aires",
          province: "Buenos Aires",
          postalCode: "1000",
          items: [{ productId: "p1", quantity: 1 }],
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.preferenceId).toBe("pref-1");
    expect(sendOrderCreatedEmail).toHaveBeenCalled();
  });

  it("rejects unverified users", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      token: { uid: "user-1", email_verified: false },
    });
    isMercadoPagoConfigured.mockReturnValue(false);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.message).toContain("verificar tu email");
  });
});
