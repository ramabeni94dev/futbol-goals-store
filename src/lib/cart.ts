import { getAvailableStock } from "@/lib/inventory";
import { CartItem, Product } from "@/types";

export interface CartMutationResult {
  ok: boolean;
  quantity: number;
  availableStock: number;
  reason?: "out_of_stock" | "quantity_limit";
}

function buildCartMutationResult(
  product: Product,
  quantity: number,
  reason?: CartMutationResult["reason"],
): CartMutationResult {
  return {
    ok: !reason,
    quantity,
    availableStock: getAvailableStock(product),
    reason,
  };
}

export function addCartItem(items: CartItem[], product: Product, quantity = 1) {
  const existingItem = items.find((item) => item.product.id === product.id);
  const availableStock = getAvailableStock(product);

  if (product.trackInventory && availableStock <= 0) {
    return {
      items,
      result: buildCartMutationResult(product, existingItem?.quantity ?? 0, "out_of_stock"),
    };
  }

  if (existingItem) {
    const nextQuantity = existingItem.quantity + quantity;

    if (product.trackInventory && nextQuantity > availableStock) {
      return {
        items: items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: availableStock } : item,
        ),
        result: buildCartMutationResult(product, availableStock, "quantity_limit"),
      };
    }

    return {
      items: items.map((item) =>
        item.product.id === product.id ? { ...item, quantity: nextQuantity } : item,
      ),
      result: buildCartMutationResult(product, nextQuantity),
    };
  }

  const nextQuantity =
    product.trackInventory && quantity > availableStock ? availableStock : quantity;

  return {
    items: [...items, { product, quantity: nextQuantity }],
    result:
      product.trackInventory && nextQuantity < quantity
        ? buildCartMutationResult(product, nextQuantity, "quantity_limit")
        : buildCartMutationResult(product, nextQuantity),
  };
}

export function updateCartItemQuantity(items: CartItem[], productId: string, quantity: number) {
  const currentItem = items.find((item) => item.product.id === productId);

  if (!currentItem) {
    return {
      items,
      result: {
        ok: false,
        quantity: 0,
        availableStock: 0,
        reason: "out_of_stock" as const,
      },
    };
  }

  if (quantity <= 0) {
    return {
      items: items.filter((item) => item.product.id !== productId),
      result: buildCartMutationResult(currentItem.product, 0),
    };
  }

  const availableStock = getAvailableStock(currentItem.product);

  if (currentItem.product.trackInventory && quantity > availableStock) {
    return {
      items: items.map((item) =>
        item.product.id === productId ? { ...item, quantity: availableStock } : item,
      ),
      result: buildCartMutationResult(
        currentItem.product,
        availableStock,
        "quantity_limit",
      ),
    };
  }

  return {
    items: items.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item,
    ),
    result: buildCartMutationResult(currentItem.product, quantity),
  };
}

export function calculateCartTotals(items: CartItem[]) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return {
    itemCount,
    subtotal,
    total: subtotal,
  };
}
