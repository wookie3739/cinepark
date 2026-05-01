"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchMyOrderDetail, fetchMyOrders, type MyOrderSummary } from "../../../lib/api/my-orders";
import { formatDateTime } from "../../../lib/format-date";
import type { CheckoutConfirmResult } from "../../../lib/api/checkout";

export default function MyPageCouponsSection() {
  const { accessToken, isReady } = useAuth();
  const [orders, setOrders] = useState<MyOrderSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detailByOrderId, setDetailByOrderId] = useState<Record<number, CheckoutConfirmResult>>({});
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!accessToken) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const page = await fetchMyOrders(accessToken, 0, 50);
      setOrders(page.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!isReady) return;
    void loadOrders();
  }, [isReady, loadOrders]);

  const toggleDetail = async (order: MyOrderSummary) => {
    if (expandedId === order.shopOrderId) {
      setExpandedId(null);
      setDetailError(null);
      return;
    }
    setExpandedId(order.shopOrderId);
    setDetailError(null);
    if (!accessToken || detailByOrderId[order.shopOrderId]) {
      return;
    }
    setDetailLoadingId(order.shopOrderId);
    try {
      const detail = await fetchMyOrderDetail(accessToken, order.shopOrderId);
      setDetailByOrderId((prev) => ({ ...prev, [order.shopOrderId]: detail }));
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : "상세를 불러오지 못했습니다.");
    } finally {
      setDetailLoadingId(null);
    }
  };

  if (!isReady) {
    return (
      <section className="panel">
        <h2>구매한 쿠폰 조회</h2>
        <p className="muted">불러오는 중…</p>
      </section>
    );
  }

  if (!accessToken) {
    return (
      <section className="panel">
        <h2>구매한 쿠폰 조회</h2>
        <p className="card-inline-msg">로그인 후 이용해 주세요.</p>
        <p>
          <Link href="/login?callbackUrl=%2Fmypage" className="button">
            로그인
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>구매한 쿠폰 조회</h2>
      <p className="muted" style={{ marginBottom: "1rem" }}>
        결제가 완료된 주문입니다. 행을 펼치면 상품별 쿠폰 번호를 확인할 수 있습니다.
      </p>

      {error ? (
        <p className="card-inline-msg" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="muted">불러오는 중…</p>
      ) : orders.length === 0 ? (
        <p className="muted">아직 구매 내역이 없습니다.</p>
      ) : (
        <div className="mypage-orders-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">주문번호</th>
                <th scope="col">결제금액</th>
                <th scope="col">발급 쿠폰</th>
                <th scope="col">구매일시</th>
                <th scope="col">상세</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o.shopOrderId}>
                  <tr>
                    <td>{o.merchantOrderId || o.shopOrderId}</td>
                    <td>{o.totalAmount.toLocaleString()}원</td>
                    <td>{o.issuedCouponCount}매</td>
                    <td>{formatDateTime(o.paidAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="button secondary"
                        style={{ padding: "6px 12px", fontSize: 13 }}
                        onClick={() => void toggleDetail(o)}
                        disabled={o.issuedCouponCount === 0}
                      >
                        {expandedId === o.shopOrderId ? "접기" : "쿠폰 번호"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === o.shopOrderId ? (
                    <tr className="mypage-order-detail-row">
                      <td colSpan={5}>
                        {detailLoadingId === o.shopOrderId ? (
                          <p className="muted">상세 불러오는 중…</p>
                        ) : detailError ? (
                          <p className="card-inline-msg" role="alert">
                            {detailError}
                          </p>
                        ) : detailByOrderId[o.shopOrderId] ? (
                          <MyOrderCouponDetail detail={detailByOrderId[o.shopOrderId]} />
                        ) : (
                          <p className="muted">상세를 불러오지 못했습니다.</p>
                        )}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted">환불 관련 처리는 본 사이트에서 제공하지 않습니다.</p>
    </section>
  );
}

function MyOrderCouponDetail({ detail }: { detail: CheckoutConfirmResult }) {
  const rows: { productName: string; code: string }[] = [];
  for (const line of detail.lines) {
    const codes = line.issuedCouponCodes?.length ? line.issuedCouponCodes : [""];
    for (const code of codes) {
      rows.push({ productName: line.productName, code: code.trim() });
    }
  }

  return (
    <div className="mypage-order-detail-inner">
      {detail.receiptUrl ? (
        <p style={{ marginBottom: "0.75rem" }}>
          <a href={detail.receiptUrl} target="_blank" rel="noreferrer" className="auth-text-link">
            결제 영수증 보기
          </a>
        </p>
      ) : null}
      <table className="table">
        <thead>
          <tr>
            <th scope="col">상품명</th>
            <th scope="col">쿠폰번호</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.productName}-${i}-${r.code}`}>
              <td>{r.productName}</td>
              <td>
                {r.code ? <span className="badge">{r.code}</span> : <span className="muted">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
