"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import BrandUsageModal from "./BrandUsageModal";

export default function Header() {
  const { cartItemCount } = useCart();
  const [open, setOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="header-util">
        <div className="container header-util-inner">
          <button
            type="button"
            className="header-hamburger"
            aria-label="메뉴 열기"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>

          <Link href="/" className="logo" onClick={closeMenu}>
            cinepark<span>COUPON</span>
          </Link>

          <div className="header-search" role="search">
            <input
              type="text"
              className="header-search-input"
              placeholder="토탈쿠폰 검색"
              aria-label="검색"
            />
            <button type="button" className="header-search-button">
              검색
            </button>
          </div>

          <ul className="header-util-menu">
            <li>
              <Link href="/login">로그인</Link>
            </li>
            <li>
              <Link href="/signup">회원가입</Link>
            </li>
            <li>
              <Link href="/mypage">마이페이지</Link>
            </li>
            <li>
              <Link href="/cart" className="header-cart-link">
                장바구니{cartItemCount > 0 ? <span className="cart-count">{cartItemCount}</span> : null}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <nav className="header-gnb">
        <div className="container header-gnb-inner">
          <ul className="gnb-menu">
            <li>
              <Link href="/intro">토탈쿠폰 소개</Link>
            </li>
            <li>
              <Link href="/coupons/total-1">상품찾기</Link>
            </li>
            <li>
              <Link href="/service">이용안내</Link>
            </li>
            <li>
              <Link href="/mypage">MY주문관리</Link>
            </li>
            <li>
              <Link href="/support">고객센터</Link>
            </li>
            <li>
              <a
                href="https://totalseller.co.kr/"
                target="_blank"
                rel="noreferrer"
              >
                토탈셀러
              </a>
            </li>
            <li>
              <button
                type="button"
                className="gnb-inline-btn"
                onClick={() => setBrandModalOpen(true)}
              >
                사용하러 가기
              </button>
            </li>
          </ul>

          <div className="hot-keyword">
            <span className="hot-keyword-title">HOT</span>
            <a href="#hot-deal">#토탈쿠폰</a>
            <a href="#hot-deal">#쿠폰사용</a>
            <a href="#hot-deal">#할인이벤트</a>
            <a href="#hot-deal">#시네파크</a>
          </div>
        </div>
      </nav>

      <div className={`mobile-drawer ${open ? "open" : ""}`} role="dialog" aria-hidden={!open}>
        <div className="mobile-drawer-search">
          <input type="text" placeholder="토탈쿠폰 검색" aria-label="검색" />
          <button type="button">검색</button>
        </div>

        <p className="mobile-drawer-section">메뉴</p>
        <ul className="mobile-drawer-menu">
          <li>
            <Link href="/intro" onClick={closeMenu}>
              토탈쿠폰 소개
            </Link>
          </li>
          <li>
            <Link href="/coupons/total-1" onClick={closeMenu}>
              상품찾기
            </Link>
          </li>
          <li>
            <Link href="/service" onClick={closeMenu}>
              이용안내
            </Link>
          </li>
          <li>
            <Link href="/mypage" onClick={closeMenu}>
              MY주문관리
            </Link>
          </li>
          <li>
            <Link href="/support" onClick={closeMenu}>
              고객센터
            </Link>
          </li>
          <li>
            <a href="https://totalseller.co.kr/" target="_blank" rel="noreferrer" onClick={closeMenu}>
              토탈셀러
            </a>
          </li>
          <li>
            <button
              type="button"
              className="mobile-drawer-linklike"
              onClick={() => {
                setBrandModalOpen(true);
                closeMenu();
              }}
            >
              사용하러 가기
            </button>
          </li>
        </ul>

        <p className="mobile-drawer-section">계정</p>
        <ul className="mobile-drawer-menu">
          <li>
            <Link href="/login" onClick={closeMenu}>
              로그인
            </Link>
          </li>
          <li>
            <Link href="/signup" onClick={closeMenu}>
              회원가입
            </Link>
          </li>
          <li>
            <Link href="/mypage" onClick={closeMenu}>
              마이페이지
            </Link>
          </li>
          <li>
            <Link href="/cart" onClick={closeMenu}>
              장바구니{cartItemCount > 0 ? ` (${cartItemCount})` : ""}
            </Link>
          </li>
        </ul>
      </div>

      {open && <div className="mobile-drawer-backdrop" onClick={closeMenu} aria-hidden="true" />}

      <BrandUsageModal open={brandModalOpen} onClose={() => setBrandModalOpen(false)} />
    </header>
  );
}
