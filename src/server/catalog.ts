import "server-only";

import { demoProducts } from "@/data/demo-products";
import { listProductsServer } from "@/repositories/server-products-repository";
import { isFirebaseAdminConfigured } from "@/server/env";
import { logError } from "@/server/logger";
import { CatalogSortOption, ProductCategory } from "@/types";

export async function listStorefrontProducts() {
  if (!isFirebaseAdminConfigured()) {
    return demoProducts.filter((product) => product.isActive);
  }

  try {
    const products = await listProductsServer();
    return products.filter((product) => product.isActive);
  } catch (error) {
    logError("catalog.storefront.load_failed", {
      message: error instanceof Error ? error.message : "Unknown catalog error",
    });
    return [];
  }
}

export async function getStorefrontProductBySlug(slug: string) {
  const products = await listStorefrontProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getStorefrontCatalogPage(input: {
  query?: string;
  category?: ProductCategory | "all";
  sort?: CatalogSortOption;
  page?: number;
  pageSize?: number;
}) {
  const products = await listStorefrontProducts();
  const normalizedQuery = input.query?.trim().toLowerCase() ?? "";
  const category: ProductCategory | "all" =
    input.category && input.category !== "all" ? input.category : "all";
  const sort = input.sort ?? "featured";
  const pageSize = input.pageSize ?? 6;

  const filteredProducts = products.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const matchesSearch =
      normalizedQuery.length === 0 ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.shortDescription.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });

  const sortedProducts = filteredProducts.slice().sort((left, right) => {
    switch (sort) {
      case "price_asc":
        return left.price - right.price;
      case "price_desc":
        return right.price - left.price;
      case "name_asc":
        return left.name.localeCompare(right.name, "es");
      case "name_desc":
        return right.name.localeCompare(left.name, "es");
      case "featured":
      default:
        return Number(right.featured) - Number(left.featured) || right.price - left.price;
    }
  });

  const totalItems = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(input.page ?? 1, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  const items = sortedProducts.slice(start, start + pageSize);

  return {
    items,
    totalItems,
    totalPages,
    currentPage,
    query: input.query ?? "",
    category,
    sort,
    pageSize,
  };
}
