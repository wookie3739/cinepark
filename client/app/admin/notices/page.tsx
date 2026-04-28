const mockNotices = [
  { id: 12, category: "[공지]", title: "결제 후 환불 정책 안내", date: "2026.04.28", pinned: true },
  { id: 11, category: "[안내]", title: "마이페이지 쿠폰 조회 방법", date: "2026.04.20", pinned: false },
];

export default function AdminNoticesPage() {
  return (
    <>
      <header className="admin-page-head">
        <h1>공지사항 관리</h1>
        <p>공지 등록·수정·삭제 UI 목업입니다.</p>
      </header>

      <div className="admin-toolbar">
        <button type="button" className="admin-btn-primary">
          공지 등록
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>No</th>
              <th>분류</th>
              <th>제목</th>
              <th>등록일</th>
              <th>상단고정</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {mockNotices.map((n) => (
              <tr key={n.id}>
                <td>{n.id}</td>
                <td>{n.category}</td>
                <td>{n.title}</td>
                <td>{n.date}</td>
                <td>{n.pinned ? "예" : "아니오"}</td>
                <td>
                  <button type="button" className="admin-btn-sm">
                    수정
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
