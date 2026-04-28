import Link from "next/link";

const links = [
  { href: "/service", label: "서비스 안내", desc: "이용 흐름과 결제 안내" },
  { href: "/cases", label: "활용사례", desc: "도입 시나리오 예시" },
  { href: "/faq", label: "자주하는 질문", desc: "FAQ" },
  { href: "/inquiry", label: "1:1 문의", desc: "문의 남기기" },
  { href: "/notice", label: "공지사항", desc: "운영 공지" },
];

export default function SupportHubPage() {
  return (
    <main className="page">
      <div className="container narrow-page">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>고객센터</strong>
        </nav>

        <article className="static-article panel flat">
          <h1 className="static-title">고객센터</h1>
          <p className="static-lead">
            서비스 이용·결제·예매 관련 안내를 아래 메뉴에서 확인하실 수 있습니다. 목업 화면입니다.
          </p>

          <ul className="support-grid">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="support-card">
                  <strong>{l.label}</strong>
                  <span>{l.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </main>
  );
}
