"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import BrandUsageModal from "./BrandUsageModal";

export default function Header() {
  const { cartItemCount } = useCart();
  const { user, isReady, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const authenticated = isReady && !!user;

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

          <ul className="header-util-menu">
            {authenticated ? (
              <>
                <li className="header-user-chip" title={user?.email ?? undefined}>
                  <span className="header-user-chip-avatar" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" focusable="false">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </span>
                  <strong className="header-user-chip-name">{user?.name ?? ""}</strong>
                </li>
                <li>
                  <button type="button" className="header-text-btn" onClick={() => logout()}>
                    로그아웃
                  </button>
                </li>
                <li>
                  <Link href="/mypage">마이페이지</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login">로그인</Link>
                </li>
                <li>
                  <Link href="/signup">회원가입</Link>
                </li>
              </>
            )}
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
              <Link href="/coupons">쿠폰 마켓</Link>
            </li>
            <li>
              <Link href="/intro">토탈쿠폰 소개</Link>
            </li>
            <li>
              <Link href="/service">이용안내</Link>
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
        </div>
      </nav>

      <div className={`mobile-drawer ${open ? "open" : ""}`} role="dialog" aria-hidden={!open}>
        <p className="mobile-drawer-section">메뉴</p>
        <ul className="mobile-drawer-menu">
          <li>
            <Link href="/coupons" onClick={closeMenu}>
              쿠폰 마켓
            </Link>
          </li>
          <li>
            <Link href="/intro" onClick={closeMenu}>
              토탈쿠폰 소개
            </Link>
          </li>
          <li>
            <Link href="/service" onClick={closeMenu}>
              이용안내
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
          {authenticated ? (
            <>
              <li className="mobile-drawer-user mobile-drawer-user-block">
                <div className="mobile-drawer-user-row">
                  <span className="mobile-drawer-user-avatar" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" focusable="false">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </span>
                  <div className="mobile-drawer-user-text">
                    <span className="mobile-drawer-user-name">{user?.name}</span>
                    <span className="mobile-drawer-user-email">{user?.email}</span>
                  </div>
                </div>
              </li>
              <li>
                <button
                  type="button"
                  className="mobile-drawer-linklike"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  로그아웃
                </button>
              </li>
              <li>
                <Link href="/mypage" onClick={closeMenu}>
                  마이페이지
                </Link>
              </li>
            </>
          ) : (
            <>
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
            </>
          )}
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
