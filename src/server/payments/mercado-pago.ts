import "server-only";

import crypto from "node:crypto";

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";

import { serverEnv, isMercadoPagoConfigured } from "@/server/env";
import { ValidationError } from "@/server/errors";
import { logWarn } from "@/server/logger";
import { Order } from "@/types";

function getMercadoPagoClient() {
  if (!isMercadoPagoConfigured()) {
    throw new ValidationError(
      "Mercado Pago no esta configurado. Completa MERCADO_PAGO_ACCESS_TOKEN.",
    );
  }

  return new MercadoPagoConfig({
    accessToken: serverEnv.mercadoPagoAccessToken,
    options: {
      timeout: 5000,
    },
  });
}

function buildMercadoPagoItems(order: Order) {
  const orderItems = order.items.map((item) => ({
    id: item.productId,
    title: item.name,
    description: `Arco de futbol ${item.name}`,
    picture_url: item.image,
    category_id: "sports",
    quantity: item.quantity,
    currency_id: order.currency,
    unit_price: item.unitPrice,
  }));

  let remainingDiscount = order.discount;

  const discountedItems = orderItems.map((item) => {
    if (remainingDiscount <= 0) {
      return item;
    }

    const lineTotal = item.unit_price * item.quantity;
    const applicableDiscount = Math.min(lineTotal, remainingDiscount);
    remainingDiscount -= applicableDiscount;

    return {
      ...item,
      unit_price: Number(((lineTotal - applicableDiscount) / item.quantity).toFixed(2)),
    };
  });

  if (remainingDiscount > 0) {
    throw new ValidationError(
      "El descuento comercial excede el subtotal y no puede enviarse a Mercado Pago.",
      {
        orderId: order.id,
      },
    );
  }

  if (order.shippingCost > 0) {
    discountedItems.push({
      id: `shipping-${order.shippingMethod}`,
      title: order.shippingMethod === "pickup" ? "Retiro en deposito" : "Envio",
      description: "Cargo logistico del pedido",
      picture_url: "",
      category_id: "shipping",
      quantity: 1,
      currency_id: order.currency,
      unit_price: order.shippingCost,
    });
  }

  if (order.tax > 0) {
    discountedItems.push({
      id: "tax",
      title: "Impuestos",
      description: "Impuestos aplicados al pedido",
      picture_url: "",
      category_id: "tax",
      quantity: 1,
      currency_id: order.currency,
      unit_price: order.tax,
    });
  }

  return discountedItems;
}

function isPublicHttpUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    return !["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch {
    return false;
  }
}

function buildMercadoPagoRedirectConfig() {
  const success = serverEnv.mercadoPagoSuccessUrl;
  const pending = serverEnv.mercadoPagoPendingUrl;
  const failure = serverEnv.mercadoPagoFailureUrl;

  if ([success, pending, failure].every(isPublicHttpUrl)) {
    return {
      auto_return: "approved" as const,
      back_urls: {
        success,
        pending,
        failure,
      },
    };
  }

  logWarn("mercadopago.redirect_urls.skipped", {
    success,
    pending,
    failure,
    reason: "Mercado Pago requiere URLs publicas para auto_return y back_urls.",
  });

  return {};
}

function buildMercadoPagoWebhookConfig() {
  if (isPublicHttpUrl(serverEnv.mercadoPagoWebhookUrl)) {
    return {
      notification_url: serverEnv.mercadoPagoWebhookUrl,
    };
  }

  logWarn("mercadopago.webhook_url.skipped", {
    notificationUrl: serverEnv.mercadoPagoWebhookUrl,
    reason: "El webhook se omite porque la URL no es publica.",
  });

  return {};
}

function normalizeMercadoPagoError(error: unknown, orderId: string) {
  if (error instanceof ValidationError) {
    return error;
  }

  if (error instanceof Error) {
    return new ValidationError(`Mercado Pago rechazo la preferencia de pago: ${error.message}`, {
      orderId,
      cause: error.cause ?? null,
    });
  }

  if (typeof error === "object" && error !== null) {
    const payload = error as {
      message?: unknown;
      error?: unknown;
      status?: unknown;
      cause?: unknown;
    };

    const message =
      typeof payload.message === "string" && payload.message.trim().length
        ? payload.message
        : "Mercado Pago rechazo la preferencia de pago.";

    return new ValidationError(message, {
      orderId,
      mercadoPagoError:
        typeof payload.error === "string" ? payload.error : "unknown_mercado_pago_error",
      status: typeof payload.status === "number" ? payload.status : null,
      cause: payload.cause ?? null,
    });
  }

  return new ValidationError("Mercado Pago rechazo la preferencia de pago.", {
    orderId,
  });
}

