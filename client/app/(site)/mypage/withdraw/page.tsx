"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

export default function MyPageWithdrawPage() {
  const [withdrawn, setWithdrawn] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setWithdrawn(true);
  };

  return (
    <>
      {!withdrawn ? (
        <section className="panel">
          <h2>회원 탈퇴</h2>
          <p className="muted">
            탈퇴 시 동일 이메일로 재가입 지연 등 정책은 서비스 오픈 시 적용됩니다. 본 화면은 목업입니다.
          </p>
          <ul className="static-list withdraw-notes">
            <li>구매 및 쿠폰 이용 이력은 관련 법령에 따라 보관될 수 있습니다.</li>
            <li>미사용 쿠폰이 있을 경우 탈퇴 전 고객센터로 문의해 주세요.</li>
          </ul>
          <form className="withdraw-form" onSubmit={onSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="withdraw-reason">
                탈퇴 사유 (선택)
              </label>
              <textarea id="withdraw-reason" className="inquiry-textarea" rows={4} placeholder="간단히 입력해 주세요." />
            </div>
            <label className="withdraw-check">
              <input type="checkbox" required />
              회원 탈퇴 유의사항을 확인했습니다.
            </label>
            <button type="submit" className="auth-submit withdraw-submit">
              탈퇴 신청 (목업)
            </button>
          </form>
        </section>
      ) : (
        <section className="panel">
          <h2>탈퇴 처리 안내 (목업)</h2>
          <p>회원 탈퇴 요청이 접수되었습니다. 실제 처리는 시스템 연동 후 이루어집니다.</p>
          <Link href="/" className="button">
            홈으로
          </Link>
        </section>
      )}
    </>
  );
}
