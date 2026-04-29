import Link from "next/link";
import { fetchFaqList } from "../../../lib/api/customer-service";
import type { FaqItem } from "../../../types/customer-service";

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

export default async function FaqPage() {
  const { items, error } = await load();

  return (
    <main className="page">
      <div className="container narrow-page">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>자주하는 질문</strong>
        </nav>

        <article className="static-article panel flat">
          <h1 className="static-title">자주하는 질문</h1>
          {error ? (
            <p className="card-inline-msg" role="alert">
              {error}
            </p>
          ) : items.length === 0 ? (
            <p className="muted">등록된 FAQ가 없습니다.</p>
          ) : (
            <dl className="faq-list">
              {items.map((item) => (
                <div key={item.id} className="faq-item">
                  <dt className="faq-q">{item.question}</dt>
                  <dd className="faq-a">{item.answer}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className="muted small-print">추가 문의는 1:1 문의 게시판을 이용해 주세요.</p>
          <div className="static-cta-row">
            <Link href="/inquiry" className="button">
              1:1 문의하기
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
