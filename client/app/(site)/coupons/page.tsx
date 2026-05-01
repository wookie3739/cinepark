"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCouponCategories, fetchCouponProductPage } from "../../../lib/api/catalog";
import { discountPercentOff } from "../../../lib/discount-percent";
import type { CouponCategory, CouponProductSummary } from "../../../types/catalog";

const PAGE_SIZE = 12;

type SortKey = "popular" | "price" | "newest";

function categoryLabel(categories: CouponCategory[], code: string): string {
  return categories.find((c) => c.code === code)?.label ?? code;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i);
  return Math.abs(h);
}

function stockBarMeta(p: CouponProductSummary): { fillPct: number; sub: string } {
  const s = p.availableStock;
  if (s <= 0) return { fillPct: 96, sub: "품절 임박" };
  if (s <= 15) return { fillPct: 82 + (hashCode(p.productCode) % 12), sub: "한정 수량" };
  if (s <= 80) return { fillPct: 45 + (s % 35), sub: `${s}매 남음` };
  return { fillPct: 22 + (hashCode(p.productCode) % 28), sub: `${s}매 남음` };
}

function timeLeftLabel(productCode: string): string {
  const h = hashCode(productCode) % 360;
  const hh = Math.floor(h / 60);
  const mm = h % 60;
  if (hh === 0) return `${mm}분 남음`;
  return `${hh}시간 ${mm}분 남음`;
}

