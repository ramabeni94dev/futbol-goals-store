import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { mapProductRecord } from "@/lib/serializers/product";
import { getAdminDb } from "@/server/firebase-admin";
import { Product, ProductInput } from "@/types";

const COLLECTION_NAME = "products";

export async function listProductsServer() {
  const snapshot = await getAdminDb()
    .collection(COLLECTION_NAME)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((entry) =>
    mapProductRecord(entry.id, entry.data() as Partial<Product>),
  );
}

export async function getProductByIdServer(productId: string) {
  const snapshot = await getAdminDb().collection(COLLECTION_NAME).doc(productId).get();

  if (!snapshot.exists) {
    return null;
  }

  return mapProductRecord(snapshot.id, snapshot.data() as Partial<Product>);
}

export async function getProductBySlugServer(slug: string) {
  const snapshot = await getAdminDb()
    .collection(COLLECTION_NAME)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const entry = snapshot.docs[0];
  return mapProductRecord(entry.id, entry.data() as Partial<Product>);
}

export async function upsertProductServer(product: ProductInput) {
  const database = getAdminDb();

  if (product.id) {
    const { id, ...data } = product;
    await database.collection(COLLECTION_NAME).doc(id).set(
      {
        ...data,
        reservedStock: data.reservedStock ?? 0,
        trackInventory: data.trackInventory ?? true,
        isActive: data.isActive ?? true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return id;
  }

  const document = await database.collection(COLLECTION_NAME).add({
    ...product,
    reservedStock: product.reservedStock ?? 0,
    trackInventory: product.trackInventory ?? true,
    isActive: product.isActive ?? true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return document.id;
}
