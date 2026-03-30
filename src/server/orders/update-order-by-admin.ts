import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { mapOrderRecord } from "@/lib/serializers/order";
import { mapProductRecord } from "@/lib/serializers/product";
import { getAdminDb } from "@/server/firebase-admin";
import { NotFoundError, ValidationError } from "@/server/errors";
import {
  FulfillmentStatus,
  OrderStatus,
  OrderStatusUpdateInput,
  PaymentStatus,
  Product,
} from "@/types";
import { orderStatusUpdateSchema } from "@/validators/order";

function deriveNextStatus(input: {
  currentStatus: OrderStatus;
  requestedStatus?: OrderStatus;
  requestedPaymentStatus?: PaymentStatus;
  requestedFulfillmentStatus?: FulfillmentStatus;
}) {
  if (input.requestedStatus) {
    return input.requestedStatus;
  }

  if (input.requestedFulfillmentStatus === "delivered") {
    return "fulfilled";
  }

  if (input.requestedPaymentStatus === "paid") {
    return "paid";
  }

  if (input.requestedPaymentStatus === "failed") {
    return "payment_failed";
  }

  if (input.requestedPaymentStatus === "cancelled") {
    return "cancelled";
  }

  if (input.requestedPaymentStatus === "refunded") {
    return "refunded";
  }

  return input.currentStatus;
}

export async function updateOrderByAdmin(input: {
  orderId: string;
  actorId: string;
  actorName?: string | null;
  patch: OrderStatusUpdateInput;
}) {
  const parsedPatch = orderStatusUpdateSchema.safeParse(input.patch);

  if (!parsedPatch.success) {
    throw new ValidationError("La actualizacion operativa no es valida.", {
      issues: parsedPatch.error.flatten(),
    });
  }

  const database = getAdminDb();
  const orderReference = database.collection("orders").doc(input.orderId);

  return database.runTransaction(async (transaction) => {
    const orderSnapshot = await transaction.get(orderReference);

    if (!orderSnapshot.exists) {
      throw new NotFoundError("La orden no existe.", {
        orderId: input.orderId,
      });
    }

    const order = mapOrderRecord(
      orderSnapshot.id,
      orderSnapshot.data() as Parameters<typeof mapOrderRecord>[1],
    );
    const patch = parsedPatch.data;
    const nextStatus = deriveNextStatus({
      currentStatus: order.status,
      requestedStatus: patch.status,
      requestedPaymentStatus: patch.paymentStatus,
      requestedFulfillmentStatus: patch.fulfillmentStatus,
    });
    const nextPaymentStatus = patch.paymentStatus ?? order.paymentStatus;
    const nextFulfillmentStatus = patch.fulfillmentStatus ?? order.fulfillmentStatus;
    const now = new Date().toISOString();
    const nextInventoryReservation = order.inventoryReservation
      ? { ...order.inventoryReservation }
      : null;

    if (
      nextPaymentStatus === "paid" &&
      order.paymentStatus !== "paid" &&
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
      (nextStatus === "cancelled" ||
        nextPaymentStatus === "failed" ||
        nextPaymentStatus === "cancelled") &&
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

    const adminNotes = patch.adminNote
      ? [
          ...order.adminNotes,
          {
            id: crypto.randomUUID(),
            createdAt: now,
            actorId: input.actorId,
            actorName: input.actorName ?? null,
            note: patch.adminNote,
          },
        ]
      : order.adminNotes;

    const statusHistory = [
      ...order.statusHistory,
      {
        id: crypto.randomUUID(),
        createdAt: now,
        actorRole: "admin" as const,
        actorId: input.actorId,
        actorName: input.actorName ?? null,
        message: patch.adminNote ?? "Actualizacion operativa manual.",
        status: nextStatus,
        paymentStatus: nextPaymentStatus,
        fulfillmentStatus: nextFulfillmentStatus,
        metadata: {
          trackingNumber: patch.trackingNumber ?? order.trackingNumber ?? null,
          carrier: patch.carrier ?? order.carrier ?? null,
        },
      },
    ];

    transaction.set(
      orderReference,
      {
        status: nextStatus,
        paymentStatus: nextPaymentStatus,
        fulfillmentStatus: nextFulfillmentStatus,
        trackingNumber: patch.trackingNumber ?? order.trackingNumber ?? null,
        carrier: patch.carrier ?? order.carrier ?? null,
        adminNotes,
        statusHistory,
        inventoryReservation: nextInventoryReservation,
        cancellationReason: patch.cancellationReason ?? order.cancellationReason ?? null,
        refundReason: patch.refundReason ?? order.refundReason ?? null,
        paidAt: nextPaymentStatus === "paid" ? order.paidAt ?? now : order.paidAt,
        shippedAt:
          nextFulfillmentStatus === "shipped" ? order.shippedAt ?? now : order.shippedAt,
        deliveredAt:
          nextFulfillmentStatus === "delivered"
            ? order.deliveredAt ?? now
            : order.deliveredAt,
        cancelledAt:
          nextStatus === "cancelled" ? order.cancelledAt ?? now : order.cancelledAt,
        refundedAt:
          nextPaymentStatus === "refunded" ? order.refundedAt ?? now : order.refundedAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
}
