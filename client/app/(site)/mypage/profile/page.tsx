"use client";

import { type FormEvent, useState } from "react";

export default function MyPageProfilePage() {
  const [saved, setSaved] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <>
      <section className="panel">
        <h2>내 정보 수정</h2>
        <p className="muted">연락처 수정은 목업입니다. 실제 변경은 API 연동 후 제공됩니다.</p>

        <form className="profile-form" onSubmit={onSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="prof-email">
              이메일 (로그인 ID)
            </label>
            <input id="prof-email" type="email" defaultValue="demo@cinepark.kr" disabled />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="prof-name">
              이름
            </label>
            <input id="prof-name" type="text" defaultValue="데모사용자" />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="prof-phone">
              휴대폰
            </label>
            <input id="prof-phone" type="tel" placeholder="010-0000-0000" defaultValue="010-1234-5678" />
          </div>
          <button type="submit" className="auth-submit">
            저장하기 (목업)
          </button>
        </form>

        {saved ? <p className="card-inline-msg">저장되었습니다. (목업)</p> : null}
      </section>
    </>
  );
}
