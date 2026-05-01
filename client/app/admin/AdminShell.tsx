"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type SingleNav = {
  href: string;
  label: string;
  /** true: pathname === href 만 */
  exact?: boolean;
};

type NavGroupDef = {
  label: string;
  items: { href: string; label: string }[];
};

const mainNavItems: SingleNav[] = [
  { href: "/admin", label: "대시보드", exact: true },
  { href: "/admin/orders", label: "주문내역" },
  { href: "/admin/members", label: "회원 관리" },
  { href: "/admin/inquiries", label: "1:1 문의 관리" },
  { href: "/admin/notices", label: "공지사항 관리" },
  { href: "/admin/faqs", label: "FAQ 관리" },
];

const couponGroup: NavGroupDef = {
  label: "쿠폰",
  items: [
    { href: "/admin/categories", label: "쿠폰 카테고리" },
    { href: "/admin/products", label: "쿠폰 상품" },
    { href: "/admin/coupons/bulk-register", label: "쿠폰 코드 대량 등록" },
  ],
};

function matchPath(pathname: string, href: string, exact?: boolean): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  const h = href.replace(/\/+$/, "") || "/";
  if (exact) return p === h;
  return p === h || p.startsWith(`${h}/`);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const groupHasActive = couponGroup.items.some((it) => matchPath(pathname, it.href, true));

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
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={matchPath(pathname, item.href, item.exact) ? "admin-nav-active" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className={`admin-nav-group ${groupHasActive ? "admin-nav-group--active" : ""}`}>
              <div className="admin-nav-group-title">{couponGroup.label}</div>
              <ul className="admin-nav-sub">
                {couponGroup.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={matchPath(pathname, item.href, true) ? "admin-nav-active" : undefined}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
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
