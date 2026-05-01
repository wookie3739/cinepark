"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import BrandUsageModal from "../../components/BrandUsageModal";

const SIDENAV: { href: string; label: string }[] = [
  { href: "/support", label: "자주 찾는 FAQ" },
  { href: "/support/notice", label: "공지사항" },
  { href: "/support/inquiry", label: "1:1 문의" },
  { href: "/mypage/inquiries", label: "내 상담 내역" },
  { href: "/support/guide", label: "이용안내" },
];

function navActive(pathname: string, href: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  const h = href.replace(/\/+$/, "") || "/";
  if (h === "/support") return p === "/support";
  return p === h || p.startsWith(`${h}/`);
}

export default function SupportShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const [usageModalOpen, setUsageModalOpen] = useState(false);

  return (
    <div className="fd-page support-page">
      <div className="fd-shell">
        <section className="fd-promo support-fd-promo support-fd-promo--top" aria-label="추가 도움">
          <div>
            <h2>도움이 더 필요하신가요?</h2>
            <p>1:1 문의로 남겨 주시면 순차적으로 답변해 드립니다.</p>
            <Link href="/support/inquiry" className="fd-promo-btn">
              문의 남기기
            </Link>
          </div>
          <div className="fd-promo-deco" aria-hidden />
        </section>

        <div className="support-fd-body">
          <aside className="support-sidebar" aria-label="고객센터 메뉴">
            <nav>
              <ul className="support-sidenav">
                {SIDENAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={navActive(pathname, item.href) ? "support-sidenav-link is-active" : "support-sidenav-link"}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="support-hours">
              <p className="support-hours-title">고객센터 운영시간</p>
              <p className="support-hours-body">
                평일 09:00 – 18:00
                <br />
                점심 12:00 – 13:00
                <br />
                주말·공휴일 휴무
              </p>
              <p className="support-hours-note">1:1 문의는 로그인 후 이용 가능합니다.</p>
            </div>
          </aside>

          <div className="support-main">{children}</div>
        </div>
      </div>

      <footer className="fd-foot">
        <div className="fd-foot-inner">
          <div className="fd-foot-brand">
            <strong>cinepark COUPON</strong>
            <p>제휴 영화관 할인 쿠폰을 한곳에서 비교·구매할 수 있도록 돕는 서비스입니다.</p>
          </div>
          <nav className="fd-foot-links" aria-label="푸터 링크">
            <Link href="/intro">서비스 소개</Link>
            <Link href="/support/guide">이용안내</Link>
            <Link href="/">개인정보 처리방침</Link>
            <a href="https://totalseller.co.kr/" target="_blank" rel="noreferrer">
              입점·제휴 문의
            </a>
            <Link href="/coupons">쿠폰 마켓</Link>
            <button type="button" onClick={() => setUsageModalOpen(true)}>
              브랜드 사용 안내
            </button>
          </nav>
        </div>
        <p className="fd-foot-copy">© {new Date().getFullYear()} CINEPARK COUPON. All rights reserved.</p>
      </footer>

      <BrandUsageModal open={usageModalOpen} onClose={() => setUsageModalOpen(false)} />
    </div>
  );
}
