import Link from "next/link";

/**
 * 관리자가 아닌 사용자가 /admin 으로 들어온 경우(proxy rewrite)와
 * /admin-forbidden 직접 접근 시 공통 404 인상.
 */
export default function AdminForbiddenNotFound() {
  return (
    <main className="page" style={{ minHeight: "60vh" }}>
      <div className="container narrow-page">
        <article className="static-article panel flat" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <h1 className="static-title" style={{ fontSize: "1.35rem" }}>
            페이지를 찾을 수 없습니다
          </h1>
          <p className="muted" style={{ marginTop: "0.75rem" }}>
            주소가 잘못되었거나 삭제된 페이지입니다.
          </p>
          <div className="static-cta-row" style={{ marginTop: "1.5rem", justifyContent: "center" }}>
            <Link href="/" className="button">
              홈으로
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
