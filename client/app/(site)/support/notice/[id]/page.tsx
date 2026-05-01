import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchNoticeDetail } from "../../../../../lib/api/customer-service";
import { formatPublishedDate } from "../../../../../lib/format-date";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SupportNoticeDetailPage(props: Props) {
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
    <>
      <nav className="support-breadcrumb">
        <Link href="/">홈</Link>
        <span className="sep"> / </span>
        <Link href="/support">고객센터</Link>
        <span className="sep"> / </span>
        <Link href="/support/notice">공지사항</Link>
        <span className="sep"> / </span>
        <span>상세</span>
      </nav>

      <article>
        <p className="notice-detail-date">{formatPublishedDate(detail.createdAt)}</p>
        <h1 className="static-title" style={{ marginTop: 0 }}>
          {detail.title}
        </h1>
        <p className="static-body" style={{ whiteSpace: "pre-wrap" }}>
          {detail.body}
        </p>
        <div className="static-cta-row">
          <Link href="/support/notice" className="button secondary">
            목록
          </Link>
        </div>
      </article>
    </>
  );
}
