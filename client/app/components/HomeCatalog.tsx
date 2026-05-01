"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { COUPON_CATEGORIES, type CategoryId } from "../../lib/coupon-brands-catalog";
import { fetchCouponCategories, fetchCouponProductPage } from "../../lib/api/catalog";
import type { CouponCategory, CouponProductSummary } from "../../types/catalog";
import { discountPercentOff } from "../../lib/discount-percent";
import BrandUsageModal from "./BrandUsageModal";

const PLANNED_BY_CODE: Partial<Record<CategoryId, boolean>> = Object.fromEntries(
  COUPON_CATEGORIES.map((c) => [c.id, c.planned]),
) as Partial<Record<CategoryId, boolean>>;

type HomeCatalogProps = {
  homeNotices?: unknown[];
  homeNoticesError?: string | null;
};

function plannedLabel(cat: CouponCategory): string {
  const p = PLANNED_BY_CODE[cat.code as CategoryId];
  return p ? `${cat.label} (예정)` : cat.label;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i);
  return Math.abs(h);
}

/** 진행 바·잔여 수(디자인용, 실제 재고 API 아님) */
function stockVisual(productCode: string): { fillPct: number; remaining: number } {
  const h = hashCode(productCode);
  const fillPct = 40 + (h % 55);
  const remaining = 40 + ((h >> 5) % 160);
  return { fillPct, remaining };
}

function CategoryGlyph({ index }: { index: number }) {
  const common = { width: 26, height: 26, fill: "currentColor" as const };
  switch (index % 4) {
    case 0:
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M4 5h16v2H4V5zm0 4h10v2H4V9zm0 4h16v2H4v-2zm0 4h12v2H4v-2z" />
        </svg>
      );
    case 1:
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M8.1 13.34l2.83-2.83L3.91 3.5 5.34 2.07l7.07 7.07 2.83-2.83 3.54 3.54-10.68 10.68L8.1 13.34zM14.88 8.48l5.66-5.66L22 4.27l-5.66 5.66-1.46-1.45zm-4.24 4.24L4.27 19.11l1.41 1.41 6.36-6.36-1.42-1.44z" />
        </svg>
      );
    case 2:
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M6 3v6c0 2.97 2.16 5.43 5 5.91V19H8v2h8v-2h-3v-4.09c2.84-.48 5-2.94 5-5.91V3H6zm2 2h8v4c0 2.21-1.79 4-4 4s-4-1.79-4-4V5z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M18.36 9l.6 3H5.04l.6-3h12.72zM20 4H4v2h16V4zm0 3H4l-1 5v2h2v7h2v-7h8v7h2v-7h2v-2l-1-5z" />
        </svg>
      );
  }
}

