"use client";

import Link from "next/link";
import { ANONYMOUS, loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchCouponProductsBatch } from "../../../lib/api/catalog";
import { readCheckoutSession, writeCheckoutSession } from "../../../lib/checkout-session";
import { TOSS_PAYMENTS_CLIENT_KEY } from "../../../lib/tosspayments-client";
import type { CouponProductDetail } from "../../../types/catalog";
import { ProductPriceDisplay } from "../../components/ProductPriceDisplay";

type ResolvedLine = {
  productCode: string;
  quantity: number;
  name: string;
  unitPrice: number;
  originPrice: number;
  subtotal: number;
};

type PaymentMethodsWidget = ReturnType<PaymentWidgetInstance["renderPaymentMethods"]>;

export default function CheckoutPage() {
  const [lines, setLines] = useState<ResolvedLine[]>([]);
  const [ready, setReady] = useState(false);
  const [failHint, setFailHint] = useState(false);
  const [widgetLoading, setWidgetLoading] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<PaymentMethodsWidget | null>(null);
  const lineKey = useMemo(
    () => lines.map((l) => `${l.productCode}:${l.quantity}`).join("|"),
    [lines],
  );

  const total = useMemo(() => lines.reduce((s, l) => s + l.subtotal, 0), [lines]);

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
    if (!ready || lines.length === 0 || total < 1) {
      paymentWidgetRef.current = null;
      paymentMethodsWidgetRef.current = null;
      setWidgetReady(false);
      return;
    }

    let cancelled = false;
    setWidgetLoading(true);
    setWidgetError(null);
    setWidgetReady(false);

    (async () => {
      try {
        const paymentWidget = await loadPaymentWidget(TOSS_PAYMENTS_CLIENT_KEY, ANONYMOUS);
        if (cancelled) return;
        paymentWidgetRef.current = paymentWidget;
        const pmw = paymentWidget.renderPaymentMethods(
          "#toss-payment-methods",
          { value: total, currency: "KRW" },
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
  }, [ready, lineKey]);

  useEffect(() => {
    if (total < 1) return;
    try {
      paymentMethodsWidgetRef.current?.updateAmount(total);
    } catch {
      /* 위젯 미준비 시 무시 */
    }
  }, [total]);

  const onPay = useCallback(async () => {
    setPayError(null);
    const widget = paymentWidgetRef.current;
    if (!widget || lines.length === 0 || total <= 0) {
      setPayError("결제 준비가 되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    const origin = window.location.origin;
    const codes = [...new Set(lines.map((l) => l.productCode).filter(Boolean))];
    const successQs = new URLSearchParams();
    if (codes.length > 0) successQs.set("codes", codes.join(","));
    const successUrl = `${origin}/order/complete?${successQs.toString()}`;
    const failUrl = `${origin}/checkout?fail=1`;
    const orderId = `cp_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    const orderName =
      lines.length === 1
        ? lines[0].name.slice(0, 80)
        : `CINEPARK 쿠폰 ${lines.length}건`;

    try {
      await widget.requestPayment({
        orderId,
        orderName,
        successUrl,
        failUrl,
      });
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "결제를 시작하지 못했습니다.");
    }
  }, [lines, total]);

  if (!ready) {
    return (
      <main className="page checkout-page">
        <div className="container narrow-page checkout-page-shell">
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
      <main className="page checkout-page">
        <div className="container narrow-page checkout-page-shell">
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
    <main className="page checkout-page">
      <div className="container narrow-page checkout-page-shell">
        <nav className="breadcrumb checkout-breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>주문·결제</strong>
        </nav>

        <header className="checkout-hero">
          <p className="checkout-eyebrow eng">CHECKOUT</p>
          <h1 className="checkout-title">주문 확인 및 결제</h1>
          <p className="checkout-lead muted">
            주문 내용을 확인한 뒤 결제 수단을 선택하고 결제를 진행해 주세요.
          </p>
        </header>

        {failHint ? (
          <div className="checkout-alert checkout-alert--warn" role="alert">
            결제가 완료되지 않았거나 취소되었습니다. 아래에서 다시 시도해 주세요.
          </div>
        ) : null}

        <div className="checkout-layout">
          <div className="checkout-main">
            <section className="panel checkout-panel">
              <div className="checkout-panel-head">
                <h2>주문 상품</h2>
                <span className="checkout-count-badge">{lines.length}종</span>
              </div>
              <ul className="checkout-lines">
                {lines.map((l) => (
                  <li key={l.productCode} className="checkout-line">
                    <div className="checkout-line-body">
                      <span className="product-brand">CINEPARK</span>
                      <p className="checkout-line-name">{l.name}</p>
                    </div>
                    <ProductPriceDisplay
                      layout="checkout"
                      unitPrice={l.unitPrice}
                      originPrice={l.originPrice}
                      quantity={l.quantity}
                    />
                    <strong className="checkout-line-sum">{l.subtotal.toLocaleString()}원</strong>
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel checkout-panel checkout-panel--payment">
              <div className="checkout-panel-head">
                <h2>결제 수단</h2>
              </div>
              <p className="checkout-panel-note muted">
                토스페이먼츠 결제위젯(테스트)입니다. 테스트 카드로 결제하면 주문 완료 화면으로 이동합니다.
              </p>
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
              <div className="checkout-widget-frame">
                <div id="toss-payment-methods" className="toss-widget-slot" />
                <div id="toss-agreement" className="toss-widget-slot toss-widget-slot--agreement" />
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
              <h2 className="checkout-summary-heading">결제 요약</h2>
              <ul className="checkout-summary-lines">
                {lines.map((l) => (
                  <li key={l.productCode} className="checkout-summary-line">
                    <span className="checkout-summary-name">{l.name}</span>
                    <span className="checkout-summary-qty">×{l.quantity}</span>
                    <span className="checkout-summary-price">{l.subtotal.toLocaleString()}원</span>
                  </li>
                ))}
              </ul>
              <div className="checkout-summary-total-block">
                <span>총 결제금액</span>
                <strong>{total.toLocaleString()}원</strong>
              </div>
              <button
                type="button"
                className="button checkout-pay-btn"
                disabled={widgetLoading || !!widgetError || !widgetReady}
                onClick={() => void onPay()}
              >
                {total.toLocaleString()}원 결제하기
              </button>
              <Link href="/cart" className="button secondary checkout-summary-back">
                이전 단계
              </Link>
              <p className="checkout-trust muted">
                결제 정보는 PG사를 통해 안전하게 처리됩니다.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
