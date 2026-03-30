import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminUser = vi.fn();
const getOrderByIdServer = vi.fn();
const updateOrderByAdmin = vi.fn();
const sendOrderCancelledEmail = vi.fn();
const sendOrderShippedEmail = vi.fn();
const sendPaymentConfirmedEmail = vi.fn();

vi.mock("@/server/auth", () => ({
  requireAdminUser,
}));

vi.mock("@/repositories/server-orders-repository", () => ({
  getOrderByIdServer,
}));

vi.mock("@/server/orders/update-order-by-admin", () => ({
  updateOrderByAdmin,
}));

vi.mock("@/server/emails/notifications", () => ({
  sendOrderCancelledEmail,
  sendOrderShippedEmail,
  sendPaymentConfirmedEmail,
}));

describe("PATCH /api/admin/orders/[orderId]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("sends shipped email when fulfillment changes to shipped", async () => {
    requireAdminUser.mockResolvedValue({
      token: { uid: "admin-1", email: "admin@test.com" },
      profile: { name: "Admin" },
    });
    getOrderByIdServer
      .mockResolvedValueOnce({
        id: "order-1",
        status: "paid",
        paymentStatus: "paid",
        fulfillmentStatus: "preparing",
      })
      .mockResolvedValueOnce({
        id: "order-1",
        status: "paid",
        paymentStatus: "paid",
        fulfillmentStatus: "shipped",
      });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/orders/order-1", {
        method: "PATCH",
        body: JSON.stringify({
          fulfillmentStatus: "shipped",
        }),
      }),
      {
        params: Promise.resolve({ orderId: "order-1" }),
      },
    );

    expect(response.status).toBe(200);
    expect(updateOrderByAdmin).toHaveBeenCalled();
    expect(sendOrderShippedEmail).toHaveBeenCalled();
  });
});
