export type CouponProduct = {
  id: string;
  brand: string;
  name: string;
  unitPrice: number;
  originPrice: number;
  shortDesc: string;
  bullets: string[];
  noticeHtml: string;
};

export const DEFAULT_COUPON_ID = "total-1";

const products: Record<string, CouponProduct> = {
  [DEFAULT_COUPON_ID]: {
    id: DEFAULT_COUPON_ID,
    brand: "CINEPARK",
    name: "토탈쿠폰 1매",
    unitPrice: 50_000,
    originPrice: 50_000,
    shortDesc: "결제 후 마이페이지에서 쿠폰번호를 확인하고 시네파크 사용 채널에서 이용하세요.",
    bullets: [
      "씨네파크 사용 안내에 따라 1매 단위로 사용 가능",
      "유효기간 및 사용 가능 극장은 발급 시 안내 페이지를 따름",
      "결제 후 취소·환불은 정책에 따라 처리 (목업)",
    ],
    noticeHtml: "실제 결제는 PortOne / TossPayments 연동 시점에 활성화됩니다. 본 페이지는 플로우 목업입니다.",
  },
};

export function getCouponProduct(id: string): CouponProduct | undefined {
  return products[id];
}
