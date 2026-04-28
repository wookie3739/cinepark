/** 쿠폰 카테고리 탭용 (브랜드는 전역 제휴 스트립에서 별도) */
export type CategoryId = "movie" | "cafe" | "restaurant" | "convenience" | "beauty";

export type CouponCategoryDef = {
  id: CategoryId;
  /** 화면에 표시되는 이름 (예정인 경우 라벨 뒤에 (예정) 붙임) */
  label: string;
  planned: boolean;
};

export const COUPON_CATEGORIES: CouponCategoryDef[] = [
  { id: "movie", label: "영화관", planned: false },
  { id: "cafe", label: "카페", planned: true },
  { id: "restaurant", label: "음식점", planned: true },
  { id: "convenience", label: "편의점", planned: true },
  { id: "beauty", label: "뷰티", planned: true },
];

export type BrandUsageDef = {
  id: string;
  labelKo: string;
  /** 작은 보조 라벨 (목업) */
  tagline?: string;
  /** 실제 외부 링크 허용 여부 — 목업에서 씨네파크만 true */
  activated: boolean;
  usageUrl?: string;
};

/** 헤더「사용하러 가기」모달에서 선택하는 목업 브랜드 */
export const MOCK_BRANDS_USAGE: BrandUsageDef[] = [
  {
    id: "cinepark",
    labelKo: "씨네파크",
    tagline: "영화관 토탈쿠폰",
    activated: true,
    usageUrl: "https://cinepark.kr/",
  },
  { id: "beanhouse", labelKo: "빈하우스", tagline: "카페", activated: false },
  { id: "tablenine", labelKo: "테이블9", tagline: "음식점", activated: false },
  { id: "sevenmore", labelKo: "세븐모어", tagline: "편의형", activated: false },
  { id: "glowlab", labelKo: "글로우랩", tagline: "뷰티", activated: false },
];

export function getCategoryById(id: CategoryId): CouponCategoryDef | undefined {
  return COUPON_CATEGORIES.find((c) => c.id === id);
}
