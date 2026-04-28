const mockOrders = [
  { id: "CP-20260428-00001", pg: "PORTONE-xxxx", buyer: "user@example.com", amount: 50000, status: "결제완료", coupon: "TOT-xxxx-9001", date: "2026.04.28 19:00" },
  { id: "CP-20260428-00002", pg: "TOSS-yyyy", buyer: "other@example.com", amount: 50000, status: "결제완료", coupon: "TOT-xxxx-9002", date: "2026.04.28 18:42" },
  { id: "CP-20260427-00099", pg: "PORTONE-zzzz", buyer: "test@example.com", amount: 50000, status: "취소", coupon: "-", date: "2026.04.27 09:15" },
];

export default function AdminOrdersPage() {
  return (
    <>
      <header className="admin-page-head">
        <h1>주문내역</h1>
        <p>외부결제번호, 주문상태, 쿠폰 배정 여부 목업입니다.</p>
      </header>

      <div className="admin-toolbar">
        <input type="search" className="admin-search-input" placeholder="주문번호, 이메일 검색..." />
        <select className="admin-select">
          <option value="">전체 상태</option>
          <option value="paid">결제완료</option>
          <option value="cancel">취소</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>주문번호</th>
              <th>PG 주문번호</th>
              <th>회원 이메일</th>
              <th>금액</th>
              <th>상태</th>
              <th>배정 쿠폰</th>
              <th>일시</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.pg}</td>
                <td>{o.buyer}</td>
                <td>{o.amount.toLocaleString()}원</td>
                <td>{o.status}</td>
                <td>{o.coupon}</td>
                <td>{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
