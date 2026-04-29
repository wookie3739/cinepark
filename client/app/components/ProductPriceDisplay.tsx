import type { ReactNode } from "react";

import { discountPercentOff } from "../../lib/discount-percent";

export type ProductPriceDisplayLayout = "card" | "detail" | "compact" | "checkout";

type Props = {
  unitPrice: number;
  originPrice: number;
  layout?: ProductPriceDisplayLayout;
  /** 예: 장바구니 단가 줄 `/ 1매` */
  suffix?: ReactNode;
  /** 주문서( checkout ) 줄당 수량 */
  quantity?: number;
};

export function ProductPriceDisplay({
  unitPrice,
  originPrice,
  layout = "card",
  suffix,
  quantity,
}: Props) {
  const pct = discountPercentOff(unitPrice, originPrice);
  const hasDiscount = pct != null;

  const stackClass = [
    "product-price-stack",
    layout === "detail" ? "detail-price-block" : null,
    layout === "compact" ? "product-price-stack--compact" : null,
    layout === "checkout" ? "product-price-stack--checkout" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const saleInner = (
    <>
      {unitPrice.toLocaleString()}
      <span className="unit">원</span>
      {suffix}
    </>
  );

  if (layout === "checkout") {
    const q = quantity ?? 1;
    const qtyEl = (
      <span className="checkout-qty-suffix">
        {" "}
        × {q}매
      </span>
    );
    if (hasDiscount) {
      return (
        <div className={stackClass}>
          <p className="product-price-origin">{originPrice.toLocaleString()}원</p>
          <div className="product-price-final-row">
            <span className="price-discount-pct">{pct}%</span>
            <div className="checkout-price-inline">
              <strong className="product-price-sale">{saleInner}</strong>
              {qtyEl}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={stackClass}>
        <div className="product-price-final-row product-price-final-row--plain">
          <strong className="product-price-sale">{saleInner}</strong>
          {qtyEl}
        </div>
      </div>
    );
  }

  if (!hasDiscount) {
    return (
      <div className={stackClass}>
        <div className="product-price-final-row product-price-final-row--plain">
          <span className="product-price-sale">{saleInner}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={stackClass}>
      <p className="product-price-origin">{originPrice.toLocaleString()}원</p>
      <div className="product-price-final-row">
        <span className="price-discount-pct">{pct}%</span>
        <span className="product-price-sale">{saleInner}</span>
      </div>
    </div>
  );
}
