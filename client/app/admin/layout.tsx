import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "대시보드", exact: true },
  { href: "/admin/orders", label: "주문내역" },
  { href: "/admin/members", label: "회원 정보" },
  { href: "/admin/inquiries", label: "1:1 문의 관리" },
  { href: "/admin/notices", label: "공지사항 관리" },
  { href: "/admin/coupons", label: "쿠폰 관리" },
];

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
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
                <Link href={item.href}>
                  {item.label}
                </Link>
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
