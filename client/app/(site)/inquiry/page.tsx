"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useState } from "react";
import { createInquiry } from "../../../lib/api/customer-service";
import { useAuth } from "../../../context/AuthContext";

export default function InquiryPage() {
  const { accessToken, isReady } = useAuth();
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    if (!accessToken) {
      setErr("로그인 후 이용해 주세요.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const content = String(fd.get("body") ?? "").trim();
    if (!title || !content) {
      setErr("제목과 내용을 입력해 주세요.");
      return;
    }
    setPending(true);
    try {
      await createInquiry(accessToken, { title, content });
      setDone(true);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "등록에 실패했습니다.");
    } finally {
      setPending(false);
    }
  };

  if (!isReady) {
    return (
      <main className="page">
        <div className="container narrow-page">
          <p className="muted">불러오는 중…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container narrow-page">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>1:1 문의</strong>
        </nav>

        <article className="static-article panel flat">
          <h1 className="static-title">1:1 문의</h1>
          <p className="static-lead">
            구매·예매·제휴 관련 문의를 남겨 주세요. 로그인한 회원만 등록할 수 있습니다.
          </p>

          {!accessToken ? (
            <p className="card-inline-msg">
              문의 등록을 위해{" "}
              <Link href="/login">로그인</Link>이 필요합니다.
            </p>
          ) : done ? (
            <p className="card-inline-msg">문의가 접수되었습니다.</p>
          ) : (
            <form className="inquiry-form" onSubmit={onSubmit}>
              {err ? (
                <p className="card-inline-msg" role="alert">
                  {err}
                </p>
              ) : null}
              <div className="auth-field">
                <label className="auth-label" htmlFor="inq-title">
                  제목
                </label>
                <input id="inq-title" name="title" type="text" placeholder="문의 제목" required />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="inq-body">
                  내용
                </label>
                <textarea
                  id="inq-body"
                  name="body"
                  className="inquiry-textarea"
                  rows={6}
                  placeholder="문의 내용을 입력해 주세요."
                  required
                />
              </div>
              <button type="submit" className="auth-submit" disabled={pending}>
                {pending ? "등록 중…" : "문의 등록"}
              </button>
            </form>
          )}

          <div className="static-cta-row">
            <Link href="/faq" className="button secondary">
              FAQ로 돌아가기
            </Link>
            <Link href="/notice" className="button secondary">
              공지사항
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
