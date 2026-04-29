"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import * as authApi from "../../../lib/api/auth";

export default function FindIdPage() {
  const [phone, setPhone] = useState("");
  const phoneDigits = useMemo(() => phone.replace(/\D/g, ""), [phone]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [foundEmail, setFoundEmail] = useState<string | null>(null);

  const canSubmit = phoneDigits.length >= 9 && phoneDigits.length <= 11;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const data = await authApi.findIdByPhone(phoneDigits);
      setFoundEmail(data.email);
    } catch (err) {
      setFoundEmail(null);
      setError(err instanceof Error ? err.message : "조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="auth-container">
        <section className="auth-card">
          <header className="auth-header">
            <h1>아이디(이메일) 찾기</h1>
            <p>회원가입 시 등록한 휴대폰 번호를 입력하면 가입 이메일을 알려 드립니다.</p>
          </header>

          {foundEmail ? (
            <div className="auth-success">
              <p className="auth-find-result">
                가입된 아이디는 <strong>{foundEmail}</strong> 입니다.
              </p>
              <button
                type="button"
                className="auth-submit"
                onClick={() => {
                  setFoundEmail(null);
                  setPhone("");
                }}
              >
                다시 찾기
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              {error ? (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              ) : null}
              <label className="auth-field">
                <span className="auth-label">휴대폰 번호</span>
                <input
                  type="tel"
                  placeholder="01012345678 (하이픈 없이)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  inputMode="numeric"
                  required
                />
              </label>
              <button type="submit" className="auth-submit" disabled={!canSubmit || loading}>
                {loading ? "확인 중..." : "아이디 확인"}
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
            <Link href="/find-password" className="auth-text-link">
              비밀번호 찾기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
