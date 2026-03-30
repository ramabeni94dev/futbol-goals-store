import "server-only";

import { demoProducts } from "@/data/demo-products";
import { listProductsServer } from "@/repositories/server-products-repository";
import { isFirebaseAdminConfigured } from "@/server/env";

export async function listStorefrontProducts() {
  if (!isFirebaseAdminConfigured()) {
    return demoProducts.filter((product) => product.isActive);
  }

  try {
    const products = await listProductsServer();
    return products.length ? products.filter((product) => product.isActive) : demoProducts;
  } catch {
    return demoProducts.filter((product) => product.isActive);
  }
}

export async function getStorefrontProductBySlug(slug: string) {
  const products = await listStorefrontProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
