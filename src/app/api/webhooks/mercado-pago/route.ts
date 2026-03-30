import { NextResponse } from "next/server";

import {
  extractMercadoPagoNotificationEventId,
  extractMercadoPagoPaymentId,
  extractMercadoPagoNotificationTopic,
  getMercadoPagoPayment,
  validateMercadoPagoWebhookSignature,
} from "@/server/payments/mercado-pago";
import { getErrorResponse } from "@/server/errors";
import { sendOrderCancelledEmail, sendPaymentConfirmedEmail } from "@/server/emails/notifications";
import { logError, logInfo, logWarn } from "@/server/logger";
import { reconcileMercadoPagoPayment } from "@/server/orders/reconcile-mercado-pago-payment";
import { getOrderByIdServer } from "@/repositories/server-orders-repository";

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  try {
    const paymentId = extractMercadoPagoPaymentId({
      request,
      body,
    });
    const eventId =
      extractMercadoPagoNotificationEventId(body) ??
      `payment_${paymentId ?? "unknown"}`;
    const topic = extractMercadoPagoNotificationTopic({
      request,
      body,
    });

    if (!validateMercadoPagoWebhookSignature({ request, dataId: paymentId })) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_SIGNATURE",
            message: "La firma del webhook de Mercado Pago no es valida.",
          },
        },
        { status: 401 },
      );
    }

    if (!paymentId || topic !== "payment") {
      logWarn("mercado_pago.webhook.ignored", {
        paymentId,
        eventId,
        topic,
      });

      return NextResponse.json({
        ok: true,
        ignored: true,
      });
    }

    const payment = await getMercadoPagoPayment(paymentId);
    const result = await reconcileMercadoPagoPayment({
      payment,
      eventId,
      webhookEventType: topic,
    });

    if (!result.duplicated) {
      const order = await getOrderByIdServer(result.orderId);

      if (order && result.paymentStatus === "paid") {
        await sendPaymentConfirmedEmail(order);
      }

      if (
        order &&
        (result.orderStatus === "cancelled" || result.orderStatus === "payment_failed")
      ) {
        await sendOrderCancelledEmail(order);
      }
    }

    logInfo("mercado_pago.webhook.processed", result);

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    logError("mercado_pago.webhook.failed", {
      message: error instanceof Error ? error.message : "Unknown Mercado Pago webhook error",
    });

    const response = getErrorResponse(
      error,
      "No se pudo procesar el webhook de Mercado Pago.",
    );

    return NextResponse.json(response.body, {
      status: response.status,
    });
  }
}
