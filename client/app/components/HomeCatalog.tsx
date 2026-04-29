"use client";

import Link from "next/link";
import { useState } from "react";
import { COUPON_CATEGORIES, type CategoryId } from "../../lib/coupon-brands-catalog";
import { DEFAULT_COUPON_ID } from "../../lib/coupon-products";
import { formatPublishedDate } from "../../lib/format-date";
import type { NoticeSummary } from "../../types/customer-service";
import {
  movieHotDeal,
  movieNewProducts,
  movieRanking,
  movieWeeklyBest,
} from "../../lib/home-movie-catalog";

const couponHref = `/coupons/${DEFAULT_COUPON_ID}`;

type HomeCatalogProps = {
  homeNotices?: NoticeSummary[];
  homeNoticesError?: string | null;
};

function categoryLabel(cat: (typeof COUPON_CATEGORIES)[number]) {
  return cat.planned ? `${cat.label} (예정)` : cat.label;
}

export default function HomeCatalog({ homeNotices = [], homeNoticesError = null }: HomeCatalogProps) {
  const [category, setCategory] = useState<CategoryId>("movie");
  const isMovieActive = category === "movie";

  return (
    <div className="container">
      <section className="main-visual">
        <article className="main-banner">
          <div className="main-slider">
            <div className="slide-track">
              <div className="slide-item">
                <span className="slide-tag">CINEPARK COUPON</span>
                <h1>토탈쿠폰으로 바로 사용</h1>
                <p>결제 후 쿠폰번호로 제휴 브랜드 채널에서 이용하세요. (씨네파크 연동 목업)</p>
              </div>
              <div className="slide-item">
                <span className="slide-tag">PAYMENT</span>
                <h1>PortOne · TossPayments 결제 지원</h1>
                <p>주문/결제 상태, 외부주문번호, 결제금액을 화면에서 확인합니다.</p>
              </div>
              <div className="slide-item">
                <span className="slide-tag">SIMPLE</span>
                <h1>알림 없이 화면에서 바로 확인</h1>
                <p>주문완료와 마이페이지에서 쿠폰번호를 즉시 확인할 수 있습니다.</p>
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
          {COUPON_CATEGORIES.map((cat) => {
            const selected = cat.id === category;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-tile ${selected ? "selected" : ""} ${cat.planned ? "planned" : ""}`}
                onClick={() => setCategory(cat.id)}
                aria-pressed={selected}
              >
                <span className="category-tile-inner">
                  <span className="category-tile-label">{categoryLabel(cat)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {isMovieActive ? (
        <>
          <section className="section" id="hot-deal">
            <div className="section-head">
              <h2>
                <span className="muted-label">영화관</span>{" "}
                <span className="eng">Hot Deal</span>
              </h2>
            </div>
            <ul className="product-grid">
              {movieHotDeal.map((p, idx) => (
                <li key={idx} className="product-card">
                  <Link href={couponHref} className="product-card-top">
                    <div className="product-image">CINE</div>
                  </Link>
                  <div className="product-meta">
                    <Link href={couponHref} className="product-meta-link">
                      <span className="product-brand">{p.brand}</span>
                      <p className="product-name">{p.name}</p>
                    </Link>
                    <p className="price-block">
                      <span className="sale">{p.sale}</span>
                      <span className="unit">원</span>
                      <em className="origin">{p.origin}원</em>
                    </p>
                    <p className="product-desc">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="section best-section">
            <div className="section-head">
              <h2>
                영화관 토탈쿠폰 주간 <span className="eng">BEST</span>
              </h2>
            </div>
            <ul className="product-grid">
              {movieWeeklyBest.map((p, idx) => (
                <li key={idx} className="product-card">
                  <Link href={couponHref} className="product-card-top">
                    <div className="product-image">
                      <span className="rank-badge">{p.rank}</span>CINE
                    </div>
                  </Link>
                  <div className="product-meta">
                    <Link href={couponHref} className="product-meta-link">
                      <span className="product-brand">{p.brand}</span>
                      <p className="product-name">{p.name}</p>
                    </Link>
                    <p className="price-block">
                      <span className="sale">{p.sale}</span>
                      <span className="unit">원</span>
                      <em className="origin">{p.origin}원</em>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="section">
            <div className="section-head">
              <h2>영화관 토탈쿠폰 신상</h2>
            </div>
            <ul className="product-grid grid-3">
              {movieNewProducts.map((p, idx) => (
                <li key={idx} className="product-card">
                  <Link href={couponHref} className="product-card-top">
                    <div className="product-image">CINE</div>
                  </Link>
                  <div className="product-meta">
                    <Link href={couponHref} className="product-meta-link">
                      <span className="product-brand">{p.brand}</span>
                      <p className="product-name">{p.name}</p>
                    </Link>
                    <p className="price-block">
                      <span className="sale">{p.sale}</span>
                      <span className="unit">원</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="section">
            <div className="section-head">
              <h2>이달의 관심상품 순위 (영화관)</h2>
            </div>
            <ul className="ranking-list">
              {movieRanking.map((r) => (
                <li key={r.rank}>
                  <strong className="ranking-num">{r.rank}</strong>
                  <Link href={couponHref} className="ranking-thumb ranking-thumb-link">
                    CINE
                  </Link>
                  <div className="ranking-meta">
                    <span className="product-brand">CINEPARK</span>
                    <Link href={couponHref} className="ranking-name-link">
                      <p className="product-name">{r.name}</p>
                    </Link>
                    <p className="price-block">
                      <span className="sale">{r.price}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <section className="section category-planned-block" aria-live="polite">
          <div className="panel flat planned-category-panel">
            <h2 className="planned-category-title">{categoryLabel(getCategory(category))}</h2>
            <p className="planned-category-lead">이 카테고리 상품은 준비 중입니다.</p>
            <p className="muted">브랜드 제휴 확대 시 순차 오픈 예정 목업입니다. 영화관(씨네파크) 카테고리를 선택해 현재 상품을 확인해 주세요.</p>
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
          <p>PortOne · TossPayments로 결제 후, 활성 브랜드의 사용 채널에서 이용하세요. (목업에서는 씨네파크만 연결)</p>
          <a href="https://cinepark.kr/" target="_blank" rel="noreferrer" className="guide-link">
            사용 채널로 이동 (씨네파크)
          </a>
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
    </div>
  );
}

function getCategory(id: CategoryId) {
  const c = COUPON_CATEGORIES.find((x) => x.id === id);
  if (!c) return COUPON_CATEGORIES[0];
  return c;
}
