import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { demoProducts } from "@/data/demo-products";
import { mapProductRecord } from "@/lib/serializers/product";
import { db } from "@/lib/firebase/config";
import { Product, ProductInput } from "@/types";

const COLLECTION_NAME = "products";

export async function getProducts() {
  const database = db;

  if (!database) {
    return demoProducts;
  }

  try {
    const snapshot = await getDocs(
      query(collection(database, COLLECTION_NAME), orderBy("createdAt", "desc")),
    );

    return snapshot.docs.map((entry) => mapProductRecord(entry.id, entry.data() as Partial<Product>));
  } catch (error) {
    console.error("Unable to load products from Firestore", error);
    throw new Error("No se pudo cargar el catalogo real desde Firestore.");
  }
}

export async function getFeaturedProducts() {
  const products = await getProducts();
  return products.filter((product) => product.featured).slice(0, 4);
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductById(productId: string) {
  const database = db;

  if (!database) {
    return demoProducts.find((product) => product.id === productId) ?? null;
  }

  const snapshot = await getDoc(doc(database, COLLECTION_NAME, productId));
  if (!snapshot.exists()) {
    return null;
  }

  return mapProductRecord(snapshot.id, snapshot.data() as Partial<Product>);
}

export async function upsertProduct(product: ProductInput) {
  const database = db;

  if (!database) {
    throw new Error("Firebase no esta configurado. Carga las variables de entorno.");
  }

  if (product.id) {
    const { id, ...data } = product;
    await updateDoc(doc(database, COLLECTION_NAME, id), {
      ...data,
      reservedStock: data.reservedStock ?? 0,
      trackInventory: data.trackInventory ?? true,
      isActive: data.isActive ?? true,
      updatedAt: serverTimestamp(),
    });

    return id;
  }

  const productRef = await addDoc(collection(database, COLLECTION_NAME), {
    ...product,
    reservedStock: product.reservedStock ?? 0,
    trackInventory: product.trackInventory ?? true,
    isActive: product.isActive ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return productRef.id;
}

export async function removeProduct(productId: string) {
  const database = db;

  if (!database) {
    throw new Error("Firebase no esta configurado. Carga las variables de entorno.");
  }

  await deleteDoc(doc(database, COLLECTION_NAME, productId));
}

export async function seedProducts() {
  const database = db;

  if (!database) {
    throw new Error("Firebase no esta configurado. Carga las variables de entorno.");
  }

  const existing = await getDocs(collection(database, COLLECTION_NAME));
  if (!existing.empty) {
    return { created: 0, skipped: existing.size };
  }

  const createdIds = await Promise.all(
    demoProducts.map(async (product) => {
      await setDoc(doc(database, COLLECTION_NAME, product.id), {
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        category: product.category,
        size: product.size,
        stock: product.stock,
        reservedStock: product.reservedStock,
        images: product.images,
        featured: product.featured,
        technicalSpecs: product.technicalSpecs,
        trackInventory: product.trackInventory,
        isActive: product.isActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return product.id;
    }),
  );

  return {
    created: createdIds.length,
    skipped: 0,
  };
}
