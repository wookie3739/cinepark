"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { COUPON_CATEGORIES, type CategoryId } from "../../lib/coupon-brands-catalog";
import { fetchCouponCategories, fetchCouponProductPage } from "../../lib/api/catalog";
import { formatPublishedDate } from "../../lib/format-date";
import type { CouponCategory, CouponProductSummary } from "../../types/catalog";
import type { NoticeSummary } from "../../types/customer-service";
import { ProductPriceDisplay } from "./ProductPriceDisplay";
import BrandUsageModal from "./BrandUsageModal";

const PLANNED_BY_CODE: Partial<Record<CategoryId, boolean>> = Object.fromEntries(
  COUPON_CATEGORIES.map((c) => [c.id, c.planned]),
) as Partial<Record<CategoryId, boolean>>;

type HomeCatalogProps = {
  homeNotices?: NoticeSummary[];
  homeNoticesError?: string | null;
};

function plannedLabel(cat: CouponCategory): string {
  const p = PLANNED_BY_CODE[cat.code as CategoryId];
  return p ? `${cat.label} (예정)` : cat.label;
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
  const isEmptyCategory = products.length === 0;

  return (
    <div className="container">
      <section className="main-visual">
        <article className="main-banner">
          <div className="main-slider">
            <div className="slide-track">
              <div className="slide-item">
                <span className="slide-tag">CINEPARK COUPON</span>
                <h1>토탈쿠폰으로 바로 사용</h1>
                <p>결제 후 쿠폰번호로 제휴 브랜드 채널에서 이용하세요.</p>
              </div>
              <div className="slide-item">
                <span className="slide-tag">PAYMENT</span>
                <h1>PortOne · TossPayments 결제 지원</h1>
                <p>주문·결제 상태와 결제금액을 화면에서 확인합니다.</p>
              </div>
              <div className="slide-item">
                <span className="slide-tag">SIMPLE</span>
                <h1>알림 없이 화면에서 바로 확인</h1>
                <p>주문완료와 마이페이지에서 쿠폰번호를 확인할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </article>

        <div className="side-banner-stack">
          <article className="side-banner small">
            <span className="badge-blue">EVENT</span>
            <p>오픈 기념 이벤트 진행 중</p>
          </article>
          <article className="side-banner small">
            <span className="badge-blue">GUIDE</span>
            <p>구매부터 사용까지 한눈에</p>
          </article>
          <article className="side-banner small">
            <span className="badge-blue">SAFE</span>
            <p>결제 데이터 안전 보관</p>
          </article>
          <article className="side-banner small">
            <span className="badge-blue">FAQ</span>
            <p>자주 묻는 질문 보기</p>
          </article>
        </div>
      </section>

      <section className="category-tiles-section" aria-label="카테고리 선택">
        <div className="category-tiles">
          {categoryTiles.map((cat) => {
            const selected = cat.code === category;
            const planned = PLANNED_BY_CODE[cat.code as CategoryId] === true;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-tile ${selected ? "selected" : ""} ${planned ? "planned" : ""}`}
                onClick={() => setCategory(cat.code)}
                aria-pressed={selected}
              >
                <span className="category-tile-inner">
                  <span className="category-tile-label">{plannedLabel(cat)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {loadErr ? (
        <p className="card-inline-msg" role="alert">
          {loadErr}
        </p>
      ) : null}

      {!isEmptyCategory ? (
        <>
          <section className="section" id="hot-deal">
            <div className="section-head">
              <h2>
                <span className="muted-label">{catMeta?.label ?? ""}</span>{" "}
                <span className="eng">Hot Deal</span>
              </h2>
            </div>
            <ul className="product-grid">
              {products.slice(0, 6).map((p) => (
                <li key={p.productCode} className="product-card">
                  <Link href={`/coupons/${p.productCode}`} className="product-card-top">
                    <div className="product-image">
                      {p.mainImageUrl ? (
                        <img src={p.mainImageUrl} alt="" className="product-thumb-cover" />
                      ) : (
                        "CINE"
                      )}
                    </div>
                  </Link>
                  <div className="product-meta">
                    <Link href={`/coupons/${p.productCode}`} className="product-meta-link">
                      <span className="product-brand">{p.brandLabel}</span>
                      <p className="product-name">{p.name}</p>
                    </Link>
                    <ProductPriceDisplay unitPrice={p.unitPrice} originPrice={p.originPrice} layout="card" />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="section best-section">
            <div className="section-head">
              <h2>
                {catMeta?.label ?? "카테고리"} <span className="eng">BEST</span>
              </h2>
            </div>
            <ul className="product-grid">
              {products.map((p, idx) => (
                <li key={`${p.productCode}-best`} className="product-card">
                  <Link href={`/coupons/${p.productCode}`} className="product-card-top">
                    <div className="product-image">
                      {idx < 5 ? <span className="rank-badge">{idx + 1}</span> : null}
                      {p.mainImageUrl ? (
                        <img src={p.mainImageUrl} alt="" className="product-thumb-cover" />
                      ) : (
                        "CINE"
                      )}
                    </div>
                  </Link>
                  <div className="product-meta">
                    <Link href={`/coupons/${p.productCode}`} className="product-meta-link">
                      <span className="product-brand">{p.brandLabel}</span>
                      <p className="product-name">{p.name}</p>
                    </Link>
                    <ProductPriceDisplay unitPrice={p.unitPrice} originPrice={p.originPrice} layout="card" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <section className="section category-planned-block" aria-live="polite">
          <div className="panel flat planned-category-panel">
            <h2 className="planned-category-title">{catMeta ? plannedLabel(catMeta) : category}</h2>
            <p className="planned-category-lead">이 카테고리에 판매 중인 상품이 없습니다.</p>
            <p className="muted">다른 카테고리를 선택하거나 잠시 후 다시 확인해 주세요.</p>
          </div>
        </section>
      )}

      <section className="section guide-section">
        <article className="guide-card">
          <h3>회원 가입 안내</h3>
          <p>회원가입 후 마이페이지에서 구매 내역과 쿠폰번호를 확인할 수 있습니다.</p>
          <Link href="/signup" className="guide-link">
            회원 가입 안내 페이지로 이동
          </Link>
        </article>
        <article className="guide-card">
          <h3>쿠폰 사용 안내</h3>
          <p>
            결제 완료 후 쿠폰번호가 발급되면, 상품에 등록된 제휴 사이트에서 사용하실 수 있습니다. 링크가 등록된 브랜드만
            아래에서 선택됩니다.
          </p>
          <button type="button" className="guide-link" onClick={() => setUsageModalOpen(true)}>
            사용하러 가기
          </button>
        </article>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>공지사항</h2>
        </div>
        {homeNoticesError ? (
          <p className="card-inline-msg" role="alert">
            {homeNoticesError}
          </p>
        ) : null}
        {homeNotices.length === 0 && !homeNoticesError ? (
          <p className="muted">등록된 공지가 없습니다.</p>
        ) : null}
        {homeNotices.length > 0 ? (
          <ul className="notice-list">
            {homeNotices.map((n) => (
              <li key={n.id} className={n.pinned ? "emph" : undefined}>
                <Link href={`/notice/${n.id}`} className="notice-list-row">
                  <span className="notice-text">
                    {n.category ? `${n.category} ${n.title}` : n.title}
                  </span>
                  <span className="notice-date">{formatPublishedDate(n.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="service-link">
        <Link href="/service">서비스 안내</Link>
        <Link href="/cases">활용사례</Link>
        <Link href="/faq">자주하는 질문</Link>
        <Link href="/inquiry">1:1 문의</Link>
        <Link href="/notice">공지사항</Link>
      </section>

      <BrandUsageModal open={usageModalOpen} onClose={() => setUsageModalOpen(false)} />
    </div>
  );
}
