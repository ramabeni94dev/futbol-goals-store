"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster richColors position="top-right" />
      </CartProvider>
    </AuthProvider>
  );
}
