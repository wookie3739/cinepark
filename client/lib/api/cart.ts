import { getApiBaseUrl } from "../api-base";
import type { CartView } from "../../types/catalog";
import type { ApiResponse } from "../../types/auth";

async function parseJsonSafe(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function readEnvelope<T>(res: Response): Promise<T> {
  const body = (await parseJsonSafe(res)) as ApiResponse<T> | null;
  if (!body?.success) {
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
  return body.data as T;
}

function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function headersJson(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function getCart(accessToken: string): Promise<CartView> {
  const res = await fetch(apiUrl("/api/cart"), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readEnvelope<CartView>(res);
}

export async function putCartItem(
  accessToken: string,
  productCode: string,
  quantity: number,
): Promise<CartView> {
  const res = await fetch(apiUrl("/api/cart/items"), {
    method: "PUT",
    headers: headersJson(accessToken),
    body: JSON.stringify({ productCode, quantity }),
  });
  return readEnvelope<CartView>(res);
}

export async function deleteCartItem(accessToken: string, productCode: string): Promise<CartView> {
  const enc = encodeURIComponent(productCode.trim());
  const res = await fetch(apiUrl(`/api/cart/items/${enc}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readEnvelope<CartView>(res);
}

export async function clearCart(accessToken: string): Promise<void> {
  const res = await fetch(apiUrl("/api/cart"), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = (await parseJsonSafe(res)) as ApiResponse<unknown> | null;
  if (!body?.success) {
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
}
