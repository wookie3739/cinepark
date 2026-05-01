"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../../../context/CartContext";
import { confirmCheckout, type CheckoutConfirmResult } from "../../../../lib/api/checkout";
import { fetchCouponProductsBatch } from "../../../../lib/api/catalog";
import { CHECKOUT_SESSION_KEY } from "../../../../lib/checkout-session";
import type { CouponProductDetail } from "../../../../types/catalog";

function formatPaidAt(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OrderCompleteFallback() {
  return (
    <div className="pay-done-inner" aria-busy="true">
      <div className="pay-done-hero pay-done-hero--loading">
        <div className="pay-done-icon pay-done-icon--muted" aria-hidden>
          <span className="pay-done-spinner" />
        </div>
        <h1 className="pay-done-title">불러오는 중입니다</h1>
        <p className="pay-done-lead muted">잠시만 기다려 주세요.</p>
      </div>
    </div>
  );
}

function OrderCompleteInner() {
  const searchParams = useSearchParams();
  const { refreshServerCart } = useCart();

  const paymentKey = searchParams.get("paymentKey")?.trim() ?? "";
  const orderId = searchParams.get("orderId")?.trim() ?? "";
  const amountRaw = searchParams.get("amount")?.trim() ?? "";
  const codesParam = searchParams.get("codes")?.trim() ?? "";

  const amount = useMemo(() => {
    const n = Number.parseInt(amountRaw, 10);
    return Number.isFinite(n) && n >= 1 ? n : 0;
  }, [amountRaw]);

  const [phase, setPhase] = useState<
    "loading" | "confirming" | "done" | "error" | "legacy" | "invalid"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutConfirmResult | null>(null);
  const [paidAt, setPaidAt] = useState<Date | null>(null);
  const [productsByCode, setProductsByCode] = useState<Record<string, CouponProductDetail>>({});

  const usageCodes = useMemo(() => {
    if (result?.lines?.length) {
      return [...new Set(result.lines.map((l) => l.productCode))];
    }
    return [...new Set(codesParam.split(",").map((c) => c.trim()).filter(Boolean))];
  }, [result, codesParam]);

  const [usageEntries, setUsageEntries] = useState<{ brandLabel: string; usageUrl: string }[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);

  useEffect(() => {
    if (paymentKey && orderId && amount >= 1) {
      let cancelled = false;
      setPhase("confirming");
      setErrorMessage(null);
      confirmCheckout({ paymentKey, orderId, amount })
        .then((r) => {
          if (cancelled) return;
          setResult(r);
          setPaidAt(new Date());
          setPhase("done");
          try {
            sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
          } catch {
            /* ignore */
          }
          void refreshServerCart();
        })
        .catch((e) => {
          if (cancelled) return;
          setErrorMessage(e instanceof Error ? e.message : "결제 확인에 실패했습니다.");
          setPhase("error");
        });
      return () => {
        cancelled = true;
      };
    }

    if (amount >= 1 || codesParam.length > 0) {
      setPhase("legacy");
    } else {
      setPhase("invalid");
    }
    return undefined;
  }, [paymentKey, orderId, amount, codesParam, refreshServerCart]);

  useEffect(() => {
    if (usageCodes.length === 0) {
      setUsageEntries([]);
      setProductsByCode({});
      return;
    }
    let cancelled = false;
    setLinksLoading(true);
    fetchCouponProductsBatch(usageCodes)
      .then((list) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const pairs: { brandLabel: string; usageUrl: string }[] = [];
        const pmap: Record<string, CouponProductDetail> = {};
        for (const p of list) {
          pmap[p.productCode] = p;
          const u = p.usageUrl?.trim();
          if (!u || seen.has(u)) continue;
          seen.add(u);
          pairs.push({ brandLabel: p.brandLabel, usageUrl: u });
        }
        setProductsByCode(pmap);
        setUsageEntries(pairs);
      })
      .catch(() => {
        if (!cancelled) {
          setUsageEntries([]);
          setProductsByCode({});
        }
      })
      .finally(() => {
        if (!cancelled) setLinksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [usageCodes.join(",")]);

  if (phase === "loading" || phase === "confirming") {
    return (
      <div className="pay-done-inner">
        <header className="pay-done-hero pay-done-hero--loading">
          <div className="pay-done-icon pay-done-icon--muted" aria-hidden>
            <span className="pay-done-spinner" />
          </div>
          <h1 className="pay-done-title">
            {phase === "confirming" ? "결제를 확인하는 중입니다" : "잠시만 기다려 주세요"}
          </h1>
          <p className="pay-done-lead muted">
            {phase === "confirming"
              ? "주문을 등록하고 쿠폰을 발급하고 있습니다. 창을 닫지 마세요."
              : "…"}
          </p>
        </header>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="pay-done-inner">
        <header className="pay-done-hero">
          <div className="pay-done-icon pay-done-icon--error" aria-hidden>
            <span className="pay-done-x">!</span>
          </div>
          <h1 className="pay-done-title">결제 확인에 실패했습니다</h1>
          <p className="pay-done-lead pay-done-alert" role="alert">
            {errorMessage ?? "알 수 없는 오류입니다."}
          </p>
          <p className="pay-done-note muted">
            결제는 이루어졌을 수 있습니다. 같은 문제가 반복되면 고객센터로 문의해 주세요.
          </p>
        </header>
        <div className="pay-done-actions">
          <Link href="/checkout" className="button pay-done-btn-primary">
            주문·결제로 돌아가기
          </Link>
          <Link href="/mypage" className="button pay-done-btn-outline">
            마이페이지
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "invalid") {
    return (
      <div className="pay-done-inner">
        <header className="pay-done-hero">
          <div className="pay-done-icon pay-done-icon--error" aria-hidden>
            <span className="pay-done-x">?</span>
          </div>
          <h1 className="pay-done-title">잘못된 접근입니다</h1>
          <p className="pay-done-lead muted">주문 완료 화면에 필요한 정보가 없습니다.</p>
        </header>
        <div className="pay-done-actions">
          <Link href="/" className="button pay-done-btn-primary">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  const showReceipt = phase === "done" && result;
  const amountLabel =
    amount >= 1 ? `${amount.toLocaleString("ko-KR")}원` : "마이페이지에서 확인";

  const isLegacy = phase === "legacy";

  return (
    <div className="pay-done-inner">
      <header className="pay-done-hero">
        <div className={`pay-done-icon${isLegacy ? " pay-done-icon--muted" : ""}`} aria-hidden>
          <CheckIcon className={isLegacy ? "pay-done-check pay-done-check--muted" : "pay-done-check"} />
        </div>
        <h1 className="pay-done-title">
          {isLegacy ? "주문·결제 안내" : "결제가 완료되었습니다!"}
        </h1>
        <p className="pay-done-lead muted">
          {isLegacy
            ? "이 링크로는 최신 결제 정보를 모두 표시할 수 없습니다. 마이페이지에서 구매 내역을 확인해 주세요."
            : "주문하신 상품의 결제가 정상적으로 처리되었습니다. 마이페이지에서 구매 내역과 발급 쿠폰을 확인할 수 있습니다."}
        </p>
      </header>

      {showReceipt ? (
        <article className="pay-done-receipt">
          <div className="pay-done-receipt-edge" aria-hidden />
          <div className="pay-done-receipt-head">
            <span className="pay-done-receipt-title">주문 상세내역</span>
            <span className="pay-done-receipt-brand">CINEPARK</span>
          </div>

          <dl className="pay-done-receipt-meta">
            <div className="pay-done-meta-row">
              <dt>주문 번호</dt>
              <dd>{result.merchantOrderId}</dd>
            </div>
            <div className="pay-done-meta-row">
              <dt>결제 일시</dt>
              <dd>{formatPaidAt(paidAt)}</dd>
            </div>
            <div className="pay-done-meta-row pay-done-meta-row--sub">
              <dt>내부 주문 ID</dt>
              <dd>{result.shopOrderId}</dd>
            </div>
          </dl>

          <div className="pay-done-divider" />

          <ul className="pay-done-lines">
            {result.lines.map((line) => {
              const p = productsByCode[line.productCode];
              const unit = p?.unitPrice ?? 0;
              const sub = unit > 0 ? unit * line.quantity : null;
              return (
                <li key={line.productCode} className="pay-done-line">
                  <div className="pay-done-line-thumb">
                    {p?.mainImageUrl ? (
                      <img src={p.mainImageUrl} alt="" className="product-thumb-cover" />
                    ) : (
                      <span className="pay-done-line-ph" aria-hidden>
                        CP
                      </span>
                    )}
                  </div>
                  <div className="pay-done-line-body">
                    <p className="pay-done-line-name">{line.productName}</p>
                    <p className="pay-done-line-sub muted">
                      {(p?.brandLabel ?? "쿠폰").slice(0, 24)} · {line.quantity}개
                    </p>
                    {line.issuedCouponCodes.some((c) => c) ? (
                      <ul className="pay-done-codes">
                        {line.issuedCouponCodes.map((code, i) => (
                          <li key={`${line.productCode}-c-${i}`}>
                            <code>{code || "—"}</code>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <span className="pay-done-line-price">
                    {sub != null ? `${sub.toLocaleString("ko-KR")}원` : "—"}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="pay-done-divider pay-done-divider--dashed" />

          <div className="pay-done-receipt-total">
            <span>최종 결제 금액</span>
            <strong>{amount >= 1 ? `${amount.toLocaleString("ko-KR")}원` : amountLabel}</strong>
          </div>

          {result.receiptUrl ? (
            <p className="pay-done-pg-link">
              <a href={result.receiptUrl} target="_blank" rel="noopener noreferrer">
                PG 영수증 보기
              </a>
            </p>
          ) : null}

          {linksLoading ? <p className="muted pay-done-links-hint">사용처 링크 확인 중…</p> : null}
          {!linksLoading && usageEntries.length > 0 ? (
            <div className="pay-done-usage-links">
              {usageEntries.map((e, i) => (
                <a key={`${e.usageUrl}-${i}`} href={e.usageUrl} target="_blank" rel="noopener noreferrer">
                  {e.brandLabel} 사용처 열기 →
                </a>
              ))}
            </div>
          ) : null}
          {!linksLoading && usageEntries.length === 0 && usageCodes.length > 0 ? (
            <p className="muted small-print pay-done-links-hint">웹 링크가 없으면 제휴처 앱에서 쿠폰을 등록해 주세요.</p>
          ) : null}

          <div className="pay-done-receipt-zigzag" aria-hidden />
        </article>
      ) : phase === "legacy" ? (
        <article className="pay-done-receipt pay-done-receipt--simple">
          <div className="pay-done-receipt-edge" aria-hidden />
          <div className="pay-done-receipt-head">
            <span className="pay-done-receipt-title">안내</span>
            <span className="pay-done-receipt-brand">CINEPARK</span>
          </div>
          <p className="pay-done-legacy-copy muted">
            이 화면은 이전 방식의 주문 완료 링크입니다. 전체 내역은 마이페이지에서 확인해 주세요.
          </p>
          {codesParam ? (
            <p className="small-print">
              <strong>상품 코드</strong> {codesParam}
            </p>
          ) : null}
          <div className="pay-done-receipt-total">
            <span>결제 금액</span>
            <strong>{amount >= 1 ? `${amount.toLocaleString("ko-KR")}원` : amountLabel}</strong>
          </div>
          <div className="pay-done-receipt-zigzag" aria-hidden />
        </article>
      ) : null}

      <div className="pay-done-actions">
        <Link href="/mypage" className="button pay-done-btn-primary">
          쿠폰 확인하기
        </Link>
        <Link href="/" className="button pay-done-btn-outline">
          홈으로 이동
        </Link>
      </div>
    </div>
  );
}

export default function OrderCompleteClient() {
  return (
    <Suspense fallback={<OrderCompleteFallback />}>
      <OrderCompleteInner />
    </Suspense>
  );
}
