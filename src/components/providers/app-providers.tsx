"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/auth-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
