import Link from "next/link";
import { fetchFaqList } from "../../../lib/api/customer-service";
import type { FaqItem } from "../../../types/customer-service";

const FAQ_CATEGORIES: { q: string; label: string; icon: string }[] = [
  { q: "결제", label: "결제·혜택", icon: "💳" },
  { q: "환불", label: "취소·환불", icon: "↩️" },
  { q: "예매", label: "예매·사용", icon: "🎬" },
  { q: "계정", label: "계정·인증", icon: "👤" },
  { q: "쿠폰", label: "쿠폰번호", icon: "🎫" },
  { q: "이벤트", label: "이벤트", icon: "🎁" },
  { q: "제휴", label: "제휴·입점", icon: "🤝" },
  { q: "기타", label: "기타", icon: "💬" },
];

async function loadFaqs(): Promise<{ items: FaqItem[]; error: string | null }> {
  try {
    const items = await fetchFaqList();
    return { items, error: null };
  } catch (e) {
    return {
      items: [],
      error: e instanceof Error ? e.message : "목록을 불러오지 못했습니다.",
    };
  }
}

export default async function SupportHomePage() {
  const { items, error } = await loadFaqs();
  const top5 = items.slice(0, 5);

  return (
    <>
      <nav className="support-breadcrumb">
        <Link href="/">홈</Link>
        <span className="sep"> / </span>
        <span>고객센터</span>
      </nav>

      <h2 className="support-hub-title">카테고리별 자주 묻는 질문</h2>
      <p className="support-hub-lead">주제를 선택하면 FAQ에서 해당 키워드로 바로 검색됩니다.</p>

      <div className="support-cat-grid">
        {FAQ_CATEGORIES.map((c) => (
          <Link key={c.q} href={`/support/faq?q=${encodeURIComponent(c.q)}`} className="support-cat-card">
            <span className="support-cat-icon" aria-hidden>
              {c.icon}
            </span>
            {c.label}
          </Link>
        ))}
      </div>

      <h3 className="support-top5-title">TOP 5 자주 묻는 질문</h3>
      {error ? (
        <p className="card-inline-msg" role="alert">
          {error}
        </p>
      ) : top5.length === 0 ? (
        <p className="muted">등록된 FAQ가 없습니다.</p>
      ) : (
        <ul className="support-top5-list">
          {top5.map((item) => (
            <li key={item.id} className="support-top5-item">
              <details>
                <summary>{item.question}</summary>
                <div className="support-top5-answer">{item.answer}</div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <p className="muted" style={{ marginTop: "1.25rem", fontSize: 13 }}>
        전체 FAQ는 <Link href="/support/faq">자주 찾는 FAQ</Link> 메뉴에서 확인할 수 있습니다.
      </p>
    </>
  );
}
