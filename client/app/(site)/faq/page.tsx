import Link from "next/link";

const faqItems = [
  {
    q: "결제 후 쿠폰번호는 어디서 보나요?",
    a: "주문 완료 화면과 마이페이지의 구매 내역에서 확인할 수 있도록 설계한 목업입니다.",
  },
  {
    q: "환불은 가능한가요?",
    a: "운영 정책에 따라 상이하며, 본 목업에서는 별도 환불 프로세스를 제공하지 않습니다.",
  },
  {
    q: "쿠폰은 어디서 사용하나요?",
    a: "브랜드별 사용 채널이 다릅니다. GNB에서 ‘사용하러 가기’를 눌러 브랜드 목록 모달을 연 뒤 씨네파크를 선택하면 이동합니다(목업).",
  },
  {
    q: "법인·대량 구매도 되나요?",
    a: "별도 협의가 필요할 수 있습니다. 1:1 문의를 남겨 주시면 안내드리겠습니다.",
  },
];

export default function FaqPage() {
  return (
    <main className="page">
      <div className="container narrow-page">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>자주하는 질문</strong>
        </nav>

        <article className="static-article panel flat">
          <h1 className="static-title">자주하는 질문</h1>
          <dl className="faq-list">
            {faqItems.map((item) => (
              <div key={item.q} className="faq-item">
                <dt className="faq-q">{item.q}</dt>
                <dd className="faq-a">{item.a}</dd>
              </div>
            ))}
          </dl>

          <p className="muted small-print">추가 문의는 1:1 문의 게시판을 이용해 주세요.</p>
          <div className="static-cta-row">
            <Link href="/inquiry" className="button">
              1:1 문의하기
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
