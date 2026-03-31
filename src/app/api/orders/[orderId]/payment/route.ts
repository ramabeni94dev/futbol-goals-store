import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth";
import { getErrorResponse } from "@/server/errors";
import { logError } from "@/server/logger";
import { resumeOrderPayment } from "@/server/orders/resume-order-payment";

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const { token, profile } = await requireAuthenticatedUser(request);
    const { orderId } = await context.params;
    const paymentSession = await resumeOrderPayment({
      orderId,
      userId: token.uid,
      isAdmin: profile?.role === "admin",
    });

    return NextResponse.json({
      ok: true,
      data: paymentSession,
    });
  } catch (error) {
    logError("orders.payment.resume.failed", {
      message: error instanceof Error ? error.message : "Unknown resume payment error",
    });

    const response = getErrorResponse(error, "No se pudo retomar el pago de la orden.");
    return NextResponse.json(response.body, {
      status: response.status,
    });
  }
}
