import { FulfillmentStatus, Order, OrderStatus, PaymentStatus } from "@/types";

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  awaiting_payment: "Esperando pago",
  paid: "Pagada",
  payment_failed: "Pago rechazado",
  cancelled: "Cancelada",
  refunded: "Reintegrada",
  fulfilled: "Entregada",
};

const orderStatusClasses: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  awaiting_payment: "bg-sky-100 text-sky-800",
  paid: "bg-emerald-100 text-emerald-800",
  payment_failed: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-200 text-slate-700",
  refunded: "bg-fuchsia-100 text-fuchsia-700",
  fulfilled: "bg-emerald-100 text-emerald-900",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pendiente",
  authorized: "Autorizado",
  paid: "Pagado",
  failed: "Fallido",
  cancelled: "Cancelado",
  refunded: "Reintegrado",
};

const fulfillmentStatusLabels: Record<FulfillmentStatus, string> = {
  unfulfilled: "Sin preparar",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  returned: "Devuelto",
};

export function getOrderStatusLabel(status: OrderStatus) {
  return orderStatusLabels[status];
}

export function getOrderStatusClassName(status: OrderStatus) {
  return orderStatusClasses[status];
}

export function getPaymentStatusLabel(status: PaymentStatus) {
  return paymentStatusLabels[status];
}

export function getFulfillmentStatusLabel(status: FulfillmentStatus) {
  return fulfillmentStatusLabels[status];
}

export function normalizeOrderStatus(value: unknown): OrderStatus {
  switch (value) {
    case "awaiting_payment":
    case "paid":
    case "payment_failed":
    case "cancelled":
    case "refunded":
    case "fulfilled":
      return value;
    case "completed":
      return "fulfilled";
    case "processing":
      return "awaiting_payment";
    default:
      return "pending";
  }
}

export function normalizePaymentStatus(value: unknown, orderStatus?: OrderStatus): PaymentStatus {
  switch (value) {
    case "authorized":
    case "paid":
    case "failed":
    case "cancelled":
    case "refunded":
      return value;
    case "pending":
      return "pending";
    default:
      if (orderStatus === "paid" || orderStatus === "fulfilled") {
        return "paid";
      }

      if (orderStatus === "payment_failed") {
        return "failed";
      }

      if (orderStatus === "cancelled") {
        return "cancelled";
      }

      if (orderStatus === "refunded") {
        return "refunded";
      }

      return "pending";
  }
}

export function normalizeFulfillmentStatus(
  value: unknown,
  orderStatus?: OrderStatus,
): FulfillmentStatus {
  switch (value) {
    case "preparing":
    case "shipped":
    case "delivered":
    case "cancelled":
    case "returned":
      return value;
    case "unfulfilled":
      return "unfulfilled";
    default:
      if (orderStatus === "fulfilled") {
        return "delivered";
      }

      if (orderStatus === "cancelled") {
        return "cancelled";
      }

      return "unfulfilled";
  }
}

export function canResumeOrderPayment(
  order: Pick<Order, "status" | "paymentStatus" | "inventoryReservation">,
) {
  if (order.paymentStatus === "paid") {
    return false;
  }

  if (order.status !== "awaiting_payment") {
    return false;
  }

  if (order.inventoryReservation?.status !== "reserved") {
    return false;
  }

  if (!order.inventoryReservation.expiresAt) {
    return true;
  }

  return new Date(order.inventoryReservation.expiresAt).getTime() > Date.now();
}
