"use client";

import { useState } from "react";

export default function NoticeModal() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="공지사항">
      <div className="modal-box">
        <h3>공지사항</h3>
        <p>결제 완료 후 쿠폰번호는 주문완료/마이페이지에서 확인할 수 있습니다.</p>
        <p>환불 처리는 본 사이트에서 제공하지 않습니다.</p>
        <div className="button-row">
          <button type="button" className="button secondary" onClick={() => setOpen(false)}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
