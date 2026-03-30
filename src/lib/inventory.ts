import { Product } from "@/types";

export function getAvailableStock(product: Pick<Product, "stock" | "reservedStock">) {
  return Math.max(product.stock - product.reservedStock, 0);
}

export function canReserveProductStock(
  product: Pick<Product, "stock" | "reservedStock" | "trackInventory">,
  quantity: number,
) {
  if (!product.trackInventory) {
    return true;
  }

  return getAvailableStock(product) >= quantity;
}
