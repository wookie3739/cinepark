import Link from "next/link";

const notices = [
  { id: "1", date: "2026.04.28", title: "[공지] 토탈쿠폰 구매 사이트 OPEN 안내", emph: true },
  { id: "2", date: "2026.04.28", title: "[공지] 결제 완료 후 환불 미제공 정책 안내", emph: true },
  { id: "3", date: "2026.04.20", title: "[안내] 마이페이지에서 쿠폰번호 확인 방법", emph: false },
  { id: "4", date: "2026.04.15", title: "[안내] 시네파크 예매 연동 안내", emph: false },
  { id: "5", date: "2026.04.10", title: "[안내] 결제 수단 PortOne / Toss 안내", emph: false },
];

export default function NoticeListPage() {
  return (
    <main className="page">
      <div className="container narrow-page">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>공지사항</strong>
        </nav>

        <article className="static-article panel flat">
          <h1 className="static-title">공지사항</h1>
          <ul className="notice-page-list">
            {notices.map((n) => (
              <li key={n.id} className={n.emph ? "emph" : undefined}>
                <span className="notice-page-date">{n.date}</span>
                <Link href={`/notice/${n.id}`} className="notice-page-title">
                  {n.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="muted small-print">공지 상세 본문은 목업입니다.</p>
        </article>
      </div>
    </main>
  );
}
