import { NextResponse } from "next/server";

import { createAuthoritativeOrder } from "@/server/orders/create-authoritative-order";
import { getErrorResponse } from "@/server/errors";
import { logError } from "@/server/logger";
import { requireAuthenticatedUser } from "@/server/auth";
import { CheckoutRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const { token } = await requireAuthenticatedUser(request);
    const payload = (await request.json()) as CheckoutRequest;
    const order = await createAuthoritativeOrder(payload, {
      userId: token.uid,
    });

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
