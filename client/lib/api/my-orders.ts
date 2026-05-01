import { getApiBaseUrl } from "../api-base";
import type { ApiResponse } from "../../types/auth";
import type { SpringPage } from "../../types/customer-service";
import type { CheckoutConfirmResult } from "./checkout";

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

export type MyOrderSummary = {
  shopOrderId: number;
  merchantOrderId: string;
  totalAmount: number;
  paidAt: string;
  issuedCouponCount: number;
};

export async function fetchMyOrders(
  accessToken: string,
  page = 0,
  size = 50,
): Promise<SpringPage<MyOrderSummary>> {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  const res = await fetch(`${getApiBaseUrl()}/api/my/orders?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  return readEnvelope<SpringPage<MyOrderSummary>>(res);
}

export async function fetchMyOrderDetail(
  accessToken: string,
  shopOrderId: number,
): Promise<CheckoutConfirmResult> {
  const res = await fetch(`${getApiBaseUrl()}/api/my/orders/${shopOrderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  return readEnvelope<CheckoutConfirmResult>(res);
}
