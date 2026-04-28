import Link from "next/link";

export default function TotacouponIntroPage() {
  return (
    <main className="page">
      <div className="container narrow-page">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>토탈쿠폰 소개</strong>
        </nav>

        <article className="static-article panel flat">
          <h1 className="static-title">토탈쿠폰이란</h1>
          <p className="static-lead">
            토탈쿠폰은 업력 6년의 이커머스 운영대행 서비스에서 검증된 노하우로 만들어진, 신뢰할 수 있는 쿠폰·판매 플로우입니다.
            온라인에서 쿠폰을 안전하게 구매하고, 결제 후 발급된 쿠폰번호로 시네파크 예매까지 이어갈 수 있도록 구성되어 있습니다.
          </p>

          <h2 className="static-h2">운영 방향</h2>
          <ul className="static-list">
            <li>고정 구독료 없이 부담 없이 시작할 수 있는 온라인 판매 구조</li>
            <li>수익 쉐어 기반의 올인원 운영 파트너십으로 지속적인 운영 지원</li>
            <li>주문·결제·쿠폰 발급 흐름을 한곳에서 설계할 수 있는 목업 환경</li>
          </ul>

          <p className="muted small-print">
            본 소개 페이지는 목업입니다. 실제 약관·운영 조건은 서비스 오픈 시 안내됩니다.
          </p>

          <div className="static-cta-row">
            <Link href="/coupons/total-1" className="button">
              토탈쿠폰 구매하기
            </Link>
            <Link href="/service" className="button secondary">
              서비스 안내
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
