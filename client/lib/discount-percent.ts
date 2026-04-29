/**
 * 정가 대비 판매가 할인율(0~100, 정수). 표시할 할인이 없으면 null.
 */
export function discountPercentOff(unitPrice: number, originPrice: number): number | null {
  if (!Number.isFinite(unitPrice) || !Number.isFinite(originPrice)) return null;
  if (originPrice <= 0 || unitPrice >= originPrice) return null;
  const pct = Math.round((1 - unitPrice / originPrice) * 100);
  return pct > 0 ? pct : null;
}
