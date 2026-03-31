import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();
const resumeOrderPayment = vi.fn();

vi.mock("@/server/auth", () => ({
  requireAuthenticatedUser,
}));

vi.mock("@/server/orders/resume-order-payment", () => ({
  resumeOrderPayment,
}));

describe("POST /api/orders/[orderId]/payment", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns a checkout url for the authenticated user", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      token: { uid: "user-1" },
      profile: { role: "customer" },
    });
    resumeOrderPayment.mockResolvedValue({
      preferenceId: "pref-1",
      checkoutUrl: "https://mp.test/checkout",
    });

    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost:3000/api/orders/order-1/payment", {
      method: "POST",
    }), {
      params: Promise.resolve({ orderId: "order-1" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.checkoutUrl).toBe("https://mp.test/checkout");
    expect(resumeOrderPayment).toHaveBeenCalledWith({
      orderId: "order-1",
      userId: "user-1",
      isAdmin: false,
    });
  });
});
