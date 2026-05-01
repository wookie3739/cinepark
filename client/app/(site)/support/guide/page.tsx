import Link from "next/link";

export default function SupportGuidePage() {
  return (
    <>
      <nav className="support-breadcrumb">
        <Link href="/">홈</Link>
        <span className="sep"> / </span>
        <Link href="/support">고객센터</Link>
        <span className="sep"> / </span>
        <span>이용안내</span>
      </nav>

      <h1 className="static-title" style={{ marginTop: 0 }}>
        이용안내
      </h1>
      <p className="static-lead">
        CINEPARK COUPON은 토탈쿠폰을 결제 후 마이페이지에서 확인하고, 예매 단계에서는 시네파크 예매 채널로 연결하는 구조를 목표로 합니다.
      </p>

      <section className="static-section">
        <h2 className="static-h2">이용 흐름</h2>
        <ol className="static-ordered">
          <li>회원가입 후 상품 상세에서 수량을 선택합니다.</li>
          <li>장바구니 또는 바로 구매로 결제 단계로 이동합니다.</li>
          <li>결제 완료 후 주문번호와 쿠폰번호가 화면에 표시됩니다.</li>
          <li>시네파크 예매 사이트에서 쿠폰번호를 사용해 예매를 진행합니다.</li>
        </ol>
      </section>

      <section className="static-section">
        <h2 className="static-h2">결제</h2>
        <p>TossPayments 연동을 전제로 한 화면입니다. 실제 승인·취소는 PG 정책 및 운영 설정에 따릅니다.</p>
      </section>

      <div className="static-cta-row">
        <Link href="/support/faq" className="button secondary">
          자주 묻는 질문
        </Link>
        <Link href="/support/inquiry" className="button secondary">
          1:1 문의
        </Link>
      </div>
    </>
  );
}
