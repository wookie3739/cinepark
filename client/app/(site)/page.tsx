import Link from "next/link";
import NoticeModal from "../components/NoticeModal";

const hotDeal = [
  { brand: "CINEPARK", name: "토탈쿠폰 1매", rate: 0, sale: "50,000", origin: "50,000", desc: "영화 예매 전용 쿠폰" },
  { brand: "CINEPARK", name: "토탈쿠폰 1매", rate: 0, sale: "50,000", origin: "50,000", desc: "결제 후 마이페이지 노출" },
  { brand: "CINEPARK", name: "토탈쿠폰 1매", rate: 0, sale: "50,000", origin: "50,000", desc: "예매 사이트 연동형" },
  { brand: "CINEPARK", name: "토탈쿠폰 1매", rate: 0, sale: "50,000", origin: "50,000", desc: "재고 자동 배정" },
  { brand: "CINEPARK", name: "토탈쿠폰 1매", rate: 0, sale: "50,000", origin: "50,000", desc: "PortOne/Toss 결제" },
  { brand: "CINEPARK", name: "토탈쿠폰 1매", rate: 0, sale: "50,000", origin: "50,000", desc: "단일 상품 운영" },
];

const weeklyBest = [
  { brand: "CINEPARK", name: "토탈쿠폰 1매", rank: 1, sale: "50,000", origin: "50,000" },
  { brand: "CINEPARK", name: "토탈쿠폰 1매", rank: 2, sale: "50,000", origin: "50,000" },
  { brand: "CINEPARK", name: "토탈쿠폰 1매", rank: 3, sale: "50,000", origin: "50,000" },
  { brand: "CINEPARK", name: "토탈쿠폰 1매", rank: 4, sale: "50,000", origin: "50,000" },
  { brand: "CINEPARK", name: "토탈쿠폰 1매", rank: 5, sale: "50,000", origin: "50,000" },
  { brand: "CINEPARK", name: "토탈쿠폰 1매", rank: 6, sale: "50,000", origin: "50,000" },
];

const newProducts = [
  { brand: "CINEPARK", name: "토탈쿠폰 1매", sale: "50,000" },
  { brand: "CINEPARK", name: "토탈쿠폰 1매", sale: "50,000" },
  { brand: "CINEPARK", name: "토탈쿠폰 1매", sale: "50,000" },
];

const ranking = [
  { rank: "01", name: "토탈쿠폰 1매", price: "50,000원" },
  { rank: "02", name: "토탈쿠폰 1매", price: "50,000원" },
  { rank: "03", name: "토탈쿠폰 1매", price: "50,000원" },
];

const notices = [
  { date: "2026.04.28", text: "[공지] 토탈쿠폰 구매 사이트 OPEN 안내", emph: true },
  { date: "2026.04.28", text: "[공지] 결제 완료 후 환불 미제공 정책 안내", emph: true },
  { date: "2026.04.20", text: "[안내] 마이페이지에서 쿠폰번호 확인 방법" },
  { date: "2026.04.15", text: "[안내] 시네파크 예매 연동 안내" },
  { date: "2026.04.10", text: "[안내] 결제 수단 PortOne / Toss 안내" },
];

