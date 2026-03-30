import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { mapOrderRecord } from "@/lib/serializers/order";
import { mapProductRecord } from "@/lib/serializers/product";
import { getAdminDb } from "@/server/firebase-admin";
import { NotFoundError } from "@/server/errors";
import { Product } from "@/types";

export async function releaseOrderReservation(input: {
  orderId: string;
  paymentStatus: "failed" | "cancelled";
  reason: string;
}) {
  const database = getAdminDb();
  const orderReference = database.collection("orders").doc(input.orderId);

  return database.runTransaction(async (transaction) => {
    const orderSnapshot = await transaction.get(orderReference);

    if (!orderSnapshot.exists) {
      throw new NotFoundError("No existe la orden a compensar.", {
        orderId: input.orderId,
      });
    }

    const order = mapOrderRecord(
      orderSnapshot.id,
      orderSnapshot.data() as Parameters<typeof mapOrderRecord>[1],
    );

    if (order.inventoryReservation?.status !== "reserved") {
      return {
        released: false,
        orderId: input.orderId,
      };
    }

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

    transaction.set(
      orderReference,
      {
        status: input.paymentStatus === "cancelled" ? "cancelled" : "payment_failed",
        paymentStatus: input.paymentStatus,
        inventoryReservation: {
          ...order.inventoryReservation,
          status: "released",
          releasedAt: new Date().toISOString(),
        },
        statusHistory: [
          ...order.statusHistory,
          {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            actorRole: "system" as const,
            actorId: null,
            actorName: null,
            message: input.reason,
            status: input.paymentStatus === "cancelled" ? "cancelled" : "payment_failed",
            paymentStatus: input.paymentStatus,
            fulfillmentStatus: order.fulfillmentStatus,
          },
        ],
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return {
      released: true,
      orderId: input.orderId,
    };
  });
}
