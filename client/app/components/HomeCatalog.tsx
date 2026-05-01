"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { COUPON_CATEGORIES, type CategoryId } from "../../lib/coupon-brands-catalog";
import { fetchCouponCategories, fetchCouponProductPage } from "../../lib/api/catalog";
import type { CouponCategory, CouponProductSummary } from "../../types/catalog";
import { ProductPriceDisplay } from "./ProductPriceDisplay";
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

  return (
    <div className="container landing-v2">
      <section className="landing-v2-hero">
        <div className="landing-v2-hero-text">
          <span className="landing-v2-pill">대한민국 No.1 영화 쿠폰 플랫폼</span>
          <h1>
            영화, 이제 가장
            <br />
            <span className="landing-v2-hero-accent">똑똑하게 즐기세요</span>
          </h1>
          <p>
            영화관 쿠폰을 최저가로 구매하고 즉시 사용하세요.
            <br />
            복잡한 예매 과정 없이 더 똑똑한 관람을 시작할 수 있습니다.
          </p>
          <div className="landing-v2-hero-actions">
            <Link href="/coupons" className="button">
              쿠폰 보러가기
            </Link>
            <a href="#benefits" className="button secondary landing-v2-btn-candy">
              혜택 보기
            </a>
          </div>
        </div>
        <div className="landing-v2-hero-media" aria-hidden="true">
          <img
            src="https://www.figma.com/api/mcp/asset/6f082ada-6154-4b6e-8f81-8e83f9ed3ecf"
            alt=""
            className="landing-v2-hero-image"
          />
        </div>
      </section>

      <section className="landing-v2-benefits" id="benefits">
        <div className="landing-v2-section-head">
          <h2>CineSave만의 특별함</h2>
          <p>가장 간편하고 저렴하게 영화를 즐기는 방법</p>
        </div>
        <div className="landing-v2-benefit-grid">
          <article className="landing-v2-benefit-card landing-v2-benefit-card--1">
            <div className="landing-v2-benefit-icon">%</div>
            <h3>압도적 할인율</h3>
            <p>영화관 직접 구매보다 더 저렴한 가격으로 영화 팬들의 지갑을 지켜드립니다.</p>
          </article>
          <article className="landing-v2-benefit-card landing-v2-benefit-card--2">
            <div className="landing-v2-benefit-icon">QR</div>
            <h3>간편한 사용</h3>
            <p>구매 즉시 쿠폰 번호 발급으로 현장 매표소와 온라인 앱에서 바로 이용 가능합니다.</p>
          </article>
          <article className="landing-v2-benefit-card landing-v2-benefit-card--3">
            <div className="landing-v2-benefit-icon">OK</div>
            <h3>신뢰할 수 있는 플랫폼</h3>
            <p>안정적인 결제 환경과 고객지원으로 안심하고 구매할 수 있습니다.</p>
          </article>
        </div>
      </section>

      <section className="category-tiles-section landing-v2-cats" aria-label="카테고리 선택">
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

      <section className="landing-v2-hot" id="hot-deals">
        <div className="landing-v2-hot-head">
          <div>
            <h2>
              <span className="landing-v2-title-gradient">실시간 인기 쿠폰</span>
            </h2>
            <p>
              <span className="muted-label">{catMeta?.label ?? "카테고리"}</span>
              지금 가장 많이 구매되고 있는 상품입니다.
            </p>
          </div>
          {hasAnyProducts ? (
            <Link href="/coupons" className="landing-v2-more">
              전체보기
            </Link>
          ) : null}
        </div>

        {!hasAnyProducts ? (
          <div className="panel flat planned-category-panel">
            <h2 className="planned-category-title">{catMeta ? plannedLabel(catMeta) : category}</h2>
            <p className="planned-category-lead">이 카테고리에 판매 중인 상품이 없습니다.</p>
            <p className="muted">다른 카테고리를 선택하거나 잠시 후 다시 확인해 주세요.</p>
          </div>
        ) : (
          <ul className="product-grid landing-v2-grid4">
            {hotDeals.map((p, idx) => {
              const chip =
                idx === 0 ? "hot" : idx === 1 ? "best" : idx === 2 ? "sale" : "new";
              const chipLabel = idx === 0 ? "HOT" : idx === 1 ? "BEST" : idx === 2 ? "SALE" : "NEW";
              return (
              <li key={p.productCode} className="product-card landing-v2-deal-card">
                <Link href={`/coupons/${p.productCode}`} className="product-card-top">
                  <div className="product-image">
                    {p.mainImageUrl ? <img src={p.mainImageUrl} alt="" className="product-thumb-cover" /> : "CINE"}
                    <span className={`landing-v2-chip landing-v2-chip--${chip}`}>{chipLabel}</span>
                  </div>
                </Link>
                <div className="product-meta">
                  <Link href={`/coupons/${p.productCode}`} className="product-meta-link">
                    <span className="product-brand">{p.brandLabel}</span>
                    <p className="product-name">{p.name}</p>
                  </Link>
                  <ProductPriceDisplay unitPrice={p.unitPrice} originPrice={p.originPrice} layout="card" />
                  <Link href={`/coupons/${p.productCode}`} className="card-button">
                    구매하기
                  </Link>
                </div>
              </li>
            );
            })}
          </ul>
        )}
      </section>

      <section className="landing-v2-steps">
        <div className="landing-v2-section-head">
          <h2>이용 방법</h2>
          <p>단 3단계로 끝나는 간편한 예매 프로세스</p>
        </div>
        <ol className="landing-v2-steps-list">
          <li>
            <div className="landing-v2-step-icon">1</div>
            <strong>쿠폰 선택</strong>
            <p>원하는 영화관과 할인 옵션을 선택하세요.</p>
          </li>
          <li>
            <div className="landing-v2-step-icon">2</div>
            <strong>결제 완료</strong>
            <p>다양한 결제 수단으로 구매 즉시 번호를 발급받습니다.</p>
          </li>
          <li>
            <div className="landing-v2-step-icon">3</div>
            <strong>번호 등록 및 예매</strong>
            <p>영화관 공식 앱에서 번호를 입력하고 예매하세요.</p>
          </li>
        </ol>
      </section>

      <section className="landing-v2-cta">
        <h2>
          지금 가입하고
          <br />
          멤버십 전용 혜택을 받으세요
        </h2>
        <p>첫 가입 고객에게 즉시 사용할 수 있는 혜택을 제공합니다. 가장 똑똑한 영화 관람을 시작해 보세요.</p>
        <Link href="/signup" className="button secondary">
          지금 바로 시작하기
        </Link>
      </section>

      <section className="section guide-section landing-v2-guides">
        <article className="guide-card">
          <h3>회원 가입 안내</h3>
          <p>회원가입 후 마이페이지에서 구매 내역과 쿠폰번호를 확인할 수 있습니다.</p>
          <Link href="/signup" className="guide-link">
            회원 가입 안내 페이지로 이동
          </Link>
        </article>
        <article className="guide-card">
          <h3>쿠폰 사용 안내</h3>
          <p>결제 후 발급된 쿠폰번호로 제휴처에서 바로 이용 가능합니다.</p>
          <button type="button" className="guide-link" onClick={() => setUsageModalOpen(true)}>
            사용하러 가기
          </button>
        </article>
      </section>

      {(homeNotices.length > 0 || homeNoticesError) && (
        <section className="section">
          <div className="section-head">
            <h2>공지사항</h2>
          </div>
          {homeNoticesError ? <p className="card-inline-msg">{homeNoticesError}</p> : null}
          {homeNotices.length > 0 ? (
            <Link href="/notice" className="button secondary">
              공지 전체 보기
            </Link>
          ) : null}
        </section>
      )}

      <section className="service-link landing-v2-service-strip">
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
