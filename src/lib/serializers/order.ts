import {
  normalizeFulfillmentStatus,
  normalizeOrderStatus,
  normalizePaymentStatus,
} from "@/lib/orders";
import { normalizeDate } from "@/lib/utils";
import { Order, OrderItem } from "@/types";

function mapOrderItem(payload: Partial<OrderItem> & { price?: unknown }): OrderItem {
  const unitPrice = Number(payload.unitPrice ?? payload.price ?? 0);
  const quantity = Number(payload.quantity ?? 0);

  return {
    productId: payload.productId ?? "",
    slug: payload.slug ?? "",
    name: payload.name ?? "",
    image: payload.image ?? "",
    unitPrice,
    quantity,
    lineTotal: Number(payload.lineTotal ?? unitPrice * quantity),
    sku: payload.sku ?? null,
  };
}

export function mapOrderRecord(
  id: string,
  payload: Partial<Order> & { createdAt?: unknown; updatedAt?: unknown },
): Order {
  const status = normalizeOrderStatus(payload.status);
  const paymentStatus = normalizePaymentStatus(payload.paymentStatus, status);
  const fulfillmentStatus = normalizeFulfillmentStatus(
    payload.fulfillmentStatus,
    status,
  );

  return {
    id,
    userId: payload.userId ?? "",
    customerName: payload.customerName ?? "",
    customerEmail: payload.customerEmail ?? "",
    items: (payload.items ?? []).map((item) => mapOrderItem(item)),
    currency: payload.currency ?? "ARS",
    subtotal: Number(payload.subtotal ?? payload.total ?? 0),
    shippingCost: Number(payload.shippingCost ?? 0),
    tax: Number(payload.tax ?? 0),
    discount: Number(payload.discount ?? 0),
    total: Number(payload.total ?? 0),
    shippingMethod: payload.shippingMethod ?? "pickup",
    shippingAddress: payload.shippingAddress ?? {
      street: "",
      city: "",
      province: "",
      postalCode: "",
    },
    couponCode: payload.couponCode ?? null,
    couponSnapshot: payload.couponSnapshot ?? null,
    status,
    paymentStatus,
    fulfillmentStatus,
    paymentMethod: payload.paymentMethod ?? "manual",
    paymentProvider: payload.paymentProvider ?? "manual",
    paymentIntentId: payload.paymentIntentId ?? null,
    preferenceId: payload.preferenceId ?? null,
    transactionId: payload.transactionId ?? null,
    paymentLogs: payload.paymentLogs ?? [],
    webhookEvents: payload.webhookEvents ?? [],
    inventoryReservation: payload.inventoryReservation ?? null,
    trackingNumber: payload.trackingNumber ?? null,
    carrier: payload.carrier ?? null,
    adminNotes: payload.adminNotes ?? [],
    statusHistory: payload.statusHistory ?? [],
    cancellationReason: payload.cancellationReason ?? null,
    refundReason: payload.refundReason ?? null,
    externalReference: payload.externalReference ?? null,
    paidAt: payload.paidAt ?? null,
    shippedAt: payload.shippedAt ?? null,
    deliveredAt: payload.deliveredAt ?? null,
    cancelledAt: payload.cancelledAt ?? null,
    refundedAt: payload.refundedAt ?? null,
    createdAt: normalizeDate(payload.createdAt),
    updatedAt: normalizeDate(payload.updatedAt ?? payload.createdAt),
  };
}
