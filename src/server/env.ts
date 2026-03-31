function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function readPrivateKey(name: string) {
  return readEnv(name).replace(/\\n/g, "\n");
}

export const serverEnv = {
  appUrl: readEnv("NEXT_PUBLIC_SITE_URL") || readEnv("APP_URL") || "http://localhost:3000",
  firebaseAdminProjectId: readEnv("FIREBASE_ADMIN_PROJECT_ID"),
  firebaseAdminClientEmail: readEnv("FIREBASE_ADMIN_CLIENT_EMAIL"),
  firebaseAdminPrivateKey: readPrivateKey("FIREBASE_ADMIN_PRIVATE_KEY"),
  firebaseAdminServiceAccountPath: readEnv("FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH"),
  mercadoPagoAccessToken: readEnv("MERCADO_PAGO_ACCESS_TOKEN"),
  mercadoPagoWebhookSecret: readEnv("MERCADO_PAGO_WEBHOOK_SECRET"),
  mercadoPagoWebhookUrl:
    readEnv("MERCADO_PAGO_WEBHOOK_URL") ||
    `${readEnv("NEXT_PUBLIC_SITE_URL") || readEnv("APP_URL") || "http://localhost:3000"}/api/webhooks/mercado-pago`,
  mercadoPagoSuccessUrl:
    readEnv("MERCADO_PAGO_SUCCESS_URL") ||
    `${readEnv("NEXT_PUBLIC_SITE_URL") || readEnv("APP_URL") || "http://localhost:3000"}/account`,
  mercadoPagoPendingUrl:
    readEnv("MERCADO_PAGO_PENDING_URL") ||
    `${readEnv("NEXT_PUBLIC_SITE_URL") || readEnv("APP_URL") || "http://localhost:3000"}/account`,
  mercadoPagoFailureUrl:
    readEnv("MERCADO_PAGO_FAILURE_URL") ||
    `${readEnv("NEXT_PUBLIC_SITE_URL") || readEnv("APP_URL") || "http://localhost:3000"}/checkout`,
  resendApiKey: readEnv("RESEND_API_KEY"),
  emailFrom: readEnv("EMAIL_FROM"),
  emailReplyTo: readEnv("EMAIL_REPLY_TO"),
};

export function isFirebaseAdminConfigured() {
  const hasInlineCredentials = Boolean(
    serverEnv.firebaseAdminProjectId &&
      serverEnv.firebaseAdminClientEmail &&
      serverEnv.firebaseAdminPrivateKey,
  );

  return hasInlineCredentials || Boolean(serverEnv.firebaseAdminServiceAccountPath);
}

export function isMercadoPagoConfigured() {
  return Boolean(serverEnv.mercadoPagoAccessToken);
}

export function isEmailServiceConfigured() {
  return Boolean(serverEnv.resendApiKey && serverEnv.emailFrom);
}