export default function HomeCatalog({ homeNotices = [], homeNoticesError = null }: HomeCatalogProps) {
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [apiCategories, setApiCategories] = useState<CouponCategory[]>([]);
  const [category, setCategory] = useState<string>("movie");
  const [products, setProducts] = useState<CouponProductSummary[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    fetchCouponCategories()
      .then((list) => {
        if (!c && list.length > 0) {
          setApiCategories(list);
          setCategory((prev) =>
            list.some((x) => x.code === prev) ? prev : list.sort((a, b) => a.sortOrder - b.sortOrder)[0].code,
          );
        }
      })
      .catch(() => {
        if (!c) setApiCategories([]);
      });
    return () => {
      c = true;
    };
  }, []);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    setLoadErr(null);
    fetchCouponProductPage(0, 48, category)
      .then((page) => {
        if (!cancelled) setProducts(page.content);
      })
      .catch((e) => {
        if (!cancelled) {
          setProducts([]);
          setLoadErr(e instanceof Error ? e.message : "목록 로드 실패");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const categoryTiles = useMemo(() => {
    return [...apiCategories].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [apiCategories]);

  const catMeta = apiCategories.find((x) => x.code === category);
  const hotDeals = products.slice(0, 4);
  const hasAnyProducts = products.length > 0;
  const displayCats = categoryTiles.slice(0, 4);

  return (
    <div className="fd-page">
      <div className="fd-shell">
        <section className="fd-hero" aria-labelledby="fd-hero-title">
          <span className="fd-hero-badge">단독 특가</span>
          <h1 id="fd-hero-title">대작을 더 가볍게 만나세요.</h1>
          <p>
            이번 시즌 인기 영화관 할인 쿠폰을 모았습니다. 한정 수량·기간이 붙은 상품도 있으니, 마음에 드는 쿠폰은
            서둘러 확인해 보세요.
          </p>
          <Link href="/coupons" className="fd-hero-cta">
            쿠폰 보러가기
          </Link>
        </section>

        <section className="fd-cats" aria-label="카테고리">
          {displayCats.length === 0 ? (
            <p className="fd-inline-msg">카테고리를 불러오는 중입니다…</p>
          ) : (
            displayCats.map((cat, idx) => {
              const selected = cat.code === category;
              const planned = PLANNED_BY_CODE[cat.code as CategoryId] === true;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`fd-cat-card ${selected ? "fd-cat-card--selected" : ""}`}
                  onClick={() => setCategory(cat.code)}
                  aria-pressed={selected}
                  disabled={planned}
                >
                  <span className="fd-cat-icon">
                    <CategoryGlyph index={idx} />
                  </span>
                  <span className="fd-cat-label">{plannedLabel(cat)}</span>
                </button>
              );
            })
          )}
        </section>

        <section className="fd-best" aria-labelledby="fd-best-title">
          <header className="fd-best-head">
            <div>
              <h2 id="fd-best-title">실시간 인기</h2>
              <p>지금 많이 선택되는 할인 쿠폰입니다.</p>
            </div>
            <Link href="/coupons" className="fd-best-more">
              전체 보기 <span aria-hidden>→</span>
            </Link>
          </header>

          {loadErr ? (
            <p className="fd-inline-msg" role="alert">
              {loadErr}
            </p>
          ) : null}

          {!hasAnyProducts ? (
            <div className="panel flat planned-category-panel">
              <h2 className="planned-category-title">{catMeta ? plannedLabel(catMeta) : category}</h2>
              <p className="planned-category-lead">이 카테고리에 판매 중인 상품이 없습니다.</p>
              <p className="muted">다른 카테고리를 선택하거나 잠시 후 다시 확인해 주세요.</p>
            </div>
          ) : (
            <div className="fd-best-grid">
              {hotDeals.map((p) => {
                const pct = discountPercentOff(p.unitPrice, p.originPrice);
                const { fillPct, remaining } = stockVisual(p.productCode);
                const initials = (p.brandLabel ?? "C").slice(0, 2).toUpperCase();
                return (
                  <Link key={p.productCode} href={`/coupons/${p.productCode}`} className="fd-card">
                    <div className="fd-card-media">
                      {p.mainImageUrl ? <img src={p.mainImageUrl} alt="" /> : null}
                      <span className="fd-card-badge">{pct != null ? `${pct}% 할인` : "특가"}</span>
                    </div>
                    <div className="fd-card-brand">
                      <span className="fd-card-brand-ico">{initials}</span>
                      <span className="fd-card-brand-name">{p.brandLabel}</span>
                    </div>
                    <h3>{p.name}</h3>
                    <div className="fd-card-prices">
                      <span className="fd-card-price-sale">{p.unitPrice.toLocaleString()}원</span>
                      {pct != null ? (
                        <span className="fd-card-price-origin">{p.originPrice.toLocaleString()}원</span>
                      ) : null}
                    </div>
                    <div className="fd-stock-meta">
                      <span>남은 수량 약 {remaining}개</span>
                      <span>{fillPct}%</span>
                    </div>
                    <div className="fd-stock-bar" aria-hidden>
                      <div className="fd-stock-fill" style={{ width: `${fillPct}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="fd-promo" aria-labelledby="fd-promo-title">
          <div>
            <h2 id="fd-promo-title">친구를 초대하면 5,000P</h2>
            <p>
              좋은 할인을 주변에도 알려 주세요. 친구가 첫 구매를 완료하면 추천 보상으로 포인트를 드립니다. (이벤트
              조건은 공지 및 이용안내를 확인해 주세요.)
            </p>
            <Link href="/signup" className="fd-promo-btn">
              초대 링크 받기
            </Link>
          </div>
          <div className="fd-promo-deco" aria-hidden />
        </section>

        {(homeNotices.length > 0 || homeNoticesError) && (
          <section className="fd-notice" aria-label="공지">
            {homeNoticesError ? <p className="fd-inline-msg">{homeNoticesError}</p> : null}
            {homeNotices.length > 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: "#586062" }}>
                새 소식이 있습니다.{" "}
                <Link href="/support/notice" style={{ color: "#2a3fa4", fontWeight: 700 }}>
                  공지사항 보기
                </Link>
              </p>
            ) : null}
          </section>
        )}
      </div>

      <footer className="fd-foot">
        <div className="fd-foot-inner">
          <div className="fd-foot-brand">
            <strong>cinepark COUPON</strong>
            <p>제휴 영화관 할인 쿠폰을 한곳에서 비교·구매할 수 있도록 돕는 서비스입니다.</p>
          </div>
          <nav className="fd-foot-links" aria-label="푸터 링크">
            <Link href="/intro">서비스 소개</Link>
            <Link href="/support/guide">이용안내</Link>
            <Link href="/">개인정보 처리방침</Link>
            <a href="https://totalseller.co.kr/" target="_blank" rel="noreferrer">
              입점·제휴 문의
            </a>
            <Link href="/support">고객센터</Link>
            <button type="button" onClick={() => setUsageModalOpen(true)}>
              브랜드 사용 안내
            </button>
          </nav>
        </div>
        <p className="fd-foot-copy">© {new Date().getFullYear()} CINEPARK COUPON. All rights reserved.</p>
      </footer>

      <BrandUsageModal open={usageModalOpen} onClose={() => setUsageModalOpen(false)} />
    </div>
  );
}
