"use client";

import { useEffect } from "react";
import { MOCK_BRANDS_USAGE } from "../../lib/coupon-brands-catalog";

type BrandUsageModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function BrandUsageModal({ open, onClose }: BrandUsageModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const go = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      className="modal-overlay brand-usage-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brand-use-modal-title"
      onClick={onClose}
    >
      <div className="modal-box brand-modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 id="brand-use-modal-title">사용 채널 선택</h3>
        <p className="muted brand-modal-lead">아래에서 브랜드를 선택하면 해당 사이트로 이동합니다.</p>
        <ul className="brand-modal-list">
          {MOCK_BRANDS_USAGE.map((b) => {
            const canOpen = Boolean(b.activated && b.usageUrl);
            return (
              <li key={b.id}>
                <button
                  type="button"
                  className={`brand-modal-row ${canOpen ? "" : "is-disabled"}`}
                  disabled={!canOpen}
                  title={canOpen ? `${b.labelKo} 사이트로 이동` : "준비 중 (예정)"}
                  onClick={() => {
                    if (canOpen && b.usageUrl) go(b.usageUrl);
                  }}
                >
                  <span className="brand-modal-row-main">
                    <span className="brand-modal-name">{b.labelKo}</span>
                    {b.tagline ? <span className="brand-modal-tagline">{b.tagline}</span> : null}
                  </span>
                  {b.activated ? (
                    <span className="brand-modal-action">이동</span>
                  ) : (
                    <span className="brand-modal-badge">예정</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="button-row">
          <button type="button" className="button secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
