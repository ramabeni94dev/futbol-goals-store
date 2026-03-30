import { NextResponse } from "next/server";

import { listOrdersServer } from "@/repositories/server-orders-repository";
import { requireAdminUser } from "@/server/auth";
import { getErrorResponse } from "@/server/errors";
import { logError } from "@/server/logger";

export async function GET(request: Request) {
  try {
    await requireAdminUser(request);
    const orders = await listOrdersServer();

    return NextResponse.json({
      ok: true,
      data: orders,
    });
  } catch (error) {
    logError("admin.orders.list.failed", {
      message: error instanceof Error ? error.message : "Unknown admin list orders error",
    });

    const response = getErrorResponse(error, "No se pudieron cargar las ordenes.");
    return NextResponse.json(response.body, {
      status: response.status,
    });
  }
}
