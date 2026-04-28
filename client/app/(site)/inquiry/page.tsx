"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useState } from "react";

export default function InquiryPage() {
  const [done, setDone] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(true);
  };

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
            구매·예매·제휴 관련 문의를 남겨 주세요. 목업 화면이며 실제 접수·답변은 연동 후 제공됩니다.
          </p>

          {done ? (
            <p className="card-inline-msg">문의가 접수되었습니다. (목업)</p>
          ) : (
            <form className="inquiry-form" onSubmit={onSubmit}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="inq-name">
                  이름
                </label>
                <input id="inq-name" name="name" type="text" placeholder="홍길동" required />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="inq-email">
                  이메일
                </label>
                <input id="inq-email" name="email" type="email" placeholder="you@example.com" required />
              </div>
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
              <button type="submit" className="auth-submit">
                문의 등록 (목업)
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
