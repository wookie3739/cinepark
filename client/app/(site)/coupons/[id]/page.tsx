"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getCouponProduct } from "../../../../lib/coupon-products";
import { writeCheckoutSession } from "../../../../lib/checkout-session";
import { useCart } from "../../../../context/CartContext";

export default function CouponDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const product = useMemo(() => getCouponProduct(id), [id]);
  const router = useRouter();
  const { addToCart, addToWishlist } = useCart();
  const [qty, setQty] = useState(1);
  const [wishMsg, setWishMsg] = useState<string | null>(null);

  if (!product) {
    return (
      <main className="page">
        <div className="container narrow-page">
          <nav className="breadcrumb">
            <Link href="/">홈</Link>
            <span className="sep">/</span>
            <span>상품</span>
          </nav>
          <section className="panel">
            <h2>상품을 찾을 수 없습니다</h2>
            <p className="muted">요청하신 쿠폰 상품이 없습니다. 목업은 토탈쿠폰 상품만 제공합니다.</p>
            <div className="button-row">
              <Link href="/" className="button">
                홈으로
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const lineTotal = product.unitPrice * qty;

  const changeQty = (delta: number) => {
    setQty((q) => Math.min(99, Math.max(1, q + delta)));
  };

  const onAddCart = () => {
    addToCart(product.id, qty);
    router.push("/cart");
  };

  const onBuyNow = () => {
    writeCheckoutSession([{ productId: product.id, quantity: qty }]);
    router.push("/checkout");
  };

  const onWish = () => {
    const ok = addToWishlist(product.id);
    setWishMsg(ok ? "관심상품에 담았습니다." : "이미 관심상품에 있습니다.");
    window.setTimeout(() => setWishMsg(null), 2200);
  };

  return (
    <main className="page">
      <div className="container">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <span>토탈쿠폰</span>
          <span className="sep">/</span>
          <strong>{product.name}</strong>
        </nav>

        <section className="detail-grid">
          <div className="detail-visual">
            <div className="product-image detail-thumb">CINE</div>
            <ul className="detail-bullets">
              {product.bullets.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="detail-info panel flat">
            <span className="product-brand">{product.brand}</span>
            <h1 className="detail-title">{product.name}</h1>
            <p className="detail-lead">{product.shortDesc}</p>

            <div className="price-block detail-price-block">
              <span className="sale">{product.unitPrice.toLocaleString()}</span>
              <span className="unit">원</span>
              {product.originPrice !== product.unitPrice ? (
                <em className="origin">{product.originPrice.toLocaleString()}원</em>
              ) : null}
            </div>

            <div className="qty-row">
              <span className="qty-label">수량</span>
              <div className="qty-stepper">
                <button type="button" onClick={() => changeQty(-1)} aria-label="수량 줄이기">
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) => {
                    const v = Number.parseInt(e.target.value, 10);
                    if (Number.isNaN(v)) return;
                    setQty(Math.min(99, Math.max(1, v)));
                  }}
                  aria-label="구매 수량"
                />
                <button type="button" onClick={() => changeQty(1)} aria-label="수량 늘리기">
                  +
                </button>
              </div>
              <span className="qty-hint">최대 99매까지 (목업)</span>
            </div>

            <div className="detail-total">
              <span>총 상품금액</span>
              <strong>{lineTotal.toLocaleString()}원</strong>
            </div>

            {wishMsg ? <p className="card-inline-msg">{wishMsg}</p> : null}

            <div className="detail-actions">
              <button type="button" className="button secondary" onClick={onWish}>
                관심상품 담기
              </button>
              <button type="button" className="button secondary" onClick={onAddCart}>
                장바구니 담기
              </button>
              <button type="button" className="button" onClick={onBuyNow}>
                바로 구매하기
              </button>
            </div>

            <p className="muted small-print">{product.noticeHtml}</p>
          </div>
        </section>

        <section className="panel notice-panel">
          <h2>안내사항</h2>
          <p>{product.shortDesc}</p>
          <ul className="detail-bullets">
            <li>주문번호·외부주문번호는 결제 연동 후 주문 내역 화면에 표시됩니다.</li>
            <li>카드 할부 무이자 행사는 목업에 포함되지 않습니다.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
