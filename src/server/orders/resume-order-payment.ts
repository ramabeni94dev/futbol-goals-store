import "server-only";

import { getOrderByIdServer } from "@/repositories/server-orders-repository";
import { isMercadoPagoConfigured } from "@/server/env";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/server/errors";
import { initializeMercadoPagoCheckout } from "@/server/orders/initialize-mercado-pago-checkout";

function isExpired(expiresAt: string | null | undefined) {
  if (!expiresAt) {
    return false;
  }

  return new Date(expiresAt).getTime() <= Date.now();
}

export async function resumeOrderPayment(input: {
  orderId: string;
  userId: string;
  isAdmin: boolean;
}) {
  const order = await getOrderByIdServer(input.orderId);

  if (!order) {
    throw new NotFoundError("La orden no existe.", {
      orderId: input.orderId,
    });
  }

  if (!input.isAdmin && order.userId !== input.userId) {
    throw new AuthorizationError("No puedes retomar el pago de una orden ajena.");
  }

  if (!isMercadoPagoConfigured()) {
    throw new ValidationError(
      "Mercado Pago no esta configurado para retomar este pago.",
    );
  }

  if (order.paymentStatus === "paid" || order.status === "paid" || order.status === "fulfilled") {
    throw new ValidationError("La orden ya se encuentra pagada.");
  }

  if (["cancelled", "refunded"].includes(order.status)) {
    throw new ValidationError("La orden ya no admite nuevos intentos de pago.");
  }

  if (order.inventoryReservation?.status !== "reserved") {
    throw new ConflictError(
      "La reserva de stock ya no esta vigente. Arma un nuevo checkout para volver a pagar.",
      {
        orderId: order.id,
        reservationStatus: order.inventoryReservation?.status ?? "missing",
      },
    );
  }

  if (isExpired(order.inventoryReservation.expiresAt)) {
    throw new ConflictError(
      "La reserva de stock expiro. Arma un nuevo checkout para volver a pagar.",
      {
        orderId: order.id,
        expiresAt: order.inventoryReservation.expiresAt ?? null,
      },
    );
  }

  return initializeMercadoPagoCheckout(order.id);
}
