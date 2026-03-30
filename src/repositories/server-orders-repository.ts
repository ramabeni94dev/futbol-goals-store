import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { mapOrderRecord } from "@/lib/serializers/order";
import { getAdminDb } from "@/server/firebase-admin";
import { Order } from "@/types";

const COLLECTION_NAME = "orders";

export async function getOrderByIdServer(orderId: string) {
  const snapshot = await getAdminDb().collection(COLLECTION_NAME).doc(orderId).get();

  if (!snapshot.exists) {
    return null;
  }

  return mapOrderRecord(snapshot.id, snapshot.data() as Partial<Order>);
}

export async function listOrdersServer() {
  const snapshot = await getAdminDb()
    .collection(COLLECTION_NAME)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((entry) => mapOrderRecord(entry.id, entry.data() as Partial<Order>));
}

export async function listOrdersByUserServer(userId: string) {
  const snapshot = await getAdminDb()
    .collection(COLLECTION_NAME)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((entry) => mapOrderRecord(entry.id, entry.data() as Partial<Order>));
}

export async function updateOrderServer(orderId: string, patch: Record<string, unknown>) {
  await getAdminDb().collection(COLLECTION_NAME).doc(orderId).set(
    {
      ...patch,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
