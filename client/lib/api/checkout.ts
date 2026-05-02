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

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number.parseInt(String(v), 10);
  if (!Number.isFinite(n)) return NaN;
  return n;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : v != null ? String(v) : fallback;
}

/** PG·DB `receiptUrl` / 레거시 `receipt_url` 모두 수용 */
export function parseCheckoutConfirmResponse(raw: unknown): CheckoutConfirmResult {
  const o = asRecord(raw);
  if (!o) {
    throw new Error("결제 확인 응답 형식이 올바르지 않습니다.");
  }
  const shopOrderId = num(o.shopOrderId ?? o.shop_order_id);
  if (!Number.isFinite(shopOrderId) || shopOrderId < 1) {
    throw new Error("결제 확인 응답에 주문 번호가 없습니다.");
  }
  const merchantOrderId = str(o.merchantOrderId ?? o.merchant_order_id).trim();
  const receiptRaw = o.receiptUrl ?? o.receipt_url;
  const receiptUrl =
    typeof receiptRaw === "string" && receiptRaw.trim() ? receiptRaw.trim() : null;
  const linesRaw = o.lines;
  if (!Array.isArray(linesRaw)) {
    throw new Error("결제 확인 응답에 주문 줄이 없습니다.");
  }
  const lines: CheckoutConfirmLine[] = linesRaw.map((row, i) => {
    const r = asRecord(row);
    if (!r) {
      throw new Error(`결제 확인 응답의 주문 줄 ${i + 1}이 올바르지 않습니다.`);
    }
    const productCode = str(r.productCode ?? r.product_code).trim();
    const productName = str(r.productName ?? r.product_name).trim();
    const quantity = num(r.quantity);
    const codesRaw = r.issuedCouponCodes ?? r.issued_coupon_codes;
    const issuedCouponCodes = Array.isArray(codesRaw)
      ? codesRaw.map((c) => (typeof c === "string" ? c : String(c ?? "")))
      : [];
    return { productCode, productName, quantity, issuedCouponCodes };
  });
  return { shopOrderId, merchantOrderId, receiptUrl, lines };
}

/** React Strict Mode 등으로 동시에 두 번 호출돼도 네트워크는 1회만 나가게 한다 */
const confirmCheckoutInflight = new Map<string, Promise<CheckoutConfirmResult>>();

function confirmCheckoutDedupeKey(body: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): string {
  return `${body.orderId}\0${body.paymentKey}\0${body.amount}`;
}

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
  const key = confirmCheckoutDedupeKey(body);
  const existing = confirmCheckoutInflight.get(key);
  if (existing) {
    return existing;
  }
  const done = (async (): Promise<CheckoutConfirmResult> => {
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
    return parseCheckoutConfirmResponse(await readEnvelope<unknown>(res));
  })();

  confirmCheckoutInflight.set(key, done);
  try {
    return await done;
  } finally {
    confirmCheckoutInflight.delete(key);
  }
}
