import { getApiBaseUrl } from "../api-base";
import type {
  AdminCouponProductRow,
  CouponCategory,
  CouponCategorySavePayload,
  CouponCodeAdminRow,
  CouponCodeBulkPayload,
  CouponProductDetail,
  CouponProductSavePayload,
} from "../../types/catalog";
import type { SpringPage } from "../../types/customer-service";
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

async function readEnvelopeVoid(res: Response): Promise<void> {
  const body = (await parseJsonSafe(res)) as ApiResponse<unknown> | null;
  if (!body?.success) {
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
}

function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

/** --- 카테고리 --- */
export async function adminFetchCategories(accessToken: string): Promise<CouponCategory[]> {
  const res = await fetch(apiUrl("/api/admin/categories"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readEnvelope<CouponCategory[]>(res);
}

export async function adminCreateCategory(
  accessToken: string,
  payload: CouponCategorySavePayload,
): Promise<CouponCategory> {
  const res = await fetch(apiUrl("/api/admin/categories"), {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return readEnvelope<CouponCategory>(res);
}

export async function adminUpdateCategory(
  accessToken: string,
  id: number,
  payload: CouponCategorySavePayload,
): Promise<CouponCategory> {
  const res = await fetch(apiUrl(`/api/admin/categories/${id}`), {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return readEnvelope<CouponCategory>(res);
}

export async function adminDeleteCategory(accessToken: string, id: number): Promise<void> {
  const res = await fetch(apiUrl(`/api/admin/categories/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await readEnvelopeVoid(res);
}

/** --- 상품 --- */
export async function adminFetchProductPage(
  accessToken: string,
  page = 0,
  size = 50,
): Promise<SpringPage<AdminCouponProductRow>> {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  const res = await fetch(apiUrl(`/api/admin/products?${qs.toString()}`), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readEnvelope<SpringPage<AdminCouponProductRow>>(res);
}

export async function adminFetchProductDetail(accessToken: string, id: number): Promise<CouponProductDetail> {
  const res = await fetch(apiUrl(`/api/admin/products/${id}`), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readEnvelope<CouponProductDetail>(res);
}

export async function adminCreateProduct(
  accessToken: string,
  payload: CouponProductSavePayload,
): Promise<CouponProductDetail> {
  const res = await fetch(apiUrl("/api/admin/products"), {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return readEnvelope<CouponProductDetail>(res);
}

export async function adminUpdateProduct(
  accessToken: string,
  id: number,
  payload: CouponProductSavePayload,
): Promise<CouponProductDetail> {
  const res = await fetch(apiUrl(`/api/admin/products/${id}`), {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return readEnvelope<CouponProductDetail>(res);
}

export async function adminDeleteProduct(accessToken: string, id: number): Promise<void> {
  const res = await fetch(apiUrl(`/api/admin/products/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await readEnvelopeVoid(res);
}

export async function adminAppendCouponCodes(
  accessToken: string,
  productId: number,
  payload: CouponCodeBulkPayload,
): Promise<{ added: number }> {
  const res = await fetch(apiUrl(`/api/admin/products/${productId}/coupon-codes`), {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return readEnvelope<{ added: number }>(res);
}

export type BulkCouponSheetRowPayload = { productId: number; credential: string };

export async function adminBulkAppendCouponRows(
  accessToken: string,
  rows: BulkCouponSheetRowPayload[],
): Promise<{ added: number }> {
  const res = await fetch(apiUrl("/api/admin/products/bulk-coupon-rows"), {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ rows }),
  });
  return readEnvelope<{ added: number }>(res);
}

export async function adminFetchProductCouponCodes(
  accessToken: string,
  productId: number,
  page = 0,
  size = 25,
): Promise<SpringPage<CouponCodeAdminRow>> {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  const res = await fetch(apiUrl(`/api/admin/products/${productId}/coupon-codes?${qs.toString()}`), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readEnvelope<SpringPage<CouponCodeAdminRow>>(res);
}
