import Link from "next/link";

const mockOrder = {
  orderNo: "CP-20260428-00001",
  externalOrderNo: "PORTONE-9A8B7C6D",
  amount: 50000,
  paymentStatus: "PAID",
  orderStatus: "COMPLETED",
  couponCode: "CINE-ABCD-1234",
  paidAt: "2026-04-28 19:00:00",
};

export default function OrderCompletePage() {
  return (
    <main className="page">
      <div className="container">
        <section className="panel">
          <h2>주문이 완료되었습니다</h2>
          <div className="price-row">
            <span>주문번호</span>
            <strong>{mockOrder.orderNo}</strong>
          </div>
          <div className="price-row">
            <span>외부주문번호</span>
            <strong>{mockOrder.externalOrderNo}</strong>
          </div>
          <div className="price-row">
            <span>결제상태</span>
            <strong>{mockOrder.paymentStatus}</strong>
          </div>
          <div className="price-row">
            <span>주문상태</span>
            <strong>{mockOrder.orderStatus}</strong>
          </div>
          <div className="price-row">
            <span>결제금액</span>
            <strong>{mockOrder.amount.toLocaleString()}원</strong>
          </div>
          <div className="price-row">
            <span>결제시각</span>
            <strong>{mockOrder.paidAt}</strong>
          </div>
          <p className="muted">구매한 쿠폰번호</p>
          <div className="coupon-code">{mockOrder.couponCode}</div>
          <div className="button-row">
            <a href="https://cinepark.kr/" className="button">
              예매하러 가기
            </a>
            <Link href="/mypage" className="button secondary">
              마이페이지에서 확인
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
