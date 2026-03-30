import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth";
import { sendVerificationEmail } from "@/server/emails/notifications";
import { getAdminAuth } from "@/server/firebase-admin";
import { getErrorResponse } from "@/server/errors";
import { serverEnv } from "@/server/env";
import { logError, logInfo } from "@/server/logger";

export async function POST(request: Request) {
  try {
    const { token, profile } = await requireAuthenticatedUser(request);

    if (token.email_verified || !token.email) {
      return NextResponse.json({
        ok: true,
        skipped: true,
      });
    }

    const actionUrl = await getAdminAuth().generateEmailVerificationLink(token.email, {
      url: `${serverEnv.appUrl}/account`,
    });

    await sendVerificationEmail({
      email: token.email,
      customerName: profile?.name ?? token.name ?? null,
      actionUrl,
    });

    logInfo("auth.email_verification.sent", {
      uid: token.uid,
      email: token.email,
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    logError("auth.email_verification.failed", {
      message: error instanceof Error ? error.message : "Unknown verification email error",
    });

    const response = getErrorResponse(error, "No se pudo reenviar la verificacion.");
    return NextResponse.json(response.body, {
      status: response.status,
    });
  }
}
