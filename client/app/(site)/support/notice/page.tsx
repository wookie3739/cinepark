import Link from "next/link";
import { fetchNoticePage } from "../../../../lib/api/customer-service";
import { formatPublishedDate } from "../../../../lib/format-date";
import type { NoticeSummary } from "../../../../types/customer-service";

async function load() {
  try {
    const page = await fetchNoticePage(0, 50);
    return { page, error: null as string | null };
  } catch (e) {
    return {
      page: null,
      error: e instanceof Error ? e.message : "공지 목록을 불러오지 못했습니다.",
    };
  }
}

export default async function SupportNoticeListPage() {
  const { page, error } = await load();
  const rows: NoticeSummary[] = page?.content ?? [];

  return (
    <>
      <nav className="support-breadcrumb">
        <Link href="/">홈</Link>
        <span className="sep"> / </span>
        <Link href="/support">고객센터</Link>
        <span className="sep"> / </span>
        <span>공지사항</span>
      </nav>

      <h1 className="static-title" style={{ marginTop: 0 }}>
        공지사항
      </h1>
      {error ? (
        <p className="card-inline-msg" role="alert">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="muted">등록된 공지가 없습니다.</p>
      ) : (
        <ul className="notice-page-list">
          {rows.map((n) => (
            <li key={n.id} className={n.pinned ? "emph" : undefined}>
              <span className="notice-page-date">{formatPublishedDate(n.createdAt)}</span>
              <Link href={`/support/notice/${n.id}`} className="notice-page-title">
                {n.category ? `${n.category} ${n.title}` : n.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
