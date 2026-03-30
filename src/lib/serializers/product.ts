import { normalizeDate } from "@/lib/utils";
import { Product } from "@/types";

export function mapProductRecord(
  id: string,
  payload: Partial<Product> & { createdAt?: unknown; updatedAt?: unknown },
): Product {
  return {
    id,
    name: payload.name ?? "",
    slug: payload.slug ?? "",
    description: payload.description ?? "",
    shortDescription: payload.shortDescription ?? "",
    price: Number(payload.price ?? 0),
    compareAtPrice:
      payload.compareAtPrice === undefined || payload.compareAtPrice === null
        ? null
        : Number(payload.compareAtPrice),
    category: payload.category ?? "training",
    size: payload.size ?? "",
    stock: Number(payload.stock ?? 0),
    reservedStock: Number(payload.reservedStock ?? 0),
    images: payload.images ?? [],
    featured: Boolean(payload.featured),
    technicalSpecs: payload.technicalSpecs ?? [],
    trackInventory: payload.trackInventory ?? true,
    isActive: payload.isActive ?? true,
    sku: payload.sku ?? null,
    createdAt: normalizeDate(payload.createdAt),
    updatedAt: normalizeDate(payload.updatedAt ?? payload.createdAt),
  };
}
