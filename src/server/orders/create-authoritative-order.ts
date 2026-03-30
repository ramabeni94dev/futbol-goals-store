import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { canReserveProductStock, getAvailableStock } from "@/lib/inventory";
import { mapProductRecord } from "@/lib/serializers/product";
import { getAdminDb } from "@/server/firebase-admin";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import { logInfo, logWarn } from "@/server/logger";
import { calculateOrderPricing } from "@/server/commerce/pricing";
import { CheckoutRequest, CreateOrderResponse, Product } from "@/types";
import { checkoutRequestSchema } from "@/validators/checkout";

const RESERVATION_WINDOW_MINUTES = 30;

function buildStatusHistoryEntry(input: {
  userId: string;
  customerName: string;
  message: string;
}) {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    actorRole: "customer" as const,
    actorId: input.userId,
    actorName: input.customerName,
    message: input.message,
    status: "awaiting_payment" as const,
    paymentStatus: "pending" as const,
    fulfillmentStatus: "unfulfilled" as const,
  };
}

export async function createAuthoritativeOrder(
  input: CheckoutRequest,
  context: {
    userId: string;
  },
): Promise<CreateOrderResponse> {
  const parsedInput = checkoutRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new ValidationError("Los datos del checkout no son validos.", {
      issues: parsedInput.error.flatten(),
    });
  }

  const checkout = parsedInput.data;
  const database = getAdminDb();
  const orderReference = database.collection("orders").doc();
  const createdAt = new Date();
  const reservationExpiresAt = new Date(
    createdAt.getTime() + RESERVATION_WINDOW_MINUTES * 60 * 1000,
  );
  const shippingMethod = checkout.shippingMethod ?? "pickup";

  const transactionResult = await database.runTransaction(async (transaction) => {
    const productReferences = checkout.items.map((item) =>
      database.collection("products").doc(item.productId),
    );
    const productSnapshots = await Promise.all(
      productReferences.map((reference) => transaction.get(reference)),
    );

    const orderItems = checkout.items.map((item, index) => {
      const productSnapshot = productSnapshots[index];

      if (!productSnapshot.exists) {
        throw new NotFoundError("Uno de los productos ya no existe.", {
          productId: item.productId,
        });
      }

      const product = mapProductRecord(
        productSnapshot.id,
        productSnapshot.data() as Partial<Product>,
      );

      if (!product.isActive) {
        throw new ValidationError("Uno de los productos ya no esta disponible para la venta.", {
          productId: product.id,
        });
      }

      if (!canReserveProductStock(product, item.quantity)) {
        throw new ConflictError("No hay stock suficiente para completar la orden.", {
          productId: product.id,
          requestedQuantity: item.quantity,
          availableStock: getAvailableStock(product),
        });
      }

      return {
        product,
        quantity: item.quantity,
      };
    });

    const pricing = calculateOrderPricing({
      items: orderItems,
      shippingMethod,
      couponCode: checkout.couponCode ?? null,
    });

    orderItems.forEach(({ product, quantity }, index) => {
      if (!product.trackInventory) {
        return;
      }

      transaction.update(productReferences[index], {
        reservedStock: FieldValue.increment(quantity),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    transaction.set(orderReference, {
      userId: context.userId,
      customerName: checkout.customerName,
      customerEmail: checkout.customerEmail,
      items: orderItems.map(({ product, quantity }) => ({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0] ?? "",
        unitPrice: product.price,
        quantity,
        lineTotal: product.price * quantity,
        sku: product.sku ?? null,
      })),
      ...pricing,
      shippingMethod,
      shippingAddress: {
        street: checkout.street,
        city: checkout.city,
        province: checkout.province,
        postalCode: checkout.postalCode,
        notes: checkout.notes,
      },
      couponCode: pricing.couponCode,
      couponSnapshot: pricing.couponSnapshot,
      status: "awaiting_payment",
      paymentStatus: "pending",
      fulfillmentStatus: "unfulfilled",
      paymentMethod: "manual",
      paymentProvider: "manual",
      paymentIntentId: null,
      preferenceId: null,
      transactionId: null,
      paymentLogs: [],
      webhookEvents: [],
      inventoryReservation: {
        status: "reserved",
        reservedAt: createdAt.toISOString(),
        releasedAt: null,
        consumedAt: null,
        expiresAt: reservationExpiresAt.toISOString(),
        items: checkout.items,
      },
      trackingNumber: null,
      carrier: null,
      adminNotes: [],
      statusHistory: [
        buildStatusHistoryEntry({
          userId: context.userId,
          customerName: checkout.customerName,
          message: "Orden creada y stock reservado desde el checkout seguro.",
        }),
      ],
      cancellationReason: null,
      refundReason: null,
      externalReference: orderReference.id,
      paidAt: null,
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null,
      refundedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return pricing;
  });

  logInfo("checkout.order.created", {
    orderId: orderReference.id,
    userId: context.userId,
    total: transactionResult.total,
    itemCount: checkout.items.length,
  });

  return {
    orderId: orderReference.id,
    status: "awaiting_payment",
    paymentStatus: "pending",
    total: transactionResult.total,
    currency: transactionResult.currency,
    paymentProvider: "manual",
    paymentMethod: "manual",
  };
}

export function isStockConflict(error: unknown) {
  if (!(error instanceof ConflictError)) {
    return false;
  }

  logWarn("checkout.order.stock_conflict", error.details);
  return true;
}
