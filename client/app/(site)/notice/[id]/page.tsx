import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchNoticeDetail } from "../../../../lib/api/customer-service";
import { formatPublishedDate } from "../../../../lib/format-date";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NoticeDetailPage(props: Props) {
  const { id } = await props.params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    notFound();
  }

  let detail;
  try {
    detail = await fetchNoticeDetail(numId);
  } catch {
    notFound();
  }

  return (
    <main className="page">
      <div className="container narrow-page">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <Link href="/notice">공지사항</Link>
          <span className="sep">/</span>
          <strong>상세</strong>
        </nav>

        <article className="static-article panel flat">
          <p className="notice-detail-date">{formatPublishedDate(detail.createdAt)}</p>
          <h1 className="static-title">{detail.title}</h1>
          <p className="static-body" style={{ whiteSpace: "pre-wrap" }}>
            {detail.body}
          </p>
          <div className="static-cta-row">
            <Link href="/notice" className="button secondary">
              목록
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
