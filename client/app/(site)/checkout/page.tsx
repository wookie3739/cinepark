"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getCouponProduct } from "../../../lib/coupon-products";
import { readCheckoutSession, writeCheckoutSession } from "../../../lib/checkout-session";

type ResolvedLine = {
  productId: string;
  quantity: number;
  name: string;
  unitPrice: number;
  subtotal: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [lines, setLines] = useState<ResolvedLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = readCheckoutSession();
    if (!raw || raw.length === 0) {
      setLines([]);
      setReady(true);
      return;
    }
    const resolved: ResolvedLine[] = [];
    for (const row of raw) {
      const p = getCouponProduct(row.productId);
      if (!p || row.quantity < 1) continue;
      resolved.push({
        productId: p.id,
        quantity: row.quantity,
        name: p.name,
        unitPrice: p.unitPrice,
        subtotal: p.unitPrice * row.quantity,
      });
    }
    setLines(resolved);
    if (resolved.length > 0) {
      writeCheckoutSession(
        resolved.map((r) => ({ productId: r.productId, quantity: r.quantity })),
      );
    }
    setReady(true);
  }, []);

  const total = useMemo(() => lines.reduce((s, l) => s + l.subtotal, 0), [lines]);

  const onPay = () => {
    if (lines.length === 0 || total <= 0) return;
    router.push(`/order/complete?amount=${total}`);
  };

  if (!ready) {
    return (
      <main className="page">
        <div className="container narrow-page">
          <p className="muted">불러오는 중…</p>
        </div>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="page">
        <div className="container narrow-page">
          <section className="panel">
            <h2>결제할 상품이 없습니다</h2>
            <p className="muted">장바구니에서 주문하거나 상품 상세에서 바로 구매해 주세요.</p>
            <div className="button-row">
              <Link href="/cart" className="button">
                장바구니로
              </Link>
              <Link href="/coupons/total-1" className="button secondary">
                토탈쿠폰 상세
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container narrow-page">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>주문·결제 (목업)</strong>
        </nav>

        <section className="panel">
          <h2>주문서</h2>
          <ul className="checkout-lines">
            {lines.map((l) => (
              <li key={l.productId} className="checkout-line">
                <div>
                  <span className="product-brand">CINEPARK</span>
                  <p className="checkout-line-name">{l.name}</p>
                </div>
                <span className="muted">
                  {l.unitPrice.toLocaleString()}원 × {l.quantity}매
                </span>
                <strong>{l.subtotal.toLocaleString()}원</strong>
              </li>
            ))}
          </ul>
          <div className="detail-total cart-summary-total">
            <span>총 결제금액</span>
            <strong>{total.toLocaleString()}원</strong>
          </div>
        </section>

        <section className="panel">
          <h2>결제 수단 (목업)</h2>
          <p className="muted">PortOne · TossPayments 연동 전 단계입니다. 아래 버튼은 완료 화면으로만 이동합니다.</p>
          <ul className="pay-method-list">
            <li>
              <label className="pay-method-option">
                <input type="radio" name="pay" defaultChecked />
                신용·체크카드 (목업)
              </label>
            </li>
            <li>
              <label className="pay-method-option">
                <input type="radio" name="pay" />
                간편결제 (목업)
              </label>
            </li>
          </ul>
        </section>

        <div className="button-row">
          <Link href="/cart" className="button secondary">
            이전
          </Link>
          <button type="button" className="button" onClick={onPay}>
            {total.toLocaleString()}원 결제하기 (목업)
          </button>
        </div>
      </div>
    </main>
  );
}
