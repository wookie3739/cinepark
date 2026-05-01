"use client";

import Link from "next/link";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchCouponProductsBatch } from "../../../lib/api/catalog";
import { prepareCheckout } from "../../../lib/api/checkout";
import { readCheckoutSession, writeCheckoutSession } from "../../../lib/checkout-session";
import { TOSS_PAYMENTS_CLIENT_KEY, tossWidgetCustomerKey } from "../../../lib/tosspayments-client";
import type { CouponProductDetail } from "../../../types/catalog";
import { ProductPriceDisplay } from "../../components/ProductPriceDisplay";

type ResolvedLine = {
  productCode: string;
  quantity: number;
  name: string;
  unitPrice: number;
  originPrice: number;
  subtotal: number;
  mainImageUrl: string | null;
  categoryLabel: string;
};

type PaymentMethodsWidget = ReturnType<PaymentWidgetInstance["renderPaymentMethods"]>;

export default function CheckoutPage() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.accessToken ?? null;
  const tossCustomerKey = useMemo(() => tossWidgetCustomerKey(accessToken), [accessToken]);

  const [lines, setLines] = useState<ResolvedLine[]>([]);
  const [ready, setReady] = useState(false);
  const [failHint, setFailHint] = useState(false);
  const [widgetLoading, setWidgetLoading] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<PaymentMethodsWidget | null>(null);
  const lineKey = useMemo(
    () => lines.map((l) => `${l.productCode}:${l.quantity}`).join("|"),
    [lines],
  );

  const total = useMemo(() => lines.reduce((s, l) => s + l.subtotal, 0), [lines]);
  const orderSubtotal = total;
  const couponDiscount = 0;
  const pointsUsed = 0;
  const finalTotal = Math.max(0, orderSubtotal - couponDiscount - pointsUsed);
  const sessionReady = sessionStatus !== "loading";
  const payBlockedNoAuth = sessionReady && !accessToken;

  useEffect(() => {
    const raw = readCheckoutSession();
    if (!raw || raw.length === 0) {
      setLines([]);
      setReady(true);
      return;
    }
    const codes = [...new Set(raw.map((r) => r.productCode).filter(Boolean))];
    let cancelled = false;
    fetchCouponProductsBatch(codes)
      .then((products) => {
        if (cancelled) return;
        const byCode: Record<string, CouponProductDetail> = {};
        for (const p of products) {
          byCode[p.productCode] = p;
        }
        const resolved: ResolvedLine[] = [];
        for (const row of raw) {
          const p = byCode[row.productCode];
          if (!p || row.quantity < 1) continue;
          resolved.push({
            productCode: row.productCode,
            quantity: row.quantity,
            name: p.name,
            unitPrice: p.unitPrice,
            originPrice: p.originPrice,
            subtotal: p.unitPrice * row.quantity,
            mainImageUrl: p.mainImageUrl,
            categoryLabel: p.categoryLabel || p.categoryCode || "쿠폰",
          });
        }
        setLines(resolved);
        if (resolved.length > 0) {
          writeCheckoutSession(
            resolved.map((r) => ({ productCode: r.productCode, quantity: r.quantity })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setLines([]);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      setFailHint(q.get("fail") === "1");
    } catch {
      setFailHint(false);
    }
  }, []);

  // 결제위젯은 장바구니 구성(lineKey)이 바뀔 때만 다시 붙이고, 금액만 바뀌면 아래 updateAmount로 반영합니다.
  // cleanup에서 clearPaymentWidget을 호출하면 React Strict Mode와 SDK loadScript 캐시가 꼬여 UI가 비는 경우가 있습니다.
  useEffect(() => {
    if (!ready || lines.length === 0 || finalTotal < 1) {
      paymentWidgetRef.current = null;
      paymentMethodsWidgetRef.current = null;
      setWidgetReady(false);
      return;
    }
    if (!sessionReady || !accessToken) {
      paymentWidgetRef.current = null;
      paymentMethodsWidgetRef.current = null;
      setWidgetReady(false);
      setWidgetLoading(false);
      setWidgetError(null);
      return;
    }

    let cancelled = false;
    setWidgetLoading(true);
    setWidgetError(null);
    setWidgetReady(false);

    (async () => {
      try {
        const paymentWidget = await loadPaymentWidget(TOSS_PAYMENTS_CLIENT_KEY, tossCustomerKey);
        if (cancelled) return;
        paymentWidgetRef.current = paymentWidget;
        const pmw = paymentWidget.renderPaymentMethods(
          "#toss-payment-methods",
          { value: finalTotal, currency: "KRW" },
          { variantKey: "DEFAULT" },
        );
        paymentMethodsWidgetRef.current = pmw;
        paymentWidget.renderAgreement("#toss-agreement", { variantKey: "DEFAULT" });
        if (!cancelled) setWidgetReady(true);
      } catch (e) {
        if (!cancelled) {
          setWidgetError(e instanceof Error ? e.message : "결제 위젯을 불러오지 못했습니다.");
          setWidgetReady(false);
        }
      } finally {
        if (!cancelled) setWidgetLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      setWidgetReady(false);
      paymentWidgetRef.current = null;
      paymentMethodsWidgetRef.current = null;
    };
  }, [ready, lineKey, sessionReady, accessToken, tossCustomerKey, finalTotal]);

  useEffect(() => {
    if (finalTotal < 1) return;
    try {
      paymentMethodsWidgetRef.current?.updateAmount(finalTotal);
    } catch {
      /* 위젯 미준비 시 무시 */
    }
  }, [finalTotal]);

  const onPay = useCallback(async () => {
    setPayError(null);
    const widget = paymentWidgetRef.current;
    if (!widget || lines.length === 0 || finalTotal <= 0) {
      setPayError("결제 준비가 되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    if (!accessToken) {
      setPayError("로그인이 필요합니다.");
      return;
    }
    const origin = window.location.origin;
    const codes = [...new Set(lines.map((l) => l.productCode).filter(Boolean))];
    const failUrl = `${origin}/checkout?fail=1`;

    setPaying(true);
    try {
      const prepared = await prepareCheckout({
        lines: lines.map((l) => ({ productCode: l.productCode, quantity: l.quantity })),
      });
      const successUrl =
        codes.length > 0
          ? `${origin}/order/complete?codes=${encodeURIComponent(codes.join(","))}`
          : `${origin}/order/complete`;

      if (prepared.amount !== finalTotal) {
        try {
          paymentMethodsWidgetRef.current?.updateAmount(prepared.amount);
        } catch {
          /* 위젯 미동기화 시에도 서버 금액으로 결제 진행 */
        }
      }

      await widget.requestPayment({
        orderId: prepared.merchantOrderId,
        orderName: prepared.orderName,
        successUrl,
        failUrl,
      });
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "결제를 시작하지 못했습니다.");
    } finally {
      setPaying(false);
    }
  }, [lines, finalTotal, accessToken]);

  if (!ready) {
    return (
      <main className="page checkout-page checkout-page--order">
        <div className="container checkout-page-shell">
          <div className="checkout-skeleton panel" aria-busy="true" aria-label="주문 정보 불러오는 중">
            <div className="checkout-skeleton-line checkout-skeleton-line--short" />
            <div className="checkout-skeleton-line" />
            <div className="checkout-skeleton-line" />
            <div className="checkout-skeleton-line checkout-skeleton-line--medium" />
          </div>
        </div>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="page checkout-page checkout-page--order">
        <div className="container checkout-page-shell">
          <nav className="breadcrumb checkout-breadcrumb">
            <Link href="/">홈</Link>
            <span className="sep">/</span>
            <strong>주문·결제</strong>
          </nav>
          <section className="panel checkout-empty-panel">
            <div className="checkout-empty-visual" aria-hidden>
              CINE
            </div>
            <h1 className="checkout-empty-title">결제할 상품이 없습니다</h1>
            <p className="checkout-empty-lead muted">
              장바구니에서 주문하거나 상품 상세에서 바로 구매해 주세요.
            </p>
            <div className="checkout-empty-actions">
              <Link href="/cart" className="button">
                장바구니로
              </Link>
              <Link href="/" className="button secondary checkout-empty-secondary">
                쇼핑 계속
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="page checkout-page checkout-page--order">
      <div className="container checkout-page-shell">
        <nav className="breadcrumb checkout-breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>주문 및 결제</strong>
        </nav>

        <header className="checkout-hero checkout-hero--compact">
          <h1 className="checkout-title">주문 및 결제</h1>
          <p className="checkout-lead muted">
            주문 정보를 확인한 뒤 결제 수단을 고르고, 약관에 동의한 후 결제를 진행해 주세요.
          </p>
        </header>

        {failHint ? (
          <div className="checkout-alert checkout-alert--warn" role="alert">
            결제가 완료되지 않았거나 취소되었습니다. 아래에서 다시 시도해 주세요.
          </div>
        ) : null}

        <div className="checkout-layout">
          <div className="checkout-main">
            <section className="panel checkout-panel checkout-panel--order-items">
              <div className="checkout-panel-head">
                <h2>주문 상품 정보</h2>
                <span className="checkout-count-badge">{lines.length}종</span>
              </div>
              <ul className="checkout-order-lines">
                {lines.map((l) => (
                  <li key={l.productCode} className="checkout-order-line">
                    <div className="checkout-order-thumb">
                      {l.mainImageUrl ? (
                        <img src={l.mainImageUrl} alt="" className="product-thumb-cover" />
                      ) : (
                        <span className="checkout-order-thumb-ph" aria-hidden>
                          CP
                        </span>
                      )}
                    </div>
                    <div className="checkout-order-main">
                      <span className="checkout-order-tag">{l.categoryLabel}</span>
                      <p className="checkout-order-name">{l.name}</p>
                      <div className="checkout-order-meta">
                        <ProductPriceDisplay
                          layout="checkout"
                          unitPrice={l.unitPrice}
                          originPrice={l.originPrice}
                          quantity={l.quantity}
                        />
                      </div>
                    </div>
                    <div className="checkout-order-sum">
                      <strong>{l.subtotal.toLocaleString("ko-KR")}원</strong>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel checkout-panel checkout-panel--discount" aria-labelledby="checkout-discount-h">
              <div className="checkout-panel-head">
                <h2 id="checkout-discount-h">할인 수단</h2>
              </div>
              <p className="checkout-panel-note muted checkout-discount-note">
                쿠폰·포인트 할인은 서비스 준비 중입니다. 곧 연동될 예정입니다.
              </p>
              <div className="checkout-discount-grid">
                <div className="checkout-discount-field">
                  <label htmlFor="checkout-coupon-faux">쿠폰</label>
                  <div className="checkout-discount-row">
                    <select id="checkout-coupon-faux" className="checkout-faux-control" disabled>
                      <option>적용 가능한 쿠폰 준비 중</option>
                    </select>
                    <button type="button" className="button secondary checkout-discount-btn" disabled>
                      쿠폰 조회
                    </button>
                  </div>
                </div>
                <div className="checkout-discount-field">
                  <label htmlFor="checkout-points-faux">포인트</label>
                  <div className="checkout-discount-row">
                    <input
                      id="checkout-points-faux"
                      className="checkout-faux-control"
                      disabled
                      readOnly
                      value="0"
                    />
                    <button type="button" className="button secondary checkout-discount-btn" disabled>
                      모두 사용
                    </button>
                  </div>
                  <p className="checkout-discount-hint muted">보유 포인트: — (준비 중)</p>
                </div>
              </div>
            </section>

            <section className="panel checkout-panel checkout-panel--payment">
              <div className="checkout-panel-head">
                <h2>결제 수단 선택</h2>
              </div>
              <p className="checkout-panel-note muted">
                아래에서 결제 수단을 선택하세요. 토스페이먼츠 테스트 환경에서 결제하면 주문 완료 화면으로 이동합니다.
              </p>
              {payBlockedNoAuth ? (
                <div className="checkout-alert checkout-alert--warn" role="status">
                  결제는 로그인한 회원만 진행할 수 있습니다.{" "}
                  <Link href={`/login?callbackUrl=${encodeURIComponent("/checkout")}`}>로그인</Link>
                </div>
              ) : null}
              {widgetLoading ? (
                <div className="checkout-widget-loading muted" aria-live="polite">
                  <span className="checkout-spinner" aria-hidden />
                  결제 화면을 불러오는 중입니다…
                </div>
              ) : null}
              {widgetError ? (
                <div className="checkout-alert checkout-alert--error" role="alert">
                  {widgetError}
                </div>
              ) : null}
              <div className="checkout-widget-frame checkout-widget-frame--methods-only">
                <div id="toss-payment-methods" className="toss-widget-slot" />
              </div>
            </section>

            {payError ? (
              <div className="checkout-alert checkout-alert--error checkout-alert--inline" role="alert">
                {payError}
              </div>
            ) : null}
          </div>

          <aside className="checkout-aside">
            <div className="panel checkout-summary">
              <h2 className="checkout-summary-heading">결제 금액 요약</h2>
              <dl className="checkout-summary-breakdown">
                <div className="checkout-summary-row">
                  <dt>주문 금액</dt>
                  <dd>{orderSubtotal.toLocaleString("ko-KR")}원</dd>
                </div>
                <div className="checkout-summary-row checkout-summary-row--muted">
                  <dt>쿠폰 할인</dt>
                  <dd>
                    {couponDiscount > 0 ? "-" : ""}
                    {couponDiscount.toLocaleString("ko-KR")}원
                  </dd>
                </div>
                <div className="checkout-summary-row checkout-summary-row--muted">
                  <dt>포인트 사용</dt>
                  <dd>
                    {pointsUsed > 0 ? "-" : ""}
                    {pointsUsed.toLocaleString("ko-KR")}원
                  </dd>
                </div>
              </dl>
              <div className="checkout-summary-final">
                <span>최종 결제 금액</span>
                <strong>{finalTotal.toLocaleString("ko-KR")}원</strong>
              </div>
              <div className="checkout-widget-frame checkout-widget-frame--agreement-only">
                <div id="toss-agreement" className="toss-widget-slot toss-widget-slot--agreement" />
              </div>
              <button
                type="button"
                className="button checkout-pay-btn"
                disabled={
                  widgetLoading ||
                  !!widgetError ||
                  !widgetReady ||
                  paying ||
                  payBlockedNoAuth
                }
                onClick={() => void onPay()}
              >
                {paying ? "결제 준비 중…" : `${finalTotal.toLocaleString("ko-KR")}원 결제하기`}
              </button>
              <Link href="/cart" className="button secondary checkout-summary-back">
                이전 단계
              </Link>
              <div className="checkout-trust-box" role="note">
                <p className="checkout-trust-title">보안 결제 적용 중</p>
                <p className="checkout-trust muted">
                  256-bit SSL 암호화 및 토스페이먼츠를 통해 결제 정보가 안전하게 처리됩니다.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
