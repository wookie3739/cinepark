import Link from "next/link";

const stats = [
  { title: "오늘 신규 주문", value: "12", hint: "+3 전일 대비" },
  { title: "등록 회원 수", value: "1,248", hint: "누적" },
  { title: "미답변 1:1 문의", value: "4", hint: "처리 필요" },
  { title: "남은 쿠폰 재고", value: "2,840", hint: "미배정" },
];

export default function AdminDashboardPage() {
  return (
    <>
      <header className="admin-page-head">
        <h1>대시보드</h1>
        <p>토탈쿠폰 운영 현황을 한눈에 확인합니다.</p>
      </header>

      <div className="admin-stats">
        {stats.map((row) => (
          <article key={row.title} className="admin-stat-card">
            <h3>{row.title}</h3>
            <p className="admin-stat-value">{row.value}</p>
            <span className="admin-stat-hint">{row.hint}</span>
          </article>
        ))}
      </div>

      <section className="admin-card">
        <h2 className="admin-card-title">바로 가기</h2>
        <div className="admin-quick-links">
          <Link href="/admin/orders">주문내역</Link>
          <Link href="/admin/members">회원 관리</Link>
          <Link href="/admin/inquiries">1:1 문의</Link>
          <Link href="/admin/notices">공지사항</Link>
          <Link href="/admin/coupons">쿠폰 관리</Link>
        </div>
      </section>
    </>
  );
}
