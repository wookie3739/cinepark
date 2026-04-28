"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <main className="page">
      <div className="auth-container">
        <section className="auth-card">
          <header className="auth-header">
            <h1>로그인</h1>
            <p>토탈쿠폰 결제와 마이페이지를 이용하려면 로그인하세요.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span className="auth-label">이메일</span>
              <input
                type="email"
                placeholder="example@cinepark.kr"
                value={form.email}
                onChange={handleChange("email")}
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">비밀번호</span>
              <input
                type="password"
                placeholder="비밀번호 입력"
                value={form.password}
                onChange={handleChange("password")}
                autoComplete="current-password"
                required
              />
            </label>

            <button type="submit" className="auth-submit">
              로그인
            </button>
          </form>

          <div className="auth-extra">
            <Link href="/find-password" className="auth-text-link">
              비밀번호 찾기
            </Link>
            <span className="auth-divider" aria-hidden>
              |
            </span>
            <Link href="/signup" className="auth-text-link">
              회원가입
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
