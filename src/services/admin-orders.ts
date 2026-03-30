import { Order, OrderStatusUpdateInput } from "@/types";

interface AdminApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown> | null;
  };
}

export class AdminOrdersApiError extends Error {
  code: string;
  details?: Record<string, unknown> | null;

  constructor(message: string, code: string, details?: Record<string, unknown> | null) {
    super(message);
    this.name = "AdminOrdersApiError";
    this.code = code;
    this.details = details;
  }
}

async function parseAdminResponse<T>(response: Response) {
  const payload = (await response.json()) as AdminApiResponse<T>;

  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new AdminOrdersApiError(
      payload.error?.message ?? "No se pudo completar la accion administrativa.",
      payload.error?.code ?? "ADMIN_ORDER_FAILED",
      payload.error?.details ?? null,
    );
  }

  return payload.data;
}

export async function listAdminOrders(token: string) {
  const response = await fetch("/api/admin/orders", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  return parseAdminResponse<Order[]>(response);
}

export async function getAdminOrder(token: string, orderId: string) {
  const response = await fetch(`/api/admin/orders/${orderId}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  return parseAdminResponse<Order>(response);
}

export async function updateAdminOrder(input: {
  token: string;
  orderId: string;
  payload: OrderStatusUpdateInput;
}) {
  const response = await fetch(`/api/admin/orders/${input.orderId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${input.token}`,
    },
    body: JSON.stringify(input.payload),
  });

  return parseAdminResponse<Order | null>(response);
}
