import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import { normalizeDate } from "@/lib/utils";
import { Order, OrderInput } from "@/types";

const COLLECTION_NAME = "orders";

function mapOrder(id: string, payload: Partial<Order> & { createdAt?: unknown }): Order {
  return {
    id,
    userId: payload.userId ?? "",
    customerName: payload.customerName ?? "",
    customerEmail: payload.customerEmail ?? "",
    items: payload.items ?? [],
    total: Number(payload.total ?? 0),
    status: payload.status ?? "pending",
    shippingAddress: payload.shippingAddress ?? {
      street: "",
      city: "",
      province: "",
      postalCode: "",
    },
    createdAt: normalizeDate(payload.createdAt),
  };
}

export async function createOrder(order: OrderInput) {
  if (!db) {
    throw new Error("Firebase no esta configurado. Carga las variables de entorno.");
  }

  const orderRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...order,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return orderRef.id;
}

export async function getOrdersByUser(userId: string) {
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ),
  );

  return snapshot.docs.map((entry) => mapOrder(entry.id, entry.data() as Partial<Order>));
}

export async function getAllOrders() {
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc")),
  );

  return snapshot.docs.map((entry) => mapOrder(entry.id, entry.data() as Partial<Order>));
}
