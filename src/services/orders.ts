import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { getProductById } from "@/services/products";
import { mapOrderRecord } from "@/lib/serializers/order";
import { db } from "@/lib/firebase/config";
import { CheckoutRequest, Order, ShippingMethod } from "@/types";

const COLLECTION_NAME = "orders";

export async function createOrder(
  order: CheckoutRequest & { userId: string; shippingMethod?: ShippingMethod },
) {
  const database = db;

  if (!database) {
    throw new Error("Firebase no esta configurado. Carga las variables de entorno.");
  }

  const productSnapshots = await Promise.all(
    order.items.map(async (item) => {
      const product = await getProductById(item.productId);

      if (!product) {
        throw new Error("Uno de los productos del carrito ya no esta disponible.");
      }

      return {
        product,
        quantity: item.quantity,
      };
    }),
  );

  const subtotal = productSnapshots.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shippingCost = 0;
  const tax = 0;
  const discount = 0;
  const total = subtotal + shippingCost + tax - discount;

  const orderRef = await addDoc(collection(database, COLLECTION_NAME), {
    userId: order.userId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: productSnapshots.map(({ product, quantity }) => ({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
      sku: product.sku ?? null,
    })),
    currency: "ARS",
    subtotal,
    shippingCost,
    tax,
    discount,
    total,
    shippingMethod: order.shippingMethod ?? "pickup",
    shippingAddress: {
      street: order.street,
      city: order.city,
      province: order.province,
      postalCode: order.postalCode,
      notes: order.notes,
    },
    couponCode: order.couponCode ?? null,
    status: "pending",
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
    paymentMethod: "manual",
    paymentProvider: "manual",
    paymentLogs: [],
    webhookEvents: [],
    inventoryReservation: null,
    adminNotes: [],
    statusHistory: [
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        actorRole: "customer",
        actorId: order.userId,
        actorName: order.customerName,
        message: "Orden creada desde el checkout cliente legacy.",
        status: "pending",
        paymentStatus: "pending",
        fulfillmentStatus: "unfulfilled",
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    paidAt: null,
    shippedAt: null,
    deliveredAt: null,
    cancelledAt: null,
    refundedAt: null,
  });

  return orderRef.id;
}

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
