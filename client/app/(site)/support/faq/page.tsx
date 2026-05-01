import Link from "next/link";
import { fetchFaqList } from "../../../../lib/api/customer-service";
import type { FaqItem } from "../../../../types/customer-service";

async function load(): Promise<{ items: FaqItem[]; error: string | null }> {
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

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SupportFaqPage(props: Props) {
  const { q: rawQ } = await props.searchParams;
  const q = (rawQ ?? "").trim();
  const { items, error } = await load();

  const filtered =
    q.length > 0
      ? items.filter(
          (it) =>
            it.question.toLowerCase().includes(q.toLowerCase()) ||
            it.answer.toLowerCase().includes(q.toLowerCase()),
        )
      : items;

  return (
    <>
      <nav className="support-breadcrumb">
        <Link href="/">홈</Link>
        <span className="sep"> / </span>
        <Link href="/support">고객센터</Link>
        <span className="sep"> / </span>
        <span>자주 찾는 FAQ</span>
      </nav>

      <h1 className="static-title" style={{ marginTop: 0 }}>
        자주 찾는 FAQ
      </h1>
      {q ? (
        <p className="support-hub-lead" style={{ marginTop: "0.5rem" }}>
          검색: <strong>{q}</strong> — {filtered.length}건
        </p>
      ) : (
        <p className="support-hub-lead" style={{ marginTop: "0.5rem" }}>
          궁금한 내용을 위 검색창에서 찾아 보세요.
        </p>
      )}

      {error ? (
        <p className="card-inline-msg" role="alert">
          {error}
        </p>
      ) : filtered.length === 0 ? (
        <p className="muted">{q ? "검색 결과가 없습니다." : "등록된 FAQ가 없습니다."}</p>
      ) : (
        <dl className="faq-list">
          {filtered.map((item) => (
            <div key={item.id} className="faq-item">
              <dt className="faq-q">{item.question}</dt>
              <dd className="faq-a">{item.answer}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="muted small-print" style={{ marginTop: "1.25rem" }}>
        추가 문의는 1:1 문의를 이용해 주세요.
      </p>
      <div className="static-cta-row">
        <Link href="/support/inquiry" className="button">
          1:1 문의하기
        </Link>
      </div>
    </>
  );
}
