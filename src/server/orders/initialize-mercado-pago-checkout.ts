import "server-only";

import { getOrderByIdServer, updateOrderServer } from "@/repositories/server-orders-repository";
import { NotFoundError } from "@/server/errors";
import { createMercadoPagoPreference } from "@/server/payments/mercado-pago";

export async function initializeMercadoPagoCheckout(orderId: string) {
  const order = await getOrderByIdServer(orderId);

  if (!order) {
    throw new NotFoundError("La orden no existe para iniciar Mercado Pago.", {
      orderId,
    });
  }

  const preference = await createMercadoPagoPreference(order);
  const statusHistory = [
    ...order.statusHistory,
    {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      actorRole: "system" as const,
      actorId: null,
      actorName: null,
      message: "Preferencia de Mercado Pago creada para el checkout.",
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
    },
  ];
  const paymentLogs = [
    ...order.paymentLogs,
    {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      provider: "mercado_pago" as const,
      eventType: "preference_created",
      externalEventId: preference.preferenceId,
      status: "pending",
      payload: {
        preferenceId: preference.preferenceId,
        checkoutUrl: preference.checkoutUrl,
      },
    },
  ];

  await updateOrderServer(order.id, {
    paymentProvider: "mercado_pago",
    paymentMethod: "checkout_pro",
    paymentStatus: "pending",
    preferenceId: preference.preferenceId,
    paymentLogs,
    statusHistory,
  });

  return preference;
}