export default function CouponsMarketPage() {
  const [categories, setCategories] = useState<CouponCategory[]>([]);
  const [categoryCode, setCategoryCode] = useState<string | undefined>(undefined);
  const [loaded, setLoaded] = useState<CouponProductSummary[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");

  useEffect(() => {
    let c = false;
    fetchCouponCategories()
      .then((list) => {
        if (!c) setCategories([...list].sort((a, b) => a.sortOrder - b.sortOrder));
      })
      .catch(() => {
        if (!c) setCategories([]);
      });
    return () => {
      c = true;
    };
  }, []);

  const loadPage = useCallback(
    async (nextPage: number, replace: boolean) => {
      if (replace) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const res = await fetchCouponProductPage(nextPage, PAGE_SIZE, categoryCode);
        setLast(res.last ?? res.content.length < PAGE_SIZE);
        setPage(res.number);
        setLoaded((prev) => (replace ? res.content : [...prev, ...res.content]));
      } catch (e) {
        setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
        if (replace) setLoaded([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [categoryCode],
  );

  useEffect(() => {
    setPage(0);
    void loadPage(0, true);
  }, [categoryCode, loadPage]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = q
      ? loaded.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brandLabel.toLowerCase().includes(q) ||
            p.productCode.toLowerCase().includes(q),
        )
      : [...loaded];

    if (sort === "price") rows.sort((a, b) => a.unitPrice - b.unitPrice);
    else if (sort === "newest") rows.sort((a, b) => b.productCode.localeCompare(a.productCode));
    return rows;
  }, [loaded, search, sort]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const crumbCat = categoryCode ? categoryLabel(categories, categoryCode) : "전체";

  return (
    <main className="page coupon-list-page">
      <div className="container coupon-list-breadcrumb" aria-label="경로">
        <Link href="/">홈</Link>
        <span className="coupon-list-bc-sep" aria-hidden>
          /
        </span>
        <span className="coupon-list-bc-current">쿠폰</span>
        <span className="coupon-list-bc-sep" aria-hidden>
          /
        </span>
        <span className="coupon-list-bc-muted">{crumbCat}</span>
      </div>

      <div className="container coupon-list-shell">
        <aside className="coupon-list-sidebar" aria-label="카테고리">
          <h2 className="coupon-list-sidebar-title">카테고리</h2>
          <ul className="coupon-list-nav">
            <li>
              <button
                type="button"
                className={`coupon-list-nav-btn ${categoryCode === undefined ? "is-active" : ""}`}
                onClick={() => setCategoryCode(undefined)}
              >
                <span className="coupon-list-nav-ico" aria-hidden>
                  ◎
                </span>
                <span>전체 쿠폰</span>
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={`coupon-list-nav-btn ${categoryCode === c.code ? "is-active" : ""}`}
                  onClick={() => setCategoryCode(c.code)}
                >
                  <span className="coupon-list-nav-ico" aria-hidden>
                    {c.label.slice(0, 1)}
                  </span>
                  <span>{c.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="coupon-list-member">
            <span className="coupon-list-member-badge">회원 전용</span>
            <p className="coupon-list-member-lead">가입하면 추가 혜택과 구매 내역 관리가 한곳에서 가능합니다.</p>
            <Link href="/signup" className="coupon-list-member-cta">
              회원가입
            </Link>
          </div>
        </aside>

        <div className="coupon-list-main">
          <div className="coupon-list-main-head">
            <div>
              <h1 className="coupon-list-title">영화관 할인 쿠폰</h1>
              <p className="coupon-list-sub">브랜드별 관람권·매점 쿠폰을 비교해 보세요.</p>
            </div>
            <form className="coupon-list-search" onSubmit={onSearchSubmit} role="search">
              <span className="coupon-list-search-ico" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type="search"
                className="coupon-list-search-input"
                placeholder="브랜드·상품명으로 검색…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="쿠폰 검색"
              />
            </form>
          </div>

          <div className="coupon-list-sort" role="tablist" aria-label="정렬">
            <button
              type="button"
              role="tab"
              aria-selected={sort === "popular"}
              className={`coupon-list-sort-btn ${sort === "popular" ? "is-active" : ""}`}
              onClick={() => setSort("popular")}
            >
              인기순
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sort === "price"}
              className={`coupon-list-sort-btn ${sort === "price" ? "is-active" : ""}`}
              onClick={() => setSort("price")}
            >
              가격순
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sort === "newest"}
              className={`coupon-list-sort-btn ${sort === "newest" ? "is-active" : ""}`}
              onClick={() => setSort("newest")}
            >
              최신순
            </button>
          </div>

          {error ? (
            <p className="coupon-list-alert" role="alert">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="coupon-list-muted">불러오는 중…</p>
          ) : filteredSorted.length === 0 ? (
            <div className="coupon-list-empty">
              <h2>{loaded.length > 0 ? "검색 결과가 없습니다" : "표시할 쿠폰이 없습니다"}</h2>
              <p>
                {loaded.length > 0
                  ? "다른 검색어를 입력하거나 카테고리를 바꿔 보세요."
                  : "잠시 후 다시 시도하거나 홈으로 돌아가 주세요."}
              </p>
              {loaded.length > 0 && search.trim() ? (
                <button type="button" className="button secondary" onClick={() => setSearch("")}>
                  검색 지우기
                </button>
              ) : (
                <Link href="/" className="button secondary">
                  홈으로
                </Link>
              )}
            </div>
          ) : (
            <>
              <ul className="coupon-list-grid">
                {filteredSorted.map((p) => {
                  const pct = discountPercentOff(p.unitPrice, p.originPrice);
                  const catLabel = categoryLabel(categories, p.categoryCode);
                  const { fillPct, sub } = stockBarMeta(p);
                  const h = hashCode(p.productCode);
                  const showHot = pct != null && pct >= 30;
                  const showNew = h % 3 === 0;
                  const exclusive = /cgv|롯데|메가/i.test(p.brandLabel);
                  return (
                    <li key={p.productCode} className="coupon-list-card">
                      <Link href={`/coupons/${p.productCode}`} className="coupon-list-card-media">
                        <div className="coupon-list-card-img">
                          {p.mainImageUrl ? (
                            <img src={p.mainImageUrl} alt="" className="product-thumb-cover" />
                          ) : (
                            <span className="coupon-list-card-ph" aria-hidden>
                              CINE
                            </span>
                          )}
                        </div>
                        <div className="coupon-list-card-badges">
                          {exclusive ? <span className="coupon-list-pill coupon-list-pill--inv">단독</span> : null}
                          {showHot ? <span className="coupon-list-pill coupon-list-pill--hot">HOT</span> : null}
                          {showNew ? <span className="coupon-list-pill coupon-list-pill--new">NEW</span> : null}
                        </div>
                      </Link>
                      <div className="coupon-list-card-body">
                        <div className="coupon-list-card-title-row">
                          <Link href={`/coupons/${p.productCode}`} className="coupon-list-card-titlelink">
                            <h2 className="coupon-list-card-title">{p.name}</h2>
                          </Link>
                          {pct != null ? <span className="coupon-list-disc-pct">-{pct}%</span> : null}
                        </div>
                        <p className="coupon-list-card-desc">
                          {catLabel} · 유효기간·환불은 제휴사 정책을 따릅니다. 자세한 조건은 상세 페이지를 확인해 주세요.
                        </p>
                        <div className="coupon-list-card-meta">
                          <span>{Math.round(fillPct)}% 소진</span>
                          <span className="coupon-list-card-time">{timeLeftLabel(p.productCode)}</span>
                        </div>
                        <div className="coupon-list-stock-bar" aria-hidden>
                          <div className="coupon-list-stock-fill" style={{ width: `${fillPct}%` }} />
                        </div>
                        <p className="coupon-list-stock-sub">{sub}</p>
                        <div className="coupon-list-card-prices">
                          <span className="coupon-list-price-sale">{p.unitPrice.toLocaleString()}원</span>
                          {pct != null ? (
                            <span className="coupon-list-price-origin">{p.originPrice.toLocaleString()}원</span>
                          ) : null}
                        </div>
                        <Link href={`/coupons/${p.productCode}`} className="coupon-list-card-cta">
                          쿠폰 받기
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {!last ? (
                <div className="coupon-list-more">
                  <button
                    type="button"
                    className="coupon-list-load-more"
                    disabled={loadingMore}
                    onClick={() => void loadPage(page + 1, false)}
                  >
                    {loadingMore ? "불러오는 중…" : "더 보기"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
