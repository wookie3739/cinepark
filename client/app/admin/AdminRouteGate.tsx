"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { href: "/admin", label: "대시보드", exact: true },
  { href: "/admin/orders", label: "주문내역" },
  { href: "/admin/members", label: "회원 관리" },
  { href: "/admin/inquiries", label: "1:1 문의 관리" },
  { href: "/admin/notices", label: "공지사항 관리" },
  { href: "/admin/faqs", label: "FAQ 관리" },
  { href: "/admin/coupons", label: "쿠폰 관리" },
];

/**
 * 존재하지 않는 URL과 동일한 인상(404). 관리자가 아닌 경우 권한 없음을 노출하지 않음.
 */
function AdminHiddenNotFound() {
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

export function AdminRouteGate({ children }: { children: ReactNode }) {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return (
      <main className="page">
        <div className="container narrow-page">
          <p className="muted" style={{ padding: "2rem 0" }}>
            불러오는 중…
          </p>
        </div>
      </main>
    );
  }

  if (user?.role !== "ADMIN") {
    return <AdminHiddenNotFound />;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="관리자 메뉴">
        <div className="admin-sidebar-head">
          <Link href="/admin" className="admin-logo">
            Admin
          </Link>
          <span className="admin-badge">관리자</span>
        </div>
        <nav className="admin-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/" className="admin-back">
          쇼핑몰로 돌아가기
        </Link>
      </aside>

      <div className="admin-main">{children}</div>
    </div>
  );
}
