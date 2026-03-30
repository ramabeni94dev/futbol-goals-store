"use client";

import { createContext, ReactNode, useSyncExternalStore } from "react";

import { getAvailableStock } from "@/lib/inventory";
import { CartItem, Product } from "@/types";

interface CartMutationResult {
  ok: boolean;
  quantity: number;
  availableStock: number;
  reason?: "out_of_stock" | "quantity_limit";
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  addItem: (product: Product, quantity?: number) => CartMutationResult;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => CartMutationResult;
  clearCart: () => void;
}

const STORAGE_KEY = "futbol-goals-store-cart";
const listeners = new Set<() => void>();
const emptyCart: CartItem[] = [];
let cachedRawValue = "[]";
let cachedSnapshot: CartItem[] = emptyCart;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function readCartSnapshot() {
  if (typeof window === "undefined") {
    return emptyCart;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY) ?? "[]";

    if (rawValue === cachedRawValue) {
      return cachedSnapshot;
    }

    cachedRawValue = rawValue;
    cachedSnapshot = JSON.parse(rawValue) as CartItem[];
    return cachedSnapshot;
  } catch {
    cachedRawValue = "[]";
    cachedSnapshot = emptyCart;
    return emptyCart;
  }
}

function writeCartSnapshot(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  const serializedItems = JSON.stringify(items);
  cachedRawValue = serializedItems;
  cachedSnapshot = items;
  window.localStorage.setItem(STORAGE_KEY, serializedItems);
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (typeof window === "undefined") {
    return () => listeners.delete(listener);
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getServerSnapshot() {
  return emptyCart;
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

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, readCartSnapshot, getServerSnapshot);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal;

  function addItem(product: Product, quantity = 1) {
    const currentItems = readCartSnapshot();
    const existingItem = currentItems.find((item) => item.product.id === product.id);
    const availableStock = getAvailableStock(product);

    if (product.trackInventory && availableStock <= 0) {
      return buildCartMutationResult(product, existingItem?.quantity ?? 0, "out_of_stock");
    }

    if (existingItem) {
      const nextQuantity = existingItem.quantity + quantity;

      if (product.trackInventory && nextQuantity > availableStock) {
        writeCartSnapshot(
          currentItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: availableStock }
              : item,
          ),
        );

        return buildCartMutationResult(product, availableStock, "quantity_limit");
      }

      writeCartSnapshot(
        currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      );
      return buildCartMutationResult(product, nextQuantity);
    }

    const nextQuantity =
      product.trackInventory && quantity > availableStock ? availableStock : quantity;

    writeCartSnapshot([...currentItems, { product, quantity: nextQuantity }]);

    if (product.trackInventory && nextQuantity < quantity) {
      return buildCartMutationResult(product, nextQuantity, "quantity_limit");
    }

    return buildCartMutationResult(product, nextQuantity);
  }

  function removeItem(productId: string) {
    writeCartSnapshot(readCartSnapshot().filter((item) => item.product.id !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    const currentItem = readCartSnapshot().find((item) => item.product.id === productId);

    if (!currentItem) {
      return {
        ok: false,
        quantity: 0,
        availableStock: 0,
        reason: "out_of_stock" as const,
      };
    }

    if (quantity <= 0) {
      removeItem(productId);
      return buildCartMutationResult(currentItem.product, 0);
    }

    const availableStock = getAvailableStock(currentItem.product);

    if (currentItem.product.trackInventory && quantity > availableStock) {
      writeCartSnapshot(
        readCartSnapshot().map((item) =>
          item.product.id === productId ? { ...item, quantity: availableStock } : item,
        ),
      );

      return buildCartMutationResult(currentItem.product, availableStock, "quantity_limit");
    }

    writeCartSnapshot(
      readCartSnapshot().map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );

    return buildCartMutationResult(currentItem.product, quantity);
  }

  function clearCart() {
    writeCartSnapshot([]);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
