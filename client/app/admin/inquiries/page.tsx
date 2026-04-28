const mockTickets = [
  { id: 101, writer: "user@example.com", title: "쿠폰번호가 안 보여요", date: "2026.04.28", status: "미답변" },
  { id: 100, writer: "other@example.com", title: "결제 카드 변경 문의", date: "2026.04.27", status: "답변완료" },
];

export default function AdminInquiriesPage() {
  return (
    <>
      <header className="admin-page-head">
        <h1>1:1 문의 관리</h1>
        <p>문의 목록 및 답변 상태 목업입니다.</p>
      </header>

      <div className="admin-toolbar">
        <select className="admin-select">
          <option value="">전체 상태</option>
          <option value="open">미답변</option>
          <option value="closed">답변완료</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>No</th>
              <th>작성자</th>
              <th>제목</th>
              <th>작성일</th>
              <th>상태</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {mockTickets.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.writer}</td>
                <td>{t.title}</td>
                <td>{t.date}</td>
                <td>{t.status}</td>
                <td>
                  <button type="button" className="admin-btn-sm">
                    답변
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
