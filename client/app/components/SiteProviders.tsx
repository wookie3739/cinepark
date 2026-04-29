"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../../context/AuthContext";
import { CartProvider } from "../../context/CartContext";

export function SiteProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
