import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { mapOrderRecord } from "@/lib/serializers/order";
import { db } from "@/lib/firebase/config";
import { Order } from "@/types";

const COLLECTION_NAME = "orders";

export async function getOrdersByUser(userId: string) {
  const database = db;

  if (!database) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(database, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ),
  );

  return snapshot.docs.map((entry) => mapOrderRecord(entry.id, entry.data() as Partial<Order>));
}

export async function getAllOrders() {
  const database = db;

  if (!database) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(database, COLLECTION_NAME), orderBy("createdAt", "desc")),
  );

  return snapshot.docs.map((entry) => mapOrderRecord(entry.id, entry.data() as Partial<Order>));
}

export async function resumeOrderPayment(input: {
  token: string;
  orderId: string;
}): Promise<{
  preferenceId: string;
  checkoutUrl: string;
}> {
  const response = await fetch(`/api/orders/${input.orderId}/payment`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${input.token}`,
    },
  });

  const payload = (await response.json()) as {
    ok: boolean;
    data?: {
      preferenceId: string;
      checkoutUrl: string | null;
    };
    error?: {
      message?: string;
    };
  };

  if (!response.ok || !payload.ok || !payload.data?.checkoutUrl) {
    throw new Error(payload.error?.message ?? "No se pudo retomar el pago.");
  }

  return {
    preferenceId: payload.data.preferenceId,
    checkoutUrl: payload.data.checkoutUrl,
  };
}
