"use client";

export const CHECKOUT_SESSION_KEY = "cinepark_checkout_v1";

export type CheckoutLine = {
  productCode: string;
  quantity: number;
};

export function writeCheckoutSession(lines: CheckoutLine[]) {
  sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(lines));
}

export function readCheckoutSession(): CheckoutLine[] | null {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (item): item is CheckoutLine =>
        typeof item === "object" &&
        item !== null &&
        "productCode" in item &&
        "quantity" in item &&
        typeof (item as CheckoutLine).productCode === "string" &&
        typeof (item as CheckoutLine).quantity === "number",
    );
  } catch {
    return null;
  }
}
