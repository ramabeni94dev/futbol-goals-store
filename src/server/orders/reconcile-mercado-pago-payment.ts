import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { mapOrderRecord } from "@/lib/serializers/order";
import { mapProductRecord } from "@/lib/serializers/product";
import { getAdminDb } from "@/server/firebase-admin";
import { NotFoundError } from "@/server/errors";
import { MercadoPagoPaymentDetails } from "@/server/payments/mercado-pago";
import { Product } from "@/types";

function mapMercadoPagoPaymentStatus(status: string | undefined) {
  switch (status) {
    case "approved":
      return {
        orderStatus: "paid" as const,
        paymentStatus: "paid" as const,
      };
    case "authorized":
      return {
        orderStatus: "awaiting_payment" as const,
        paymentStatus: "authorized" as const,
      };
    case "cancelled":
      return {
        orderStatus: "cancelled" as const,
        paymentStatus: "cancelled" as const,
      };
    case "refunded":
    case "charged_back":
      return {
        orderStatus: "refunded" as const,
        paymentStatus: "refunded" as const,
      };
    case "rejected":
      return {
        orderStatus: "payment_failed" as const,
        paymentStatus: "failed" as const,
      };
    default:
      return {
        orderStatus: "awaiting_payment" as const,
        paymentStatus: "pending" as const,
      };
  }
}

export async function reconcileMercadoPagoPayment(input: {
  payment: MercadoPagoPaymentDetails;
  eventId: string;
  webhookEventType: string;
}) {
  const orderId = input.payment.external_reference;

  if (!orderId) {
    throw new NotFoundError("El pago de Mercado Pago no trae external_reference.");
  }

  const database = getAdminDb();
  const orderReference = database.collection("orders").doc(orderId);
  const webhookReference = database
    .collection("paymentWebhookEvents")
    .doc(`mercado_pago_${input.eventId}`);

  return database.runTransaction(async (transaction) => {
    const [webhookSnapshot, orderSnapshot] = await Promise.all([
      transaction.get(webhookReference),
      transaction.get(orderReference),
    ]);

    if (webhookSnapshot.exists) {
      return {
        duplicated: true,
        orderId,
      };
    }

    if (!orderSnapshot.exists) {
      throw new NotFoundError("La orden asociada al pago no existe.", {
        orderId,
      });
    }

    const order = mapOrderRecord(
      orderSnapshot.id,
      orderSnapshot.data() as Parameters<typeof mapOrderRecord>[1],
    );
    const paymentState = mapMercadoPagoPaymentStatus(input.payment.status);
    const now = new Date().toISOString();
    const nextInventoryReservation = order.inventoryReservation
      ? { ...order.inventoryReservation }
      : null;

    if (
      paymentState.paymentStatus === "paid" &&
      order.inventoryReservation?.status === "reserved"
    ) {
      await Promise.all(
        order.items.map(async (item) => {
          const productReference = database.collection("products").doc(item.productId);
          const productSnapshot = await transaction.get(productReference);

          if (!productSnapshot.exists) {
            return;
          }

          const product = mapProductRecord(
            productSnapshot.id,
            productSnapshot.data() as Partial<Product>,
          );

          if (!product.trackInventory) {
            return;
          }

          transaction.update(productReference, {
            stock: FieldValue.increment(-item.quantity),
            reservedStock: FieldValue.increment(-item.quantity),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }),
      );

      if (nextInventoryReservation) {
        nextInventoryReservation.status = "consumed";
        nextInventoryReservation.consumedAt = now;
      }
    }

    if (
      (paymentState.paymentStatus === "failed" ||
        paymentState.paymentStatus === "cancelled") &&
      order.inventoryReservation?.status === "reserved"
    ) {
      await Promise.all(
        order.items.map(async (item) => {
          const productReference = database.collection("products").doc(item.productId);
          const productSnapshot = await transaction.get(productReference);

          if (!productSnapshot.exists) {
            return;
          }

          const product = mapProductRecord(
            productSnapshot.id,
            productSnapshot.data() as Partial<Product>,
          );

          if (!product.trackInventory) {
            return;
          }

          transaction.update(productReference, {
            reservedStock: FieldValue.increment(-item.quantity),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }),
      );

      if (nextInventoryReservation) {
        nextInventoryReservation.status = "released";
        nextInventoryReservation.releasedAt = now;
      }
    }

    const nextStatusHistory = [
      ...order.statusHistory,
      {
        id: crypto.randomUUID(),
        createdAt: now,
        actorRole: "webhook" as const,
        actorId: input.payment.id ? String(input.payment.id) : null,
        actorName: "Mercado Pago",
        message: `Webhook ${input.webhookEventType} procesado con estado ${input.payment.status ?? "unknown"}.`,
        status: paymentState.orderStatus,
        paymentStatus: paymentState.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
      },
    ];

    const nextPaymentLogs = [
      ...order.paymentLogs,
      {
        id: crypto.randomUUID(),
        createdAt: now,
        provider: "mercado_pago" as const,
        eventType: input.webhookEventType,
        externalEventId: input.eventId,
        status: input.payment.status ?? "unknown",
        payload: {
          paymentId: input.payment.id,
          statusDetail: input.payment.status_detail,
          paymentTypeId: input.payment.payment_type_id,
          transactionAmount: input.payment.transaction_amount,
        },
      },
    ];

    const nextWebhookEvents = [
      ...order.webhookEvents,
      {
        id: crypto.randomUUID(),
        createdAt: now,
        provider: "mercado_pago" as const,
        eventType: input.webhookEventType,
        externalEventId: input.eventId,
        status: input.payment.status ?? "unknown",
        payload: {
          paymentId: input.payment.id,
        },
      },
    ];

    transaction.set(
      orderReference,
      {
        status: paymentState.orderStatus,
        paymentStatus: paymentState.paymentStatus,
        paymentProvider: "mercado_pago",
        paymentMethod: "checkout_pro",
        transactionId:
          input.payment.transaction_details?.transaction_id ??
          (input.payment.id ? String(input.payment.id) : null),
        inventoryReservation: nextInventoryReservation,
        paidAt:
          paymentState.paymentStatus === "paid"
            ? input.payment.date_approved ?? now
            : order.paidAt,
        cancelledAt:
          paymentState.paymentStatus === "cancelled" ? now : order.cancelledAt,
        refundedAt:
          paymentState.paymentStatus === "refunded" ? now : order.refundedAt,
        statusHistory: nextStatusHistory,
        paymentLogs: nextPaymentLogs,
        webhookEvents: nextWebhookEvents,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    transaction.set(webhookReference, {
      provider: "mercado_pago",
      notificationId: input.eventId,
      webhookEventType: input.webhookEventType,
      orderId,
      paymentId: input.payment.id ? String(input.payment.id) : null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      duplicated: false,
      orderId,
      orderStatus: paymentState.orderStatus,
      paymentStatus: paymentState.paymentStatus,
    };
  });
}