export default function HomePage() {
  return (
    <main className="page">
      <NoticeModal />

      <div className="container">
        <section className="main-visual">
          <article className="main-banner">
            <div className="main-slider">
              <div className="slide-track">
                <div className="slide-item">
                  <span className="slide-tag">CINEPARK COUPON</span>
                  <h1>토탈쿠폰 한 장으로 영화 예매까지</h1>
                  <p>결제 후 쿠폰번호를 확인하고 시네파크에서 바로 예매하세요.</p>
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
            <div className="main-banner-cta">
              <Link href="/order/complete" className="button">
                결제하기(목업)
              </Link>
              <a
                href="https://cinepark.kr/"
                className="button secondary"
                target="_blank"
                rel="noreferrer"
              >
                예매하러 가기
              </a>
            </div>
          </article>

          <div className="side-banner-stack">
            <article className="side-banner small">
              <span className="badge-blue">EVENT</span>
              <p>오픈 기념 이벤트 진행 중</p>
            </article>
            <article className="side-banner small">
              <span className="badge-blue">GUIDE</span>
              <p>구매부터 예매까지 한눈에</p>
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

        <section className="section" id="hot-deal">
          <div className="section-head">
            <h2>
              <span className="eng">Hot Deal</span>
            </h2>
          </div>
          <ul className="product-grid">
            {hotDeal.map((p, idx) => (
              <li key={idx} className="product-card">
                <div className="product-image">CINE</div>
                <div className="product-meta">
                  <span className="product-brand">{p.brand}</span>
                  <p className="product-name">{p.name}</p>
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
              토탈쿠폰 주간 <span className="eng">BEST</span>
            </h2>
          </div>
          <ul className="product-grid">
            {weeklyBest.map((p, idx) => (
              <li key={idx} className="product-card">
                <div className="product-image">
                  <span className="rank-badge">{p.rank}</span>
                  CINE
                </div>
                <div className="product-meta">
                  <span className="product-brand">{p.brand}</span>
                  <p className="product-name">{p.name}</p>
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
            <h2>토탈쿠폰 신상</h2>
          </div>
          <ul className="product-grid grid-3">
            {newProducts.map((p, idx) => (
              <li key={idx} className="product-card">
                <div className="product-image">CINE</div>
                <div className="product-meta">
                  <span className="product-brand">{p.brand}</span>
                  <p className="product-name">{p.name}</p>
                  <p className="price-block">
                    <span className="sale">{p.sale}</span>
                    <span className="unit">원</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="section theme-section">
          <div className="section-head">
            <h2>
              테마 <span className="eng">SHOP</span>
            </h2>
          </div>
          <div className="theme-tabs">
            <button type="button" className="theme-tab active">
              ▶ 토탈쿠폰 기본권
            </button>
            <button type="button" className="theme-tab">
              ▶ 프로모션용 (예정)
            </button>
            <button type="button" className="theme-tab">
              ▶ 대량 구매 (예정)
            </button>
            <button type="button" className="theme-tab">
              ▶ 선물용 (예정)
            </button>
          </div>
          <ul className="product-grid grid-3">
            {newProducts.map((p, idx) => (
              <li key={idx} className="product-card">
                <div className="product-image">CINE</div>
                <div className="product-meta">
                  <span className="product-brand">{p.brand}</span>
                  <p className="product-name">{p.name}</p>
                  <p className="price-block">
                    <span className="sale">{p.sale}</span>
                    <span className="unit">원</span>
                  </p>
                  <div className="card-actions">
                    <Link href="/order/complete" className="card-button">
                      바로구매 하기
                    </Link>
                    <button type="button" className="card-button outline">
                      관심상품 담기
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="section guide-section">
          <article className="guide-card">
            <h3>회원 가입 안내</h3>
            <p>회원가입 후 마이페이지에서 구매 내역과 쿠폰번호를 확인할 수 있습니다.</p>
            <Link href="/signup" className="guide-link">
              회원 가입 안내 페이지로 이동
            </Link>
          </article>
          <article className="guide-card">
            <h3>결제/예매 안내</h3>
            <p>PortOne · TossPayments로 결제 후, 시네파크에서 바로 예매하세요.</p>
            <a href="https://cinepark.kr/" target="_blank" rel="noreferrer" className="guide-link">
              예매 안내 페이지로 이동
            </a>
          </article>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>이달의 관심상품 순위</h2>
          </div>
          <ul className="ranking-list">
            {ranking.map((r) => (
              <li key={r.rank}>
                <strong className="ranking-num">{r.rank}</strong>
                <div className="ranking-thumb">CINE</div>
                <div className="ranking-meta">
                  <span className="product-brand">CINEPARK</span>
                  <p className="product-name">{r.name}</p>
                  <p className="price-block">
                    <span className="sale">{r.price}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>공지사항</h2>
          </div>
          <ul className="notice-list">
            {notices.map((n, idx) => (
              <li key={idx} className={n.emph ? "emph" : undefined}>
                <span className="notice-text">{n.text}</span>
                <span className="notice-date">{n.date}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="service-link">
          <Link href="/">서비스 안내</Link>
          <Link href="/">활용사례</Link>
          <Link href="/">자주하는 질문</Link>
          <Link href="/">1:1 문의</Link>
          <Link href="/">공지사항</Link>
        </section>
      </div>

      <aside className="quick-sidebar">
        <a href="https://cinepark.kr/" target="_blank" rel="noreferrer">
          예매 가기
        </a>
        <Link href="/mypage">내 쿠폰</Link>
        <Link href="/order/complete">주문 완료</Link>
        <a href="#top">TOP</a>
      </aside>
    </main>
  );
}
