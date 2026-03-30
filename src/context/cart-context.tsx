"use client";

import { createContext, ReactNode, useSyncExternalStore } from "react";

import { CartItem, Product } from "@/types";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal;

  function addItem(product: Product, quantity = 1) {
    const currentItems = readCartSnapshot();
    const existingItem = currentItems.find((item) => item.product.id === product.id);

    if (existingItem) {
      writeCartSnapshot(
        currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      );
      return;
    }

    writeCartSnapshot([...currentItems, { product, quantity }]);
  }

  function removeItem(productId: string) {
    writeCartSnapshot(readCartSnapshot().filter((item) => item.product.id !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    writeCartSnapshot(
      readCartSnapshot().map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
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
