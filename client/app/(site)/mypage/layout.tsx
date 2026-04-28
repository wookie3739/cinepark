import Link from "next/link";
import React from "react";

type MyPageLayoutProps = {
  children: React.ReactNode;
};

export default function MyPageLayout({ children }: MyPageLayoutProps) {
  return (
    <main className="page mypage-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>마이페이지</strong>
        </nav>

        <div className="mypage-layout">
          <aside className="mypage-sidebar" aria-label="마이페이지 메뉴">
            <div className="mypage-sidebar-block">
              <p className="mypage-sidebar-title">나의 쇼핑</p>
              <ul className="mypage-sidebar-list">
                <li>
                  <Link href="/mypage">구매 쿠폰 조회</Link>
                </li>
              </ul>
            </div>
            <div className="mypage-sidebar-block">
              <p className="mypage-sidebar-title">회원 정보</p>
              <ul className="mypage-sidebar-list">
                <li>
                  <Link href="/mypage/profile">내 정보 수정</Link>
                </li>
                <li>
                  <Link href="/mypage/withdraw">회원 탈퇴</Link>
                </li>
              </ul>
            </div>
          </aside>

          <div className="mypage-main">{children}</div>
        </div>
      </div>
    </main>
  );
}
