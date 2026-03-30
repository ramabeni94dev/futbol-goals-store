import "server-only";

import { buildEmailVerificationEmail } from "@/emails/email-verification";
import { buildOrderCancelledEmail } from "@/emails/order-cancelled";
import { buildOrderCreatedEmail } from "@/emails/order-created";
import { buildOrderShippedEmail } from "@/emails/order-shipped";
import { buildPasswordResetEmail } from "@/emails/password-reset";
import { buildPaymentConfirmedEmail } from "@/emails/payment-confirmed";
import { siteConfig } from "@/config/site";
import { sendEmailMessage } from "@/server/emails/service";
import { Order } from "@/types";

function resolveAbsoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  return `${siteConfig.url}${pathOrUrl}`;
}

export async function sendOrderCreatedEmail(order: Order, checkoutUrl?: string | null) {
  const email = buildOrderCreatedEmail(order, checkoutUrl ? resolveAbsoluteUrl(checkoutUrl) : resolveAbsoluteUrl("/account"));

  return sendEmailMessage({
    to: order.customerEmail,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendPaymentConfirmedEmail(order: Order) {
  const email = buildPaymentConfirmedEmail(order);

  return sendEmailMessage({
    to: order.customerEmail,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendOrderShippedEmail(order: Order) {
  const email = buildOrderShippedEmail(order);

  return sendEmailMessage({
    to: order.customerEmail,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendOrderCancelledEmail(order: Order) {
  const email = buildOrderCancelledEmail(order);

  return sendEmailMessage({
    to: order.customerEmail,
    subject: email.subject,
    html: email.html,
  });
}

export async function sendVerificationEmail(input: {
  email: string;
  customerName?: string | null;
  actionUrl: string;
}) {
  const template = buildEmailVerificationEmail({
    customerName: input.customerName,
    actionUrl: input.actionUrl,
  });

  return sendEmailMessage({
    to: input.email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendPasswordResetEmail(input: {
  email: string;
  customerName?: string | null;
  actionUrl: string;
}) {
  const template = buildPasswordResetEmail({
    customerName: input.customerName,
    actionUrl: input.actionUrl,
  });

  return sendEmailMessage({
    to: input.email,
    subject: template.subject,
    html: template.html,
  });
}
