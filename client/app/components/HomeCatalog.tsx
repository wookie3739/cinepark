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
    <div className="container landing-mall">
      <div className="landing-mall-topbar">
        <span>이용·환불 규정은 제휴 영화관 안내를 꼭 확인해 주세요.</span>
        <Link href="/service">이용안내 보기</Link>
      </div>

      <section className="landing-mall-hero" aria-labelledby="lm-hero-title">
        <div className="landing-mall-hero-inner">
          <div className="landing-mall-hero-copy">
            <span className="landing-mall-badge">영화관 제휴 할인 쿠폰</span>
            <h1 id="lm-hero-title">
              자주 가는 극장, <em>골라 담아 바로 결제</em>
            </h1>
            <p>
              결제가 완료되면 쿠폰 번호가 발급됩니다. 각 영화관에서 안내하는 방법대로 모바일 앱이나 현장에서 사용할 수
              있습니다.
            </p>
            <div className="landing-mall-hero-buttons">
              <Link href="/coupons" className="button">
                쿠폰 마켓 가기
              </Link>
              <a href="#lm-benefits" className="button secondary">
                구매 전 읽어보기
              </a>
            </div>
          </div>
          <aside className="landing-mall-hero-panel" aria-label="이용 요약">
            <h2>이용 요약</h2>
            <ul>
              <li>결제 직후 쿠폰 번호가 발급됩니다.</li>
              <li>앱·매표소 등 극장 안내에 따라 사용합니다.</li>
              <li>유효기간·환불은 제휴 극장 정책을 따릅니다.</li>
            </ul>
            <Link href="/coupons" className="landing-mall-panel-cta">
              전체 상품 보기 →
            </Link>
          </aside>
        </div>
      </section>

      <nav className="landing-mall-quick" aria-label="빠른 이동">
        <Link href="/coupons">쿠폰 마켓</Link>
        <Link href="/service">이용안내</Link>
        <Link href="/support">고객센터</Link>
        <Link href="/faq">자주 묻는 질문</Link>
        <Link href="/notice">공지사항</Link>
      </nav>

      <section className="landing-mall-strip" id="lm-benefits">
        <div className="landing-mall-strip-head">
          <h2>구매 전 알아두면 좋은 점</h2>
          <p>금액·발급·환불은 아래 세 가지만 기억해 두시면 됩니다.</p>
        </div>
        <div className="landing-mall-strip-grid">
          <div className="landing-mall-strip-cell">
            <span className="landing-mall-strip-num">01 가격</span>
            <strong>상품마다 할인가가 달라요</strong>
            <p>극장·상품에 따라 조건이 다릅니다. 상세 페이지에서 반드시 확인해 주세요.</p>
          </div>
          <div className="landing-mall-strip-cell">
            <span className="landing-mall-strip-num">02 발급</span>
            <strong>번호는 결제 직후에 나옵니다</strong>
            <p>로그인 후 마이페이지의 주문 내역에서도 다시 확인할 수 있습니다.</p>
          </div>
          <div className="landing-mall-strip-cell">
            <span className="landing-mall-strip-num">03 규정</span>
            <strong>환불·유효기간은 극장 정책</strong>
            <p>예매 취소 등 세부 사항은 제휴 영화관 규정이 우선입니다. 문의는 FAQ·1:1을 이용해 주세요.</p>
          </div>
        </div>
      </section>

      <div className="landing-mall-main">
        <section className="category-tiles-section landing-mall-cats" aria-label="카테고리 선택">
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

        <section className="landing-mall-hot" id="hot-deals" aria-labelledby="lm-hot-title">
          <div className="landing-mall-hot-head">
            <div>
              <h2 id="lm-hot-title">
                <span>추천</span> 상품
              </h2>
              <p>
                <span className="muted-label">{catMeta?.label ?? "카테고리"}</span> · 위에서 선택한 분류의 일부입니다.
              </p>
            </div>
            {hasAnyProducts ? (
              <Link href="/coupons" className="landing-mall-more">
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
            <ul className="product-grid landing-mall-grid4">
              {hotDeals.map((p) => (
                <li key={p.productCode} className="product-card landing-mall-card">
                  <Link href={`/coupons/${p.productCode}`} className="product-card-top">
                    <div className="product-image">
                      {p.mainImageUrl ? <img src={p.mainImageUrl} alt="" className="product-thumb-cover" /> : "CINE"}
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
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="landing-mall-steps" aria-labelledby="lm-steps-title">
        <div className="landing-mall-steps-head">
          <h2 id="lm-steps-title">이용 순서</h2>
          <p>고르고 → 결제하고 → 극장에서 사용하기</p>
        </div>
        <ol className="landing-mall-steps-flow">
          <li>
            <div className="landing-mall-step-num">1</div>
            <strong>쿠폰 선택</strong>
            <p>브랜드와 금액에 맞는 상품을 고릅니다.</p>
          </li>
          <li>
            <div className="landing-mall-step-num">2</div>
            <strong>결제</strong>
            <p>완료 즉시 쿠폰 번호가 표시됩니다.</p>
          </li>
          <li>
            <div className="landing-mall-step-num">3</div>
            <strong>사용</strong>
            <p>극장이 안내하는 앱·현장 절차에 맞춰 입력합니다.</p>
          </li>
        </ol>
      </section>

      <section className="landing-mall-cta">
        <h2>
          회원가입 후
          <br />
          주문·쿠폰 번호를 한곳에서
        </h2>
        <p>로그인하면 마이페이지에서 지난 구매와 발급 번호를 다시 열어볼 수 있습니다.</p>
        <Link href="/signup" className="button secondary">
          회원가입
        </Link>
      </section>

      <section className="section guide-section landing-mall-guides">
        <article className="guide-card">
          <h3>회원가입</h3>
          <p>이메일로 가입하면 주문·쿠폰 번호를 한곳에서 다시 확인할 수 있습니다.</p>
          <Link href="/signup" className="guide-link">
            가입 화면으로
          </Link>
        </article>
        <article className="guide-card">
          <h3>브랜드별 사용법</h3>
          <p>극장마다 앱·키오스크 절차가 조금씩 다릅니다. 모달에서 요약을 확인하세요.</p>
          <button type="button" className="guide-link" onClick={() => setUsageModalOpen(true)}>
            사용 안내 열기
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

      <nav className="landing-mall-service" aria-label="고객 지원">
        <Link href="/service">서비스 안내</Link>
        <Link href="/cases">활용 사례</Link>
        <Link href="/faq">자주 묻는 질문</Link>
        <Link href="/inquiry">1:1 문의</Link>
        <Link href="/notice">공지사항</Link>
      </nav>

      <BrandUsageModal open={usageModalOpen} onClose={() => setUsageModalOpen(false)} />
    </div>
  );
}
