"use client";

import { createContext, ReactNode, useSyncExternalStore } from "react";

import {
  addCartItem,
  calculateCartTotals,
  CartMutationResult,
  updateCartItemQuantity,
} from "@/lib/cart";
import { CartItem, Product } from "@/types";

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

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, readCartSnapshot, getServerSnapshot);
  const { itemCount, subtotal, total } = calculateCartTotals(items);

  function addItem(product: Product, quantity = 1) {
    const nextState = addCartItem(readCartSnapshot(), product, quantity);
    writeCartSnapshot(nextState.items);
    return nextState.result;
  }

  function removeItem(productId: string) {
    writeCartSnapshot(readCartSnapshot().filter((item) => item.product.id !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    const nextState = updateCartItemQuantity(readCartSnapshot(), productId, quantity);
    writeCartSnapshot(nextState.items);
    return nextState.result;
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
