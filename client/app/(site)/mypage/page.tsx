const purchasedCoupons = [
  {
    orderNo: "CP-20260428-00001",
    productName: "씨네쿠폰 1매",
    amount: 50000,
    couponCode: "CINE-ABCD-1234",
    purchasedAt: "2026-04-28 19:00:00",
  },
];

export default function MyPage() {
  return (
    <main className="page">
      <div className="container">
        <section className="panel">
          <h2>마이페이지 - 구매한 쿠폰 조회</h2>
          <table className="table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>상품명</th>
                <th>결제금액</th>
                <th>쿠폰번호</th>
                <th>구매일시</th>
              </tr>
            </thead>
            <tbody>
              {purchasedCoupons.map((item) => (
                <tr key={item.orderNo}>
                  <td>{item.orderNo}</td>
                  <td>{item.productName}</td>
                  <td>{item.amount.toLocaleString()}원</td>
                  <td>
                    <span className="badge">{item.couponCode}</span>
                  </td>
                  <td>{item.purchasedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">환불 관련 처리는 본 사이트에서 제공하지 않습니다.</p>
        </section>
      </div>
    </main>
  );
}
