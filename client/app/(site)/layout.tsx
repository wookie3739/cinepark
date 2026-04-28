import Link from "next/link";
import React from "react";
import Header from "../components/Header";

type SiteLayoutProps = {
  children: React.ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <>
      <Header />
      {children}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-links">
            <Link href="/">기업문의</Link>
            <Link href="/" className="emph">
              개인정보 처리방침
            </Link>
            <Link href="/">이용약관</Link>
            <Link href="/">사이트맵</Link>
          </div>
          <p className="footer-copy">© CINEPARK COUPON. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
