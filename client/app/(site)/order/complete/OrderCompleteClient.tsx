"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCouponProductsBatch } from "../../../../lib/api/catalog";

type Props = {
  paidAmount: number;
  codesParam: string;
};

export default function OrderCompleteClient({ paidAmount, codesParam }: Props) {
  const [usageEntries, setUsageEntries] = useState<{ brandLabel: string; usageUrl: string }[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);

  const paymentLabel = `${paidAmount.toLocaleString()}원`;

  useEffect(() => {
    const raw = codesParam
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (raw.length === 0) {
      setUsageEntries([]);
      return;
    }
    let cancelled = false;
    setLinksLoading(true);
    fetchCouponProductsBatch(Array.from(new Set(raw)))
      .then((list) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const pairs: { brandLabel: string; usageUrl: string }[] = [];
        for (const p of list) {
          const u = p.usageUrl?.trim();
          if (!u || seen.has(u)) continue;
          seen.add(u);
          pairs.push({ brandLabel: p.brandLabel, usageUrl: u });
        }
        setUsageEntries(pairs);
      })
      .catch(() => {
        if (!cancelled) setUsageEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLinksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [codesParam]);

  return (
    <section className="panel">
      <h2>주문이 완료되었습니다</h2>
      <div className="price-row">
        <span>결제금액</span>
        <strong>{paymentLabel}</strong>
      </div>
      <p className="muted small-print">
        주문번호·외부결제번호·발급 쿠폰번호는 결제 연동 후 주문내역 및 마이페이지에 표시됩니다.
      </p>

      {linksLoading ? <p className="muted">사용처 연결 확인 중…</p> : null}

      {!linksLoading && usageEntries.length > 0 ? (
        <div className="button-row order-complete-usage-buttons" style={{ flexWrap: "wrap" }}>
          {usageEntries.map((e, i) => (
            <a
              key={`${e.usageUrl}-${i}`}
              href={e.usageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button"
            >
              사용하러 가기 · {e.brandLabel}
            </a>
          ))}
        </div>
      ) : null}

      {!linksLoading && usageEntries.length === 0 && codesParam.trim().length > 0 ? (
        <p className="muted small-print">웹 링크가 없으면 제휴처 앱에서 쿠폰을 등록해 주세요.</p>
      ) : null}

      <div className="button-row">
        <Link href="/mypage" className="button secondary">
          마이페이지에서 확인
        </Link>
        <Link href="/" className="button secondary">
          쇼핑 홈
        </Link>
      </div>
    </section>
  );
}
