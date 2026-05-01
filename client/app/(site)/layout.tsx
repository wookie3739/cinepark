import Link from "next/link";
import React from "react";
import Header from "../components/Header";
import ScrollTopButton from "../components/ScrollTopButton";
import { SiteProviders } from "../components/SiteProviders";

type SiteLayoutProps = {
  children: React.ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <SiteProviders>
      <Header />
      {children}
      <ScrollTopButton />
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-links">
            <a href="https://totalseller.co.kr/" target="_blank" rel="noreferrer">
              기업문의
            </a>
            <Link href="/" className="emph">
              개인정보 처리방침
            </Link>
            <Link href="/">이용약관</Link>
            <Link href="/support/notice">공지사항</Link>
            <Link href="/support/guide">이용안내</Link>
          </div>
          <p className="footer-copy">© CINEPARK COUPON. All rights reserved.</p>
        </div>
      </footer>
    </SiteProviders>
  );
}
