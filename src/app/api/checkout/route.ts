import { NextResponse } from "next/server";

import { createAuthoritativeOrder } from "@/server/orders/create-authoritative-order";
import { getErrorResponse } from "@/server/errors";
import { logError } from "@/server/logger";
import { requireAuthenticatedUser } from "@/server/auth";
import { isMercadoPagoConfigured } from "@/server/env";
import { initializeMercadoPagoCheckout } from "@/server/orders/initialize-mercado-pago-checkout";
import { releaseOrderReservation } from "@/server/orders/release-order-reservation";
import { CheckoutRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const { token } = await requireAuthenticatedUser(request);
    const payload = (await request.json()) as CheckoutRequest;
    const order = await createAuthoritativeOrder(payload, {
      userId: token.uid,
    });

    if (isMercadoPagoConfigured()) {
      try {
        const paymentSession = await initializeMercadoPagoCheckout(order.orderId);

        return NextResponse.json(
          {
            ok: true,
            data: {
              ...order,
              paymentProvider: "mercado_pago",
              paymentMethod: "checkout_pro",
              preferenceId: paymentSession.preferenceId,
              checkoutUrl: paymentSession.checkoutUrl,
            },
          },
          { status: 201 },
        );
      } catch (paymentInitializationError) {
        await releaseOrderReservation({
          orderId: order.orderId,
          paymentStatus: "failed",
          reason: "No se pudo crear la preferencia de Mercado Pago y se libero la reserva.",
        });

        throw paymentInitializationError;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        data: order,
      },
      { status: 201 },
    );
  } catch (error) {
    logError("checkout.order.failed", {
      message: error instanceof Error ? error.message : "Unknown checkout error",
      cause: error instanceof Error ? error.cause : null,
    });

    const response = getErrorResponse(
      error,
      "No se pudo crear la orden desde el checkout seguro.",
    );

    return NextResponse.json(response.body, {
      status: response.status,
    });
  }
}
