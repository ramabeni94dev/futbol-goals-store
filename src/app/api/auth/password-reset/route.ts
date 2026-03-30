import { NextResponse } from "next/server";

import { getAdminAuth } from "@/server/firebase-admin";
import { sendPasswordResetEmail } from "@/server/emails/notifications";
import { serverEnv } from "@/server/env";
import { logError, logInfo } from "@/server/logger";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; customerName?: string };

    if (!payload.email) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "EMAIL_REQUIRED",
            message: "Debes indicar un email.",
          },
        },
        { status: 400 },
      );
    }

    try {
      const actionUrl = await getAdminAuth().generatePasswordResetLink(payload.email, {
        url: `${serverEnv.appUrl}/login`,
      });

      await sendPasswordResetEmail({
        email: payload.email,
        customerName: payload.customerName,
        actionUrl,
      });

      logInfo("auth.password_reset.sent", {
        email: payload.email,
      });
    } catch (error) {
      logError("auth.password_reset.skipped", {
        email: payload.email,
        message: error instanceof Error ? error.message : "Unknown password reset error",
      });
    }

    return NextResponse.json({
      ok: true,
    });
  } catch {
    return NextResponse.json({
      ok: true,
    });
  }
}
