"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCouponCategories, fetchCouponProductPage } from "../../../lib/api/catalog";
import { discountPercentOff } from "../../../lib/discount-percent";
import type { CouponCategory, CouponProductSummary } from "../../../types/catalog";
import { ProductPriceDisplay } from "../../components/ProductPriceDisplay";

const PAGE_SIZE = 12;

type SortKey = "popular" | "price-asc" | "price-desc" | "name";

function categoryLabel(categories: CouponCategory[], code: string): string {
  return categories.find((c) => c.code === code)?.label ?? code;
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
            p.productCode.includes(q),
        )
      : [...loaded];

    if (sort === "price-asc") rows.sort((a, b) => a.unitPrice - b.unitPrice);
    else if (sort === "price-desc") rows.sort((a, b) => b.unitPrice - a.unitPrice);
    else if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    return rows;
  }, [loaded, search, sort]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <main className="page coupon-market-page">
      <section className="coupon-market-hero" aria-labelledby="coupon-market-title">
        <div className="container coupon-market-hero-inner">
          <h1 id="coupon-market-title" className="coupon-market-hero-title">
            쿠폰 마켓
          </h1>
          <p className="coupon-market-hero-lead">
            영화 관람권과 매점 콤보를 한곳에서 비교하고, 가장 알맞은 가격으로 담아 보세요.
          </p>
          <form className="coupon-market-search" onSubmit={onSearchSubmit} role="search">
            <span className="coupon-market-search-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="search"
              className="coupon-market-search-input"
              placeholder="브랜드, 상품명, 상품코드로 검색…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="쿠폰 검색"
            />
            <button type="submit" className="coupon-market-search-btn">
              검색
            </button>
          </form>
        </div>
      </section>

      <div className="container coupon-market-body">
        <div className="coupon-market-toolbar">
          <div className="coupon-market-filters" role="tablist" aria-label="카테고리 필터">
            <button
              type="button"
              role="tab"
              aria-selected={categoryCode === undefined}
              className={`coupon-market-pill ${categoryCode === undefined ? "is-active" : ""}`}
              onClick={() => setCategoryCode(undefined)}
            >
              전체
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={categoryCode === c.code}
                className={`coupon-market-pill ${categoryCode === c.code ? "is-active" : ""}`}
                onClick={() => setCategoryCode(c.code)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <label className="coupon-market-sort">
            <span className="coupon-market-sort-label">정렬</span>
            <select
              className="coupon-market-sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="popular">인기순</option>
              <option value="price-asc">가격 낮은순</option>
              <option value="price-desc">가격 높은순</option>
              <option value="name">이름순</option>
            </select>
          </label>
        </div>

        {error ? (
          <p className="card-inline-msg" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="muted coupon-market-loading">불러오는 중…</p>
        ) : filteredSorted.length === 0 ? (
          <div className="panel flat coupon-market-empty">
            <h2>{loaded.length > 0 ? "검색 결과가 없습니다" : "표시할 쿠폰이 없습니다"}</h2>
            <p className="muted">
              {loaded.length > 0
                ? "다른 검색어를 입력하거나 필터를 바꿔 보세요."
                : "검색어나 필터를 바꿔 보시거나, 잠시 후 다시 시도해 주세요."}
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
            <ul className="coupon-market-grid">
              {filteredSorted.map((p) => {
                const pct = discountPercentOff(p.unitPrice, p.originPrice);
                const catLabel = categoryLabel(categories, p.categoryCode);
                return (
                  <li key={p.productCode} className="coupon-market-card">
                    <Link href={`/coupons/${p.productCode}`} className="coupon-market-card-media">
                      <div className="coupon-market-card-image">
                        {p.mainImageUrl ? (
                          <img src={p.mainImageUrl} alt="" className="product-thumb-cover" />
                        ) : (
                          <span className="coupon-market-card-fallback" aria-hidden>
                            CINE
                          </span>
                        )}
                      </div>
                      {pct != null ? (
                        <span className="coupon-market-card-badge">{pct}% 할인</span>
                      ) : (
                        <span className="coupon-market-card-badge coupon-market-card-badge--muted">특가</span>
                      )}
                    </Link>
                    <div className="coupon-market-card-body">
                      <span className="coupon-market-card-tag">{catLabel}</span>
                      <Link href={`/coupons/${p.productCode}`} className="coupon-market-card-titlelink">
                        <h2 className="coupon-market-card-title">{p.name}</h2>
                      </Link>
                      <p className="coupon-market-card-brand">{p.brandLabel}</p>
                      <div className="coupon-market-card-price">
                        <ProductPriceDisplay unitPrice={p.unitPrice} originPrice={p.originPrice} layout="card" />
                      </div>
                      <Link href={`/coupons/${p.productCode}`} className="coupon-market-card-cta">
                        바로 구매
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>

            {!last ? (
              <div className="coupon-market-more-wrap">
                <button
                  type="button"
                  className="coupon-market-load-more"
                  disabled={loadingMore}
                  onClick={() => void loadPage(page + 1, false)}
                >
                  {loadingMore ? "불러오는 중…" : "쿠폰 더 보기"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
