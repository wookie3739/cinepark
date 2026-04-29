"use client";

import Link from "next/link";
import { useState } from "react";
import * as authApi from "../../../lib/api/auth";

type Step = "email" | "reset";

export default function FindPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const passwordMismatch =
    newPassword.length > 0 &&
    newPasswordConfirm.length > 0 &&
    newPassword !== newPasswordConfirm;

  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    try {
      await authApi.sendPasswordResetCode(trimmed);
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "발송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordMismatch || newPassword.length < 8) return;
    setError(null);
    setLoading(true);
    try {
      await authApi.confirmPasswordReset({
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="auth-container">
        <section className="auth-card auth-card-wide">
          <header className="auth-header">
            <h1>비밀번호 찾기</h1>
            <p>가입 이메일로 6자리 인증번호를 보냅니다. 인증 후 새 비밀번호를 설정하세요.</p>
          </header>

          {done ? (
            <div className="auth-success">
              <p>비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.</p>
              <Link href="/login" className="auth-submit" style={{ display: "inline-block", textDecoration: "none" }}>
                로그인하기
              </Link>
            </div>
          ) : step === "email" ? (
            <form className="auth-form" onSubmit={handleSendCode}>
              {error ? (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              ) : null}
              <label className="auth-field">
                <span className="auth-label">이메일 (아이디)</span>
                <input
                  type="email"
                  placeholder="example@cinepark.kr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              <button type="submit" className="auth-submit" disabled={!email.trim() || loading}>
                {loading ? "발송 중..." : "인증번호 받기"}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleConfirm}>
              {error ? (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              ) : null}
              <label className="auth-field">
                <span className="auth-label">이메일</span>
                <input type="email" value={email} readOnly className="auth-input-readonly" />
              </label>
              <label className="auth-field">
                <span className="auth-label">인증번호 (6자리)</span>
                <input
                  type="text"
                  placeholder="메일로 받은 6자리 숫자"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                />
              </label>
              <label className="auth-field">
                <span className="auth-label">새 비밀번호</span>
                <input
                  type="password"
                  placeholder="8자 이상"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
              <label className="auth-field">
                <span className="auth-label">새 비밀번호 확인</span>
                <input
                  type="password"
                  placeholder="한 번 더 입력"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                {passwordMismatch ? <span className="auth-error">비밀번호가 일치하지 않습니다.</span> : null}
              </label>
              <div className="auth-form-actions">
                <button
                  type="button"
                  className="auth-text-link"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setNewPassword("");
                    setNewPasswordConfirm("");
                    setError(null);
                  }}
                >
                  이메일 다시 선택
                </button>
              </div>
              <button
                type="submit"
                className="auth-submit"
                disabled={
                  code.length !== 6 ||
                  newPassword.length < 8 ||
                  passwordMismatch ||
                  loading
                }
              >
                {loading ? "처리 중..." : "비밀번호 변경"}
              </button>
            </form>
          )}

          <div className="auth-extra">
            <Link href="/find-id" className="auth-text-link">
              아이디 찾기
            </Link>
            <span className="auth-divider" aria-hidden>
              |
            </span>
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
