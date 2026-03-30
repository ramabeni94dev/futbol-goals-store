import "server-only";

import { Resend } from "resend";

import { isEmailServiceConfigured, serverEnv } from "@/server/env";
import { logError, logInfo, logWarn } from "@/server/logger";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!isEmailServiceConfigured()) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(serverEnv.resendApiKey);
  }

  return resendClient;
}

export async function sendEmailMessage(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const client = getResendClient();

  if (!client) {
    logWarn("email.skipped", {
      to: input.to,
      subject: input.subject,
    });
    return { skipped: true };
  }

  try {
    await client.emails.send({
      from: serverEnv.emailFrom,
      to: input.to,
      replyTo: serverEnv.emailReplyTo || undefined,
      subject: input.subject,
      html: input.html,
    });

    logInfo("email.sent", {
      to: input.to,
      subject: input.subject,
    });
  } catch (error) {
    logError("email.failed", {
      to: input.to,
      subject: input.subject,
      message: error instanceof Error ? error.message : "Unknown email delivery error",
    });
  }

  return { skipped: false };
}
