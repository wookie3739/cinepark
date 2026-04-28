"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCouponProduct } from "../lib/coupon-products";

export type CartLine = {
  productId: string;
  quantity: number;
};

type CartApi = {
  cart: CartLine[];
  wishlist: string[];
  addToCart: (productId: string, quantity: number) => void;
  setLineQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  addToWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  cartItemCount: number;
  isInWishlist: (productId: string) => boolean;
};

const CartContext = createContext<CartApi | null>(null);

const STORAGE_CART = "cinepark_cart_v1";
const STORAGE_WISH = "cinepark_wishlist_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem(STORAGE_CART);
      const w = localStorage.getItem(STORAGE_WISH);
      if (c) setCart(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_CART, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_WISH, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback((productId: string, quantity: number) => {
    const p = getCouponProduct(productId);
    if (!p || quantity < 1) return;
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.productId === productId);
      if (idx === -1) return [...prev, { productId, quantity }];
      const next = [...prev];
      next[idx] = {
        productId,
        quantity: Math.min(99, next[idx].quantity + quantity),
      };
      return next;
    });
  }, []);

  const setLineQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((l) => l.productId !== productId));
      return;
    }
    const q = Math.min(99, quantity);
    const p = getCouponProduct(productId);
    if (!p) return;
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.productId === productId);
      if (idx === -1) return [...prev, { productId, quantity: q }];
      const next = [...prev];
      next[idx] = { productId, quantity: q };
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const addToWishlist = useCallback((productId: string) => {
    if (!getCouponProduct(productId)) return false;
    let added = false;
    setWishlist((prev) => {
      if (prev.includes(productId)) return prev;
      added = true;
      return [...prev, productId];
    });
    return added;
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
  }, []);

  const cartItemCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart],
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      addToCart,
      setLineQuantity,
      removeFromCart,
      addToWishlist,
      removeFromWishlist,
      cartItemCount,
      isInWishlist,
    }),
    [
      cart,
      wishlist,
      addToCart,
      setLineQuantity,
      removeFromCart,
      addToWishlist,
      removeFromWishlist,
      cartItemCount,
      isInWishlist,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
