import Link from "next/link";

const cases = [
  {
    title: "영화관 단체·제휴 행사",
    body: "제휴 채널에서 토탈쿠폰을 구매·배포하고, 수령자가 예매 단계에서 직접 사용하는 흐름을 시뮬레이션합니다.",
  },
  {
    title: "사내 복지 포인트 연계",
    body: "복지몰과 연동해 쿠폰형 상품으로 노출하는 시나리오를 가정한 목업입니다.",
  },
  {
    title: "소규모 프로모션",
    body: "기간 한정 프로모션용으로 쿠폰 수량을 제한해 판매하는 예시 화면과 연계할 수 있습니다.",
  },
];

export default function UseCasesPage() {
  return (
    <main className="page">
      <div className="container narrow-page">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>활용사례</strong>
        </nav>

        <article className="static-article panel flat">
          <h1 className="static-title">활용사례</h1>
          <p className="static-lead">
            아래는 토탈쿠폰을 도입할 때 참고할 수 있는 대표 시나리오입니다. 실제 도입 시에는 계약·정산 방식에 맞춰 조정합니다.
          </p>

          <ul className="case-cards">
            {cases.map((c) => (
              <li key={c.title} className="case-card">
                <h2 className="case-card-title">{c.title}</h2>
                <p className="case-card-body">{c.body}</p>
              </li>
            ))}
          </ul>

          <div className="static-cta-row">
            <Link href="/service" className="button secondary">
              서비스 안내
            </Link>
            <Link href="/inquiry" className="button secondary">
              도입 문의
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
