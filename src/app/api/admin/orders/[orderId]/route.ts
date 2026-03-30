import { NextResponse } from "next/server";

import { getOrderByIdServer } from "@/repositories/server-orders-repository";
import { requireAdminUser } from "@/server/auth";
import {
  sendOrderCancelledEmail,
  sendOrderShippedEmail,
  sendPaymentConfirmedEmail,
} from "@/server/emails/notifications";
import { getErrorResponse, NotFoundError } from "@/server/errors";
import { logError } from "@/server/logger";
import { updateOrderByAdmin } from "@/server/orders/update-order-by-admin";
import { OrderStatusUpdateInput } from "@/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    await requireAdminUser(request);
    const { orderId } = await context.params;
    const order = await getOrderByIdServer(orderId);

    if (!order) {
      throw new NotFoundError("La orden no existe.", {
        orderId,
      });
    }

    return NextResponse.json({
      ok: true,
      data: order,
    });
  } catch (error) {
    logError("admin.orders.get.failed", {
      message: error instanceof Error ? error.message : "Unknown admin get order error",
    });

    const response = getErrorResponse(error, "No se pudo cargar la orden.");
    return NextResponse.json(response.body, {
      status: response.status,
    });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const { token, profile } = await requireAdminUser(request);
    const { orderId } = await context.params;
    const payload = (await request.json()) as OrderStatusUpdateInput;
    const previousOrder = await getOrderByIdServer(orderId);

    await updateOrderByAdmin({
      orderId,
      actorId: token.uid,
      actorName: profile?.name ?? token.name ?? token.email ?? "Admin",
      patch: payload,
    });

    const order = await getOrderByIdServer(orderId);

    if (
      order &&
      previousOrder &&
      order.paymentStatus === "paid" &&
      previousOrder.paymentStatus !== "paid"
    ) {
      await sendPaymentConfirmedEmail(order);
    }

    if (
      order &&
      previousOrder &&
      order.fulfillmentStatus === "shipped" &&
      previousOrder.fulfillmentStatus !== "shipped"
    ) {
      await sendOrderShippedEmail(order);
    }

    if (
      order &&
      previousOrder &&
      (order.status === "cancelled" || order.paymentStatus === "cancelled") &&
      order.status !== previousOrder.status
    ) {
      await sendOrderCancelledEmail(order);
    }

    return NextResponse.json({
      ok: true,
      data: order,
    });
  } catch (error) {
    logError("admin.orders.patch.failed", {
      message: error instanceof Error ? error.message : "Unknown admin update order error",
    });

    const response = getErrorResponse(error, "No se pudo actualizar la orden.");
    return NextResponse.json(response.body, {
      status: response.status,
    });
  }
}
