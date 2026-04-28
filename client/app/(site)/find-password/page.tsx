"use client";

import Link from "next/link";
import { useState } from "react";

export default function FindPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <main className="page">
      <div className="auth-container">
        <section className="auth-card">
          <header className="auth-header">
            <h1>비밀번호 찾기</h1>
            <p>가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다.</p>
          </header>

          {submitted ? (
            <div className="auth-success">
              <p>
                <strong>{email}</strong> 로 비밀번호 재설정 안내를 보냈습니다.
              </p>
              <p className="muted">메일이 도착하지 않았다면 스팸함을 확인해 주세요.</p>
              <button
                type="button"
                className="auth-submit"
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
              >
                다른 이메일로 다시 시도
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <span className="auth-label">이메일</span>
                <input
                  type="email"
                  placeholder="example@cinepark.kr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </label>

              <button type="submit" className="auth-submit" disabled={!email}>
                재설정 메일 보내기
              </button>
            </form>
          )}

          <div className="auth-extra">
            <Link href="/login" className="auth-text-link">
              로그인
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
