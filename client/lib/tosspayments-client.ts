import { ANONYMOUS } from "@tosspayments/payment-widget-sdk";

/**
 * 토스페이먼츠 결제위젯 — 브라우저용 클라이언트 키만.
 * `test_sk_` 시크릿 키는 승인 검증용이므로 반드시 서버에서만 사용하세요.
 */
export const TOSS_PAYMENTS_CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

function readJwtSub(jwt: string): string | null {
  try {
    const seg = jwt.split(".")[1];
    if (!seg) return null;
    const b64 = seg.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const json = atob(b64 + pad);
    const payload = JSON.parse(json) as Record<string, unknown>;
    const sub = payload.sub;
    if (typeof sub === "string" && sub.trim()) return sub.trim();
    if (typeof sub === "number" && Number.isFinite(sub)) return String(sub);
    return null;
  } catch {
    return null;
  }
}

/** 백엔드 `CheckoutPrepareResponse.customerKey`(`user_{userId}`)와 동일하게 맞추기 위해 JWT `sub` 사용 */
export function tossWidgetCustomerKey(accessToken: string | null | undefined): string | typeof ANONYMOUS {
  const t = accessToken?.trim();
  if (!t) return ANONYMOUS;
  const sub = readJwtSub(t);
  if (!sub) return ANONYMOUS;
  return `user_${sub}`;
}
