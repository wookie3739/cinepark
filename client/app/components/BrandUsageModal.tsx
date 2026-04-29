"use client";

import { useEffect, useState } from "react";
import { fetchProductUsageLinks } from "../../lib/api/catalog";
import type { CouponProductUsageLink } from "../../types/catalog";

type BrandUsageModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function BrandUsageModal({ open, onClose }: BrandUsageModalProps) {
  const [items, setItems] = useState<CouponProductUsageLink[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [appHint, setAppHint] = useState(false);

  useEffect(() => {
    if (!open) setAppHint(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (appHint) {
        setAppHint(false);
      } else {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, appHint]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setItems(null);
    setErr(null);
    fetchProductUsageLinks()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch((e: unknown) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const go = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  const onRowClick = (b: CouponProductUsageLink) => {
    const u = b.usageUrl?.trim();
    if (u) {
      go(u);
      return;
    }
    setAppHint(true);
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
        {appHint ? (
          <div
            className="brand-modal-hint-overlay"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="brand-app-hint-title"
            onClick={() => setAppHint(false)}
          >
            <div className="brand-modal-hint-card" onClick={(e) => e.stopPropagation()}>
              <p id="brand-app-hint-title" className="brand-modal-hint-text">
                웹 사용 링크가 없습니다. 제휴처 앱에서 쿠폰을 등록해 주세요.
              </p>
              <button type="button" className="button" onClick={() => setAppHint(false)}>
                확인
              </button>
            </div>
          </div>
        ) : null}
        <h3 id="brand-use-modal-title">사용 채널 선택</h3>
        {err ? (
          <p className="card-inline-msg" role="alert">
            {err}
          </p>
        ) : items == null ? (
          <p className="muted">불러오는 중…</p>
        ) : items.length === 0 ? (
          <p className="muted brand-modal-empty-body" role="alert">
            현재 이용 가능한 상품이 없습니다.
          </p>
        ) : (
          <>
            <p className="muted brand-modal-lead">판매 중인 상품입니다. 웹 링크가 있으면 이동하고, 없으면 앱 안내를 드립니다.</p>
            <ul className="brand-modal-list">
              {items.map((b) => {
                const hasLink = Boolean(b.usageUrl?.trim());
                return (
                  <li key={b.productCode}>
                    <button
                      type="button"
                      className={`brand-modal-row${hasLink ? "" : " brand-modal-row-no-link"}`}
                      onClick={() => onRowClick(b)}
                      title={`${b.brandLabel} — ${b.name}`}
                    >
                      <span className="brand-modal-row-main">
                        <span className="brand-modal-name">{b.brandLabel}</span>
                        <span className="brand-modal-tagline">{b.name}</span>
                      </span>
                      {hasLink ? (
                        <span className="brand-modal-action">이동</span>
                      ) : (
                        <span className="brand-modal-badge">앱</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <div className="button-row">
          <button type="button" className="button secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
