"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEFAULT_COUPON_ID } from "../../lib/coupon-products";
import { writeCheckoutSession } from "../../lib/checkout-session";
import { useCart } from "../../context/CartContext";

type Props = {
  productId?: string;
};

export default function ShopThemeCardActions({ productId = DEFAULT_COUPON_ID }: Props) {
  const router = useRouter();
  const { addToWishlist } = useCart();
  const [msg, setMsg] = useState<string | null>(null);

  const onBuyNow = () => {
    writeCheckoutSession([{ productId, quantity: 1 }]);
    router.push("/checkout");
  };

  const onWish = () => {
    const added = addToWishlist(productId);
    setMsg(added ? "관심상품에 담았습니다." : "이미 관심상품에 있습니다.");
    window.setTimeout(() => setMsg(null), 2200);
  };

  return (
    <div className="card-actions-wrap">
      {msg ? <p className="card-inline-msg">{msg}</p> : null}
      <div className="card-actions">
        <button type="button" className="card-button" onClick={onBuyNow}>
          바로구매 하기
        </button>
        <button type="button" className="card-button outline" onClick={onWish}>
          관심상품 담기
        </button>
      </div>
    </div>
  );
}
