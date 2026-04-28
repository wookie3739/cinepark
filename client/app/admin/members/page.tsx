const mockMembers = [
  { id: 1, email: "user@example.com", name: "홍길동", phone: "01011112222", signup: "2026.03.01", orders: 3 },
  { id: 2, email: "other@example.com", name: "김민수", phone: "01033334444", signup: "2026.03.18", orders: 1 },
];

export default function AdminMembersPage() {
  return (
    <>
      <header className="admin-page-head">
        <h1>회원 정보</h1>
        <p>가입 회원 목록 목업입니다.</p>
      </header>

      <div className="admin-toolbar">
        <input type="search" className="admin-search-input" placeholder="이메일, 성함 검색..." />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>No</th>
              <th>이메일</th>
              <th>성함</th>
              <th>전화번호</th>
              <th>가입일</th>
              <th>결제건수</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {mockMembers.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.email}</td>
                <td>{m.name}</td>
                <td>{m.phone}</td>
                <td>{m.signup}</td>
                <td>{m.orders}</td>
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
