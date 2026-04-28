const mockCoupons = [
  { id: 9001, code: "TOT-xxxx-9001", status: "배정", orderId: "CP-20260428-00001" },
  { id: 9002, code: "TOT-xxxx-9002", status: "배정", orderId: "CP-20260428-00002" },
  { id: 9003, code: "TOT-xxxx-9003", status: "미배정", orderId: "-" },
];

export default function AdminCouponsPage() {
  return (
    <>
      <header className="admin-page-head">
        <h1>쿠폰 관리</h1>
        <p>사전 적재된 쿠폰 코드 목록 및 배정 상태 목업입니다.</p>
      </header>

      <div className="admin-toolbar">
        <button type="button" className="admin-btn-primary">
          쿠폰 일괄 등록
        </button>
        <select className="admin-select">
          <option value="">전체 상태</option>
          <option value="unassigned">미배정</option>
          <option value="assigned">배정</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>쿠폰번호</th>
              <th>상태</th>
              <th>연결 주문번호</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {mockCoupons.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>
                  <span className="admin-code">{c.code}</span>
                </td>
                <td>{c.status}</td>
                <td>{c.orderId}</td>
                <td>
                  <button type="button" className="admin-btn-sm">
                    상세
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
