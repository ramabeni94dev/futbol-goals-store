import { CheckoutRequest, CreateOrderResponse } from "@/types";

interface CheckoutApiResponse {
  ok: boolean;
  data?: CreateOrderResponse;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown> | null;
  };
}

export class CheckoutApiError extends Error {
  code: string;
  details?: Record<string, unknown> | null;

  constructor(message: string, code: string, details?: Record<string, unknown> | null) {
    super(message);
    this.name = "CheckoutApiError";
    this.code = code;
    this.details = details;
  }
}

export async function createCheckoutOrder(input: {
  token: string;
  payload: CheckoutRequest;
}) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${input.token}`,
    },
    body: JSON.stringify(input.payload),
  });

  const payload = (await response.json()) as CheckoutApiResponse;

  if (!response.ok || !payload.ok || !payload.data) {
    throw new CheckoutApiError(
      payload.error?.message ?? "No se pudo iniciar el checkout.",
      payload.error?.code ?? "CHECKOUT_FAILED",
      payload.error?.details ?? null,
    );
  }

  return payload.data;
}
