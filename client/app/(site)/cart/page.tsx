"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { getCouponProduct } from "../../../lib/coupon-products";
import { writeCheckoutSession } from "../../../lib/checkout-session";
import { useCart } from "../../../context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const { cart, setLineQuantity, removeFromCart, wishlist, removeFromWishlist } = useCart();

  const lines = useMemo(() => {
    return cart
      .map((line) => {
        const p = getCouponProduct(line.productId);
        if (!p) return null;
        return { line, product: p, subtotal: p.unitPrice * line.quantity };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [cart]);

  const total = useMemo(() => lines.reduce((s, x) => s + x.subtotal, 0), [lines]);

  const wishItems = useMemo(() => {
    return wishlist
      .map((id) => {
        const p = getCouponProduct(id);
        return p ? p : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [wishlist]);

  const onCheckout = () => {
    if (lines.length === 0) return;
    writeCheckoutSession(
      lines.map((x) => ({ productId: x.product.id, quantity: x.line.quantity })),
    );
    router.push("/checkout");
  };

  return (
    <main className="page">
      <div className="container narrow-page">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>장바구니</strong>
        </nav>

        <div className="cart-layout">
          <section className="panel flat">
            <h2 className="cart-title">장바구니</h2>
            {lines.length === 0 ? (
              <p className="muted">담긴 상품이 없습니다. 토탈쿠폰 상품을 담아 주세요.</p>
            ) : (
              <ul className="cart-lines">
                {lines.map(({ line, product, subtotal }) => (
                  <li key={line.productId} className="cart-line">
                    <Link href={`/coupons/${product.id}`} className="cart-line-thumb product-image">
                      CINE
                    </Link>
                    <div className="cart-line-meta">
                      <span className="product-brand">{product.brand}</span>
                      <Link href={`/coupons/${product.id}`} className="cart-line-name">
                        {product.name}
                      </Link>
                      <p className="cart-line-unit">{product.unitPrice.toLocaleString()}원 / 1매</p>
                    </div>
                    <div className="cart-line-qty">
                      <div className="qty-stepper small">
                        <button
                          type="button"
                          onClick={() => setLineQuantity(line.productId, line.quantity - 1)}
                          aria-label="수량 줄이기"
                        >
                          −
                        </button>
                        <span className="qty-readonly">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setLineQuantity(line.productId, line.quantity + 1)}
                          aria-label="수량 늘리기"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="cart-line-sum">
                      <strong>{subtotal.toLocaleString()}원</strong>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => removeFromCart(line.productId)}
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="cart-aside">
            <div className="panel flat summary-panel">
              <h2>주문 요약</h2>
              <div className="price-row">
                <span>상품금액</span>
                <strong>{total.toLocaleString()}원</strong>
              </div>
              <div className="price-row">
                <span>배송비</span>
                <strong>0원</strong>
              </div>
              <div className="detail-total cart-summary-total">
                <span>결제 예정 금액</span>
                <strong>{total.toLocaleString()}원</strong>
              </div>
              <button
                type="button"
                className="button wide"
                disabled={lines.length === 0}
                onClick={onCheckout}
              >
                주문하기
              </button>
              <Link href="/" className="button secondary wide">
                쇼핑 계속하기
              </Link>
            </div>

            {wishItems.length > 0 ? (
              <div className="panel flat wish-aside">
                <h2>관심상품</h2>
                <ul className="wish-aside-list">
                  {wishItems.map((p) => (
                    <li key={p.id}>
                      <Link href={`/coupons/${p.id}`}>{p.name}</Link>
                      <button type="button" className="link-button" onClick={() => removeFromWishlist(p.id)}>
                        제거
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
