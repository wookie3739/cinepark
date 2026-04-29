import { getApiBaseUrl } from "../api-base";
import type {
  CouponCategory,
  CouponProductDetail,
  CouponProductSummary,
  CouponProductUsageLink,
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

function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchCouponCategories(): Promise<CouponCategory[]> {
  const res = await fetch(apiUrl("/api/categories"), { cache: "no-store" });
  return readEnvelope<CouponCategory[]>(res);
}

export async function fetchCouponProductPage(
  page = 0,
  size = 20,
  categoryCode?: string,
): Promise<SpringPage<CouponProductSummary>> {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  if (categoryCode && categoryCode.length > 0) {
    qs.set("categoryCode", categoryCode);
  }
  const res = await fetch(apiUrl(`/api/products?${qs.toString()}`), { cache: "no-store" });
  return readEnvelope<SpringPage<CouponProductSummary>>(res);
}

/** productCode는 12자리 숫자 조회 구간(`/api/products/{productCode}`)과 충돌하지 않도록 백엔드에서 패턴 처리됨 */
export async function fetchCouponProductSegment(segment: string): Promise<CouponProductDetail> {
  const enc = encodeURIComponent(segment.trim());
  const res = await fetch(apiUrl(`/api/products/${enc}`), { cache: "no-store" });
  return readEnvelope<CouponProductDetail>(res);
}

export async function fetchCouponProductsBatch(productCodes: string[]): Promise<CouponProductDetail[]> {
  if (!productCodes.length) {
    return [];
  }
  const res = await fetch(apiUrl("/api/products/batch"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productCodes }),
  });
  return readEnvelope<CouponProductDetail[]>(res);
}

/** 판매 중·재고 있음 상품 전체(이름 순) — usageUrl 없을 수 있음 */
export async function fetchProductUsageLinks(): Promise<CouponProductUsageLink[]> {
  const res = await fetch(apiUrl("/api/products/usage-links"), { cache: "no-store" });
  return readEnvelope<CouponProductUsageLink[]>(res);
}
