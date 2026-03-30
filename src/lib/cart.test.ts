import { describe, expect, it } from "vitest";

import {
  addCartItem,
  calculateCartTotals,
  updateCartItemQuantity,
} from "@/lib/cart";
import { Product } from "@/types";

const product: Product = {
  id: "goal-1",
  name: "Arco de prueba",
  slug: "arco-de-prueba",
  description: "Descripcion extensa del arco de prueba",
  shortDescription: "Descripcion corta",
  price: 100000,
  category: "training",
  size: "2 x 1 m",
  stock: 4,
  reservedStock: 1,
  images: ["/test.jpg"],
  featured: false,
  technicalSpecs: [{ label: "Material", value: "Acero" }],
  trackInventory: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("cart helpers", () => {
  it("caps added quantity to available stock", () => {
    const nextState = addCartItem([], product, 10);

    expect(nextState.items[0]?.quantity).toBe(3);
    expect(nextState.result.reason).toBe("quantity_limit");
  });

  it("updates quantity and removes item when quantity reaches zero", () => {
    const added = addCartItem([], product, 2);
    const updated = updateCartItemQuantity(added.items, product.id, 0);

    expect(updated.items).toHaveLength(0);
    expect(updated.result.quantity).toBe(0);
  });

  it("calculates cart totals", () => {
    const first = addCartItem([], product, 2);
    const totals = calculateCartTotals(first.items);

    expect(totals.itemCount).toBe(2);
    expect(totals.subtotal).toBe(200000);
    expect(totals.total).toBe(200000);
  });
});
