"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { fetchMyInquiries } from "../../../../lib/api/customer-service";
import { formatPublishedDate, inquiryStatusLabel } from "../../../../lib/format-date";
import type { InquiryMine } from "../../../../types/customer-service";

export default function MyInquiriesPage() {
  const { accessToken, isReady } = useAuth();
  const [list, setList] = useState<InquiryMine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) {
      setList([]);
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const page = await fetchMyInquiries(accessToken, 0, 50);
      setList(page.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    void load();
  }, [isReady, load]);

  const toggleOpen = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  if (!isReady) {
    return (
      <section className="panel">
        <p className="muted">불러오는 중…</p>
      </section>
    );
  }

  if (!accessToken) {
    return (
      <section className="panel">
        <h2>내 문의</h2>
        <p className="card-inline-msg">로그인 후 이용해 주세요.</p>
        <p>
          <Link href="/login" className="button">
            로그인
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>내 문의</h2>
      <p className="muted" style={{ marginBottom: "1rem" }}>
        문의 제목을 눌러 작성 내용과 답변 전문을 확인하세요. 관리자가 답변을 등록하면 상태가 「답변완료」로 바뀝니다.
      </p>
      <div className="static-cta-row" style={{ marginBottom: "1rem" }}>
        <Link href="/support/inquiry" className="button">
          문의 작성
        </Link>
      </div>

      {error ? (
        <p className="card-inline-msg" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="muted">목록을 불러오는 중…</p>
      ) : list.length === 0 ? (
        <p className="muted">등록한 문의가 없습니다.</p>
      ) : (
        <ul className="inquiry-mine-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {list.map((row) => {
            const expanded = openId === row.id;
            return (
              <li
                key={row.id}
                className="inquiry-mine-card"
                style={{
                  marginBottom: "0.75rem",
                  border: "1px solid var(--hairline-color, rgba(0,0,0,0.12))",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: expanded ? "var(--panel-flat-bg, #fafafa)" : "transparent",
                }}
              >
                <button
                  type="button"
                  className="inquiry-mine-toggle"
                  onClick={() => toggleOpen(row.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "0.85rem 1rem",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    font: "inherit",
                  }}
                >
                  <span>
                    <span style={{ display: "block", fontWeight: 700 }}>{row.title}</span>
                    <span className="muted small-print" style={{ display: "block", marginTop: "0.25rem" }}>
                      {formatPublishedDate(row.createdAt)} · {inquiryStatusLabel(row.status)}
                    </span>
                  </span>
                  <span aria-hidden style={{ flexShrink: 0, opacity: 0.6 }}>
                    {expanded ? "닫기" : "펼치기"}
                  </span>
                </button>
                {expanded ? (
                  <div style={{ padding: "0 1rem 1rem", borderTop: "1px solid var(--hairline-color, rgba(0,0,0,0.08))" }}>
                    <p style={{ margin: "0.75rem 0 0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>내 문의 내용</p>
                    <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{row.content}</p>
                    <p style={{ margin: "1rem 0 0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>답변</p>
                    {row.status === "ANSWERED" && row.answer ? (
                      <>
                        <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{row.answer}</p>
                        {row.answeredAt ? (
                          <p className="muted small-print" style={{ marginTop: "0.5rem" }}>
                            답변일 {formatPublishedDate(row.answeredAt)}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="muted" style={{ margin: 0 }}>
                        아직 답변이 없습니다.
                      </p>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
