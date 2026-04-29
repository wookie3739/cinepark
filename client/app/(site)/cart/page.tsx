"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchCouponProductsBatch } from "../../../lib/api/catalog";
import { writeCheckoutSession } from "../../../lib/checkout-session";
import { useCart } from "../../../context/CartContext";
import type { CouponProductDetail } from "../../../types/catalog";
import { ProductPriceDisplay } from "../../components/ProductPriceDisplay";

export default function CartPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const {
    serverCart,
    guestLines,
    guestProducts,
    setLineQuantity,
    removeFromCart,
    wishlist,
    removeFromWishlist,
  } = useCart();
  const [wishMap, setWishMap] = useState<Record<string, CouponProductDetail | undefined>>({});

  useEffect(() => {
    if (wishlist.length === 0) {
      setWishMap({});
      return;
    }
    let cancelled = false;
    void fetchCouponProductsBatch(wishlist).then((list) => {
      if (cancelled) return;
      const m: Record<string, CouponProductDetail> = {};
      for (const p of list) {
        m[p.productCode] = p;
      }
      setWishMap(m);
    });
    return () => {
      cancelled = true;
    };
  }, [wishlist]);

  const lines = useMemo(() => {
    if (accessToken && serverCart) {
      return serverCart.lines.map((l) => ({
        productCode: l.productCode,
        name: l.name,
        brandLabel: l.brandLabel,
        unitPrice: l.unitPrice,
        originPrice: l.originPrice,
        quantity: l.quantity,
        subtotal: l.lineTotal,
      }));
    }
    return guestLines
      .map((line) => {
        const d = guestProducts[line.productCode];
        if (!d) return null;
        return {
          productCode: line.productCode,
          name: d.name,
          brandLabel: d.brandLabel,
          unitPrice: d.unitPrice,
          originPrice: d.originPrice,
          quantity: line.quantity,
          subtotal: d.unitPrice * line.quantity,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [accessToken, serverCart, guestLines, guestProducts]);

  const total = useMemo(() => lines.reduce((s, x) => s + x.subtotal, 0), [lines]);

  const wishItems = useMemo(() => {
    return wishlist
      .map((code) => wishMap[code])
      .filter((x): x is CouponProductDetail => !!x);
  }, [wishlist, wishMap]);

  const onCheckout = () => {
    if (lines.length === 0) return;
    writeCheckoutSession(
      lines.map((x) => ({ productCode: x.productCode, quantity: x.quantity })),
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
                {lines.map((row) => (
                  <li key={row.productCode} className="cart-line">
                    <Link href={`/coupons/${row.productCode}`} className="cart-line-thumb product-image">
                      CINE
                    </Link>
                    <div className="cart-line-meta">
                      <span className="product-brand">{row.brandLabel}</span>
                      <Link href={`/coupons/${row.productCode}`} className="cart-line-name">
                        {row.name}
                      </Link>
                      <div className="cart-line-unit">
                        <ProductPriceDisplay
                          unitPrice={row.unitPrice}
                          originPrice={row.originPrice}
                          layout="compact"
                          suffix={
                            <span className="product-price-per-unit">
                              {" "}
                              / 1매
                            </span>
                          }
                        />
                      </div>
                    </div>
                    <div className="cart-line-qty">
                      <div className="qty-stepper small">
                        <button
                          type="button"
                          onClick={() => void setLineQuantity(row.productCode, row.quantity - 1)}
                          aria-label="수량 줄이기"
                        >
                          −
                        </button>
                        <span className="qty-readonly">{row.quantity}</span>
                        <button
                          type="button"
                          onClick={() => void setLineQuantity(row.productCode, row.quantity + 1)}
                          aria-label="수량 늘리기"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="cart-line-sum">
                      <strong>{row.subtotal.toLocaleString()}원</strong>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => void removeFromCart(row.productCode)}
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
                    <li key={p.productCode}>
                      <Link href={`/coupons/${p.productCode}`}>{p.name}</Link>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => removeFromWishlist(p.productCode)}
                      >
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
