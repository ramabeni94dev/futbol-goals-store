import { beforeEach, describe, expect, it, vi } from "vitest";

const extractMercadoPagoNotificationEventId = vi.fn();
const extractMercadoPagoPaymentId = vi.fn();
const extractMercadoPagoNotificationTopic = vi.fn();
const getMercadoPagoPayment = vi.fn();
const validateMercadoPagoWebhookSignature = vi.fn();
const reconcileMercadoPagoPayment = vi.fn();
const getOrderByIdServer = vi.fn();
const sendPaymentConfirmedEmail = vi.fn();
const sendOrderCancelledEmail = vi.fn();

vi.mock("@/server/payments/mercado-pago", () => ({
  extractMercadoPagoNotificationEventId,
  extractMercadoPagoPaymentId,
  extractMercadoPagoNotificationTopic,
  getMercadoPagoPayment,
  validateMercadoPagoWebhookSignature,
}));

vi.mock("@/server/orders/reconcile-mercado-pago-payment", () => ({
  reconcileMercadoPagoPayment,
}));

vi.mock("@/repositories/server-orders-repository", () => ({
  getOrderByIdServer,
}));

vi.mock("@/server/emails/notifications", () => ({
  sendPaymentConfirmedEmail,
  sendOrderCancelledEmail,
}));

describe("POST /api/webhooks/mercado-pago", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("processes paid webhook and sends payment email", async () => {
    extractMercadoPagoPaymentId.mockReturnValue("pay-1");
    extractMercadoPagoNotificationEventId.mockReturnValue("evt-1");
    extractMercadoPagoNotificationTopic.mockReturnValue("payment");
    validateMercadoPagoWebhookSignature.mockReturnValue(true);
    getMercadoPagoPayment.mockResolvedValue({ external_reference: "order-1", status: "approved" });
    reconcileMercadoPagoPayment.mockResolvedValue({
      duplicated: false,
      orderId: "order-1",
      orderStatus: "paid",
      paymentStatus: "paid",
    });
    getOrderByIdServer.mockResolvedValue({
      id: "order-1",
      customerEmail: "cliente@test.com",
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost:3000/api/webhooks/mercado-pago", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);
    expect(sendPaymentConfirmedEmail).toHaveBeenCalled();
  });
});
