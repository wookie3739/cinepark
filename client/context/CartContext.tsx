"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import * as cartApi from "../lib/api/cart";
import {
  fetchCouponProductSegment,
  fetchCouponProductsBatch,
} from "../lib/api/catalog";
import type { CartView, CouponProductDetail } from "../types/catalog";

const STORAGE_CART_V1 = "cinepark_cart_v1";
const STORAGE_CART_V2 = "cinepark_cart_v2";
const STORAGE_WISH = "cinepark_wishlist_v1";

export type CartLine = {
  productCode: string;
  quantity: number;
};

type CartApi = {
  hydrated: boolean;
  guestLines: CartLine[];
  serverCart: CartView | null;
  guestProducts: Record<string, CouponProductDetail | undefined>;
  wishlist: string[];
  addToCart: (productCode: string, quantity: number) => Promise<void>;
  setLineQuantity: (productCode: string, quantity: number) => Promise<void>;
  removeFromCart: (productCode: string) => Promise<void>;
  /** 로그인 상태에서 서버 장바구니만 다시 불러옵니다(결제 완료 후 등). */
  refreshServerCart: () => Promise<void>;
  addToWishlist: (productCode: string) => boolean;
  removeFromWishlist: (productCode: string) => void;
  cartItemCount: number;
  isInWishlist: (productCode: string) => boolean;
  cart: CartLine[];
};

const CartContext = createContext<CartApi | null>(null);

function mergeDupes(lines: CartLine[]): CartLine[] {
  const m = new Map<string, number>();
  for (const l of lines) {
    m.set(
      l.productCode,
      Math.min(99, (m.get(l.productCode) ?? 0) + l.quantity),
    );
  }
  return [...m.entries()].map(([productCode, quantity]) => ({
    productCode,
    quantity,
  }));
}

