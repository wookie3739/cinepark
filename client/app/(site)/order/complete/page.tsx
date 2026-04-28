import Link from "next/link";

const mockOrderBase = {
  orderNo: "CP-20260428-00001",
  externalOrderNo: "PORTONE-9A8B7C6D",
  couponCode: "CINE-ABCD-1234",
  paidAt: "2026-04-28 19:00:00",
};

type Props = {
  searchParams?: Promise<{ amount?: string }>;
};

export default async function OrderCompletePage(props: Props) {
  let paidAmount = 50_000;
  const sp = props.searchParams ? await props.searchParams : {};
  const rawAmount = typeof sp.amount === "string" ? Number.parseInt(sp.amount, 10) : NaN;

  if (Number.isFinite(rawAmount) && rawAmount >= 1) {
    paidAmount = rawAmount;
  }

  const paymentLabel = `${paidAmount.toLocaleString()}원`;

  return (
    <main className="page">
      <div className="container">
        <section className="panel">
          <h2>주문이 완료되었습니다</h2>
          <div className="price-row">
            <span>주문번호</span>
            <strong>{mockOrderBase.orderNo}</strong>
          </div>
          <div className="price-row">
            <span>외부주문번호</span>
            <strong>{mockOrderBase.externalOrderNo}</strong>
          </div>
          <div className="price-row">
            <span>결제상태</span>
            <strong>PAID</strong>
          </div>
          <div className="price-row">
            <span>주문상태</span>
            <strong>COMPLETED</strong>
          </div>
          <div className="price-row">
            <span>결제금액</span>
            <strong>{paymentLabel}</strong>
          </div>
          <div className="price-row">
            <span>결제시각</span>
            <strong>{mockOrderBase.paidAt}</strong>
          </div>
          <p className="muted">구매한 쿠폰번호</p>
          <div className="coupon-code">{mockOrderBase.couponCode}</div>
          <div className="button-row">
            <a href="https://cinepark.kr/" className="button">
              사용하러 가기
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
