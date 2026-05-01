import { getBrowserAccessToken } from "../auth-browser-session";
import { getApiBaseUrl } from "../api-base";
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

export type CheckoutPrepareLineBody = { productCode: string; quantity: number };

export type CheckoutPrepareBody = {
  cartRevision?: string | null;
  lines?: CheckoutPrepareLineBody[] | null;
};

export type CheckoutPrepareResult = {
  merchantOrderId: string;
  amount: number;
  customerKey: string;
  expiresAt: string;
  orderName: string;
};

export type CheckoutConfirmLine = {
  productCode: string;
  productName: string;
  quantity: number;
  issuedCouponCodes: string[];
};

export type CheckoutConfirmResult = {
  shopOrderId: number;
  merchantOrderId: string;
  receiptUrl: string | null;
  lines: CheckoutConfirmLine[];
};

/**
 * 토스 `requestPayment` 직전에 호출 — 서버가 금액·재고·판매 상태를 검증하고 `merchantOrderId`를 발급한다.
 */
export async function prepareCheckout(body: CheckoutPrepareBody): Promise<CheckoutPrepareResult> {
  const accessToken = getBrowserAccessToken();
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }
  const payload: Record<string, unknown> = {};
  if (body.cartRevision != null && body.cartRevision !== "") {
    payload.cartRevision = body.cartRevision;
  }
  if (body.lines != null && body.lines.length > 0) {
    payload.lines = body.lines;
  }
  const res = await fetch(`${getApiBaseUrl()}/api/checkout/payments/prepare`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return readEnvelope<CheckoutPrepareResult>(res);
}

/**
 * 토스 성공 리다이렉트(`paymentKey`, `orderId`, `amount`) 직후 호출 — PG 승인·주문·쿠폰 발급·장바구니 비우기를 서버에서 처리한다.
 */
export async function confirmCheckout(body: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<CheckoutConfirmResult> {
  const accessToken = getBrowserAccessToken();
  if (!accessToken) {
    throw new Error("로그인이 필요합니다. 다시 로그인한 뒤 주문 내역에서 확인해 주세요.");
  }
  const res = await fetch(`${getApiBaseUrl()}/api/checkout/payments/confirm`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentKey: body.paymentKey,
      orderId: body.orderId,
      amount: body.amount,
    }),
  });
  return readEnvelope<CheckoutConfirmResult>(res);
}
