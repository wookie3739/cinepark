import { getBrowserAccessToken } from "../auth-browser-session";
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

/** `sessionStorage` JWT — Next Auth 없음, `AuthContext` 로그인과 동일 소스 */
function bearerHeaders(): HeadersInit {
  const accessToken = getBrowserAccessToken();
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }
  return { Authorization: `Bearer ${accessToken}` };
}

function bearerHeadersJson(): HeadersInit {
  return {
    ...bearerHeaders(),
    "Content-Type": "application/json",
  };
}

export async function getCart(): Promise<CartView> {
  const res = await fetch(apiUrl("/api/cart"), {
    method: "GET",
    headers: bearerHeaders(),
  });
  return readEnvelope<CartView>(res);
}

export async function putCartItem(productCode: string, quantity: number): Promise<CartView> {
  const res = await fetch(apiUrl("/api/cart/items"), {
    method: "PUT",
    headers: bearerHeadersJson(),
    body: JSON.stringify({ productCode, quantity }),
  });
  return readEnvelope<CartView>(res);
}

export async function deleteCartItem(productCode: string): Promise<CartView> {
  const enc = encodeURIComponent(productCode.trim());
  const res = await fetch(apiUrl(`/api/cart/items/${enc}`), {
    method: "DELETE",
    headers: bearerHeaders(),
  });
  return readEnvelope<CartView>(res);
}

export async function clearCart(): Promise<void> {
  const res = await fetch(apiUrl("/api/cart"), {
    method: "DELETE",
    headers: bearerHeaders(),
  });
  const body = (await parseJsonSafe(res)) as ApiResponse<unknown> | null;
  if (!body?.success) {
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
}
