"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import { useAuth } from "../../context/AuthContext";
import { adminFetchDashboard } from "../../lib/api/admin-dashboard";
import type { AdminDashboardOverview } from "../../types/dashboard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function isoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AdminDashboardPage() {
  const { accessToken } = useAuth();
  const [data, setData] = useState<AdminDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartFromDraft, setChartFromDraft] = useState("");
  const [chartToDraft, setChartToDraft] = useState("");

  const fetchDash = useCallback(
    async (chartFrom?: string, chartTo?: string) => {
      if (!accessToken) return;
      setLoading(true);
      setError(null);
      try {
        const d = await adminFetchDashboard(accessToken, {
          chartFrom: chartFrom || undefined,
          chartTo: chartTo || undefined,
        });
        setData(d);
        if (chartFrom == null && chartTo == null && d.dailyRevenueSeries.length > 0) {
          const first = d.dailyRevenueSeries[0].date;
          const last = d.dailyRevenueSeries[d.dailyRevenueSeries.length - 1].date;
          setChartFromDraft(first);
          setChartToDraft(last);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "불러오기 실패");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (!accessToken) return;
    void fetchDash(undefined, undefined);
  }, [accessToken, fetchDash]);

  const onApplyRange = () => {
    if (!chartFromDraft || !chartToDraft) return;
    void fetchDash(chartFromDraft, chartToDraft);
  };

  const chartConfig = useMemo(() => {
    if (!data?.dailyRevenueSeries?.length) {
      return null;
    }
    const labels = data.dailyRevenueSeries.map((p) => p.date);
    const revenues = data.dailyRevenueSeries.map((p) => p.revenue);
    const orders = data.dailyRevenueSeries.map((p) => p.orderCount);
    return {
      labels,
      datasets: [
        {
          label: "일 매출 (원)",
          data: revenues,
          backgroundColor: "rgba(37, 99, 235, 0.55)",
          borderRadius: 6,
        },
      ],
      ordersMeta: orders,
    };
  }, [data]);

  const formatWon = (n: number) => `${n.toLocaleString("ko-KR")}원`;

  return (
    <>
      <header className="admin-page-head">
        <h1>대시보드</h1>
        <p>토탈쿠폰 운영 현황과 매출 추이를 확인합니다.</p>
      </header>

      {error ? (
        <p className="muted" style={{ marginBottom: 16 }}>
          {error}
        </p>
      ) : null}

      <div className="admin-stats admin-stats--dash">
        <article className="admin-stat-card">
          <h3>등록 회원 수</h3>
          <p className="admin-stat-value">{data?.registeredMemberCount ?? "—"}</p>
          <span className="admin-stat-hint">누적</span>
        </article>
        <article className="admin-stat-card">
          <h3>미답변 1:1 문의</h3>
          <p className="admin-stat-value">{data?.unansweredInquiryCount ?? "—"}</p>
          <span className="admin-stat-hint">OPEN 상태</span>
        </article>
        <article className="admin-stat-card">
          <h3>남은 쿠폰 재고</h3>
          <p className="admin-stat-value">{data?.couponStockRemaining ?? "—"}</p>
          <span className="admin-stat-hint">미판매(AVAILABLE)</span>
        </article>
      </div>

      <div className="admin-stats admin-stats--dash" style={{ marginTop: 4 }}>
        <article className="admin-stat-card">
          <h3>오늘 신규 주문</h3>
          <p className="admin-stat-value">{data?.todayNewOrders ?? "—"}</p>
          <span className="admin-stat-hint">결제 확정 건 (shop_orders)</span>
        </article>
        <article className="admin-stat-card">
          <h3>오늘 매출</h3>
          <p className="admin-stat-value">{data != null ? formatWon(data.todayRevenue) : "—"}</p>
          <span className="admin-stat-hint">당일 합계</span>
        </article>
        <article className="admin-stat-card">
          <h3>총 매출</h3>
          <p className="admin-stat-value">{data != null ? formatWon(data.totalRevenue) : "—"}</p>
          <span className="admin-stat-hint">누적</span>
        </article>
      </div>

      <section className="admin-card" style={{ marginTop: 8 }}>
        <h2 className="admin-card-title">기간별 매출</h2>
        <div className="admin-toolbar" style={{ marginBottom: 12 }}>
          <label className="muted" style={{ fontSize: 13, fontWeight: 600 }}>
            시작
            <input
              type="date"
              className="admin-input"
              style={{ marginLeft: 8, maxWidth: 160, display: "inline-block", verticalAlign: "middle" }}
              value={chartFromDraft}
              onChange={(e) => setChartFromDraft(e.target.value)}
            />
          </label>
          <label className="muted" style={{ fontSize: 13, fontWeight: 600 }}>
            종료
            <input
              type="date"
              className="admin-input"
              style={{ marginLeft: 8, maxWidth: 160, display: "inline-block", verticalAlign: "middle" }}
              value={chartToDraft}
              onChange={(e) => setChartToDraft(e.target.value)}
            />
          </label>
          <button type="button" className="admin-btn-primary" onClick={() => onApplyRange()}>
            조회
          </button>
          <button
            type="button"
            className="admin-btn-outline"
            onClick={() => {
              const to = new Date();
              const from = new Date();
              from.setDate(from.getDate() - 29);
              setChartFromDraft(isoDateLocal(from));
              setChartToDraft(isoDateLocal(to));
              void fetchDash(isoDateLocal(from), isoDateLocal(to));
            }}
          >
            최근 30일
          </button>
        </div>
        {loading && !data ? (
          <p className="muted">불러오는 중…</p>
        ) : chartConfig ? (
          <div className="admin-dash-chart-wrap">
            <Bar
              data={{
                labels: chartConfig.labels,
                datasets: chartConfig.datasets,
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: "top" },
                  tooltip: {
                    callbacks: {
                      afterLabel: (ctx) => {
                        const idx = ctx.dataIndex;
                        const o = chartConfig.ordersMeta[idx];
                        return o != null ? `주문 건수: ${o}건` : "";
                      },
                    },
                  },
                },
                scales: {
                  x: { ticks: { maxRotation: 45, minRotation: 0 } },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (v) => `${Number(v).toLocaleString("ko-KR")}원`,
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <p className="muted">선택한 기간에 표시할 일별 데이터가 없습니다.</p>
        )}
      </section>

      <section className="admin-card">
        <h2 className="admin-card-title">바로 가기</h2>
        <div className="admin-quick-links">
          <Link href="/admin/orders">주문내역</Link>
          <Link href="/admin/members">회원 관리</Link>
          <Link href="/admin/inquiries">1:1 문의</Link>
          <Link href="/admin/notices">공지사항</Link>
          <Link href="/admin/categories">쿠폰 카테고리</Link>
          <Link href="/admin/products">쿠폰 상품</Link>
          <Link href="/admin/coupons/bulk-register">쿠폰 코드 대량 등록</Link>
        </div>
      </section>
    </>
  );
}