export async function createMercadoPagoPreference(order: Order) {
  const preferenceClient = new Preference(getMercadoPagoClient());
  let response;

  try {
    response = await preferenceClient.create({
      body: {
        external_reference: order.id,
        ...buildMercadoPagoWebhookConfig(),
        ...buildMercadoPagoRedirectConfig(),
        payer: {
          name: order.customerName,
          email: order.customerEmail,
        },
        items: buildMercadoPagoItems(order),
        metadata: {
          orderId: order.id,
          userId: order.userId,
          couponCode: order.couponCode,
        },
        statement_descriptor: "FUTBOL GOALS",
        binary_mode: false,
      },
      requestOptions: {
        idempotencyKey: `checkout_preference_${order.id}`,
      },
    });
  } catch (error) {
    throw normalizeMercadoPagoError(error, order.id);
  }

  if (!response.id || (!response.init_point && !response.sandbox_init_point)) {
    throw new ValidationError(
      "Mercado Pago devolvio una preferencia incompleta para la orden.",
      {
        orderId: order.id,
      },
    );
  }

  return {
    preferenceId: response.id,
    checkoutUrl: response.init_point ?? response.sandbox_init_point ?? null,
  };
}

export async function getMercadoPagoPayment(paymentId: string) {
  const paymentClient = new Payment(getMercadoPagoClient());
  return paymentClient.get({
    id: paymentId,
  });
}

function parseSignatureHeader(signatureHeader: string) {
  return signatureHeader.split(",").reduce<Record<string, string>>((accumulator, item) => {
    const [key, value] = item.split("=");

    if (key && value) {
      accumulator[key.trim()] = value.trim();
    }

    return accumulator;
  }, {});
}

export function validateMercadoPagoWebhookSignature(input: {
  request: Request;
  dataId: string | null;
}) {
  if (!serverEnv.mercadoPagoWebhookSecret) {
    return true;
  }

  const signatureHeader = input.request.headers.get("x-signature");
  const requestId = input.request.headers.get("x-request-id");

  if (!signatureHeader || !requestId || !input.dataId) {
    return false;
  }

  const parsedSignature = parseSignatureHeader(signatureHeader);
  const ts = parsedSignature.ts;
  const v1 = parsedSignature.v1;

  if (!ts || !v1) {
    return false;
  }

  const manifest = `id:${input.dataId};request-id:${requestId};ts:${ts};`;
  const generatedSignature = crypto
    .createHmac("sha256", serverEnv.mercadoPagoWebhookSecret)
    .update(manifest)
    .digest("hex");

  if (generatedSignature.length !== v1.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature),
    Buffer.from(v1.toLowerCase()),
  );
}

function extractIdFromResource(resource: unknown) {
  if (typeof resource !== "string") {
    return null;
  }

  const matches = resource.match(/\/(\d+)$/);
  return matches?.[1] ?? null;
}

export function extractMercadoPagoPaymentId(input: {
  request: Request;
  body: Record<string, unknown>;
}) {
  const url = new URL(input.request.url);

  return (
    url.searchParams.get("data.id") ??
    (typeof input.body.data === "object" &&
    input.body.data !== null &&
    "id" in input.body.data &&
    typeof input.body.data.id === "string"
      ? input.body.data.id
      : null) ??
    (typeof input.body.data === "object" &&
    input.body.data !== null &&
    "id" in input.body.data &&
    typeof input.body.data.id === "number"
      ? String(input.body.data.id)
      : null) ??
    extractIdFromResource(input.body.resource)
  );
}

export function extractMercadoPagoNotificationEventId(body: Record<string, unknown>) {
  if (typeof body.id === "string") {
    return body.id;
  }

  if (typeof body.id === "number") {
    return String(body.id);
  }

  return null;
}

export function extractMercadoPagoNotificationTopic(input: {
  request: Request;
  body: Record<string, unknown>;
}) {
  const url = new URL(input.request.url);

  return (
    url.searchParams.get("type") ??
    url.searchParams.get("topic") ??
    (typeof input.body.type === "string" ? input.body.type : null) ??
    (typeof input.body.topic === "string" ? input.body.topic : null)
  );
}

export type MercadoPagoPaymentDetails = PaymentResponse;