async function migrateLinesToProductCodes(
  lines: CartLine[],
): Promise<CartLine[]> {
  const out: CartLine[] = [];
  for (const l of lines) {
    if (/^\d{12}$/.test(l.productCode)) {
      out.push(l);
      continue;
    }
    try {
      const d = await fetchCouponProductSegment(l.productCode);
      out.push({ productCode: d.productCode, quantity: l.quantity });
    } catch {
      /* drop invalid */
    }
  }
  return mergeDupes(out);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { accessToken, isReady } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [guestLines, setGuestLines] = useState<CartLine[]>([]);
  const [serverCart, setServerCart] = useState<CartView | null>(null);
  const [guestProducts, setGuestProducts] = useState<
    Record<string, CouponProductDetail | undefined>
  >({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const loginSyncRef = useRef(false);
  const guestLinesRef = useRef(guestLines);
  guestLinesRef.current = guestLines;

  useEffect(() => {
    try {
      const w = localStorage.getItem(STORAGE_WISH);
      if (w) setWishlist(JSON.parse(w) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_WISH, JSON.stringify(wishlist));
    } catch {
      /* ignore */
    }
  }, [wishlist, hydrated]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rawV2 = localStorage.getItem(STORAGE_CART_V2);
        if (rawV2) {
          const parsed = JSON.parse(rawV2) as CartLine[];
          if (Array.isArray(parsed)) {
            const migrated = await migrateLinesToProductCodes(parsed);
            if (!cancelled) {
              setGuestLines(migrated);
              localStorage.setItem(STORAGE_CART_V2, JSON.stringify(migrated));
            }
            return;
          }
        }
        const rawV1 = localStorage.getItem(STORAGE_CART_V1);
        if (rawV1) {
          const parsed = JSON.parse(rawV1) as {
            productId: string;
            quantity: number;
          }[];
          if (Array.isArray(parsed)) {
            const asV2: CartLine[] = parsed.map((x) => ({
              productCode: x.productId,
              quantity: x.quantity,
            }));
            const migrated = await migrateLinesToProductCodes(asV2);
            if (!cancelled) {
              setGuestLines(migrated);
              localStorage.setItem(STORAGE_CART_V2, JSON.stringify(migrated));
              localStorage.removeItem(STORAGE_CART_V1);
            }
            return;
          }
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || accessToken) return;
    try {
      localStorage.setItem(STORAGE_CART_V2, JSON.stringify(guestLines));
    } catch {
      /* ignore */
    }
  }, [guestLines, hydrated, accessToken]);

  useEffect(() => {
    if (!hydrated || accessToken || guestLines.length === 0) {
      if (!accessToken || guestLines.length === 0) setGuestProducts({});
      return;
    }
    let cancelled = false;
    const codes = guestLines.map((l) => l.productCode);
    fetchCouponProductsBatch(codes)
      .then((list) => {
        if (cancelled) return;
        const map: Record<string, CouponProductDetail> = {};
        for (const p of list) {
          map[p.productCode] = p;
        }
        setGuestProducts(map);
      })
      .catch(() => {
        if (!cancelled) setGuestProducts({});
      });
    return () => {
      cancelled = true;
    };
  }, [guestLines, hydrated, accessToken]);

  useEffect(() => {
    if (!isReady || !hydrated) return;

    if (!accessToken) {
      setServerCart(null);
      loginSyncRef.current = false;
      return;
    }

    if (loginSyncRef.current) return;
    loginSyncRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const snap = [...guestLinesRef.current];
        if (snap.length > 0) {
          let view = await cartApi.getCart();
          for (const g of snap) {
            const cur = view.lines.find((x) => x.productCode === g.productCode);
            const nextQty = Math.min(99, (cur?.quantity ?? 0) + g.quantity);
            view = await cartApi.putCartItem(g.productCode, nextQty);
          }
          try {
            localStorage.removeItem(STORAGE_CART_V2);
          } catch {
            /* ignore */
          }
          if (!cancelled) {
            setGuestLines([]);
            setServerCart(view);
          }
        } else {
          const view = await cartApi.getCart();
          if (!cancelled) setServerCart(view);
        }
      } catch {
        if (!cancelled) setServerCart(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady, hydrated, accessToken]);

  const addToCart = useCallback(
    async (productCode: string, quantity: number) => {
      if (quantity < 1) return;
      const trimmed = productCode.trim();
      if (!accessToken) {
        setGuestLines((prev) => {
          const idx = prev.findIndex((l) => l.productCode === trimmed);
          if (idx === -1)
            return [
              ...prev,
              { productCode: trimmed, quantity: Math.min(99, quantity) },
            ];
          const n = [...prev];
          n[idx] = {
            productCode: trimmed,
            quantity: Math.min(99, n[idx].quantity + quantity),
          };
          return n;
        });
        return;
      }
      const view = await cartApi.getCart();
      const existing = view.lines.find((x) => x.productCode === trimmed);
      const nextQty = Math.min(99, (existing?.quantity ?? 0) + quantity);
      const v = await cartApi.putCartItem(trimmed, nextQty);
      setServerCart(v);
    },
    [accessToken],
  );

  const setLineQuantity = useCallback(
    async (productCode: string, quantity: number) => {
      const trimmed = productCode.trim();
      if (quantity < 1) {
        if (!accessToken) {
          setGuestLines((prev) =>
            prev.filter((l) => l.productCode !== trimmed),
          );
          return;
        }
        const v = await cartApi.deleteCartItem(trimmed);
        setServerCart(v);
        return;
      }
      const q = Math.min(99, quantity);
      if (!accessToken) {
        setGuestLines((prev) => {
          const idx = prev.findIndex((l) => l.productCode === trimmed);
          if (idx === -1)
            return [...prev, { productCode: trimmed, quantity: q }];
          const n = [...prev];
          n[idx] = { productCode: trimmed, quantity: q };
          return n;
        });
        return;
      }
      const v = await cartApi.putCartItem(trimmed, q);
      setServerCart(v);
    },
    [accessToken],
  );

  const removeFromCart = useCallback(
    async (productCode: string) => {
      const trimmed = productCode.trim();
      if (!accessToken) {
        setGuestLines((prev) => prev.filter((l) => l.productCode !== trimmed));
        return;
      }
      const v = await cartApi.deleteCartItem(trimmed);
      setServerCart(v);
    },
    [accessToken],
  );

  const addToWishlist = useCallback((productCode: string) => {
    const code = productCode.trim();
    let added = false;
    setWishlist((prev) => {
      if (prev.includes(code)) return prev;
      added = true;
      return [...prev, code];
    });
    return added;
  }, []);

  const removeFromWishlist = useCallback((productCode: string) => {
    const code = productCode.trim();
    setWishlist((prev) => prev.filter((id) => id !== code));
  }, []);

  const refreshServerCart = useCallback(async () => {
    if (!accessToken) return;
    try {
      const view = await cartApi.getCart();
      setServerCart(view);
    } catch {
      setServerCart(null);
    }
  }, [accessToken]);

  const cartItemCount = useMemo(() => {
    if (accessToken && serverCart) {
      return serverCart.lines.reduce((s, l) => s + l.quantity, 0);
    }
    return guestLines.reduce((s, l) => s + l.quantity, 0);
  }, [accessToken, serverCart, guestLines]);

  const isInWishlist = useCallback(
    (productCode: string) => wishlist.includes(productCode.trim()),
    [wishlist],
  );

  const cart: CartLine[] = useMemo(() => {
    if (accessToken && serverCart) {
      return serverCart.lines.map((l) => ({
        productCode: l.productCode,
        quantity: l.quantity,
      }));
    }
    return guestLines;
  }, [accessToken, serverCart, guestLines]);

  const value = useMemo(
    () => ({
      hydrated,
      guestLines,
      serverCart,
      guestProducts,
      wishlist,
      addToCart,
      setLineQuantity,
      removeFromCart,
      refreshServerCart,
      addToWishlist,
      removeFromWishlist,
      cartItemCount,
      isInWishlist,
      cart,
    }),
    [
      hydrated,
      guestLines,
      serverCart,
      guestProducts,
      wishlist,
      addToCart,
      setLineQuantity,
      removeFromCart,
      refreshServerCart,
      addToWishlist,
      removeFromWishlist,
      cartItemCount,
      isInWishlist,
      cart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
