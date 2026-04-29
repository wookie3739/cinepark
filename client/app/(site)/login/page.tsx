"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      router.push("/mypage");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
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
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
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

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? "처리 중..." : "로그인"}
            </button>
          </form>

          <div className="auth-extra">
            <Link href="/find-id" className="auth-text-link">
              아이디 찾기
            </Link>
            <span className="auth-divider" aria-hidden>
              |
            </span>
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
