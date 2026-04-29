import type { SpringPage } from "./customer-service";

export type CouponCategory = {
  id: number;
  code: string;
  label: string;
  sortOrder: number;
  active: boolean;
};

export type CouponProductSummary = {
  productCode: string;
  categoryCode: string;
  name: string;
  brandLabel: string;
  unitPrice: number;
  originPrice: number;
  mainImageUrl: string | null;
  availableStock: number;
  /** 제휴 사용처 링크 — 없으면 null */
  usageUrl: string | null;
};

export type CouponProductDetail = {
  productCode: string;
  categoryCode: string;
  categoryLabel: string;
  categoryId?: number | null;
  name: string;
  brandLabel: string;
  unitPrice: number;
  originPrice: number;
  /** 공개 API에서는 내려오지 않음(관리자 상세에서만) */
  shortDesc?: string | null;
  bullets: string[];
  noticeHtml: string | null;
  mainImageUrl: string | null;
  mainImageKey?: string | null;
  detailImageUrls: string[];
  detailImageKeys?: string | null;
  availableStock: number;
  /** 제휴 사용처 링크 — 없으면 null */
  usageUrl: string | null;
};

export type CartLineDto = {
  productCode: string;
  name: string;
  brandLabel: string;
  unitPrice: number;
  originPrice: number;
  quantity: number;
  lineTotal: number;
  mainImageUrl: string | null;
};

export type CartView = {
  lines: CartLineDto[];
  totalAmount: number;
  lineCount: number;
};

export type AdminCouponProductRow = {
  id: number;
  productCode: string;
  categoryCode: string;
  categoryLabel: string;
  name: string;
  brandLabel: string;
  shelfStatus: CouponShelfStatus;
  unitPrice: number;
  availableStock: number;
  usageLinkRegistered: boolean;
};

export type CouponShelfStatus = "DRAFT" | "ON_SALE" | string;

export type CouponCategorySavePayload = {
  code: string;
  label: string;
  sortOrder: number;
  active: boolean;
};

export type CouponProductSavePayload = {
  name: string;
  brandLabel: string;
  unitPrice: number;
  originPrice: number;
  shortDesc?: string | null;
  bullets?: string | null;
  noticeHtml?: string | null;
  mainImageKey?: string | null;
  detailImageKeys?: string | null;
  /** 제휴 사용처(외부) URL — 비우면 미등록 */
  usageUrl?: string | null;
  shelfStatus: CouponShelfStatus;
  categoryId: number;
};

/** 헤더「사용하러 가기」모달 — 판매 중 상품 전체; usageUrl 없으면 앱 이용 안내 */
export type CouponProductUsageLink = {
  productCode: string;
  name: string;
  brandLabel: string;
  usageUrl: string | null;
};

export type CouponCodeBulkPayload = {
  credentials: string[];
};

/** 관리자: 상품별 쿠폰 번호 행 */
export type CouponCodeAdminRow = {
  id: number;
  credential: string;
  status: "AVAILABLE" | "USED" | "VOID" | string;
  issuedToUserId: number | null;
  orderId: number | null;
  orderLineId: number | null;
  issuedAt: string | null;
  createdAt: string;
};
