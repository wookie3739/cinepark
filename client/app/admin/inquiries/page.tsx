"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  adminAnswerInquiry,
  adminFetchInquiries,
  adminFetchInquiry,
} from "../../../lib/api/customer-service";
import { formatPublishedDate, inquiryStatusLabel } from "../../../lib/format-date";
import type { InquiryAdminDetail, InquiryAdminRow } from "../../../types/customer-service";

export default function AdminInquiriesPage() {
  const { accessToken } = useAuth();
  const [rows, setRows] = useState<InquiryAdminRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [savingLocal, setSavingLocal] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<InquiryAdminDetail | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    const page = await adminFetchInquiries(accessToken, 0, 50);
    setRows(page.content);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    setLoadErr(null);
    reload().catch((e) => setLoadErr(e instanceof Error ? e.message : "목록 로드 실패"));
  }, [accessToken, reload]);

  const openAnswer = async (id: number) => {
    if (!accessToken) {
      return;
    }
    setPending(true);
    setSaveErr(null);
    try {
      const d = await adminFetchInquiry(accessToken, id);
      setDetail(d);
      setAnswerText(d.answer ?? "");
      setDetailOpen(true);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : "상세 로드 실패");
    } finally {
      setPending(false);
    }
  };

  const onSaveAnswer = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken || !detail) {
      return;
    }
    setSavingLocal(true);
    setSaveErr(null);
    try {
      await adminAnswerInquiry(accessToken, detail.id, answerText.trim());
      setDetailOpen(false);
      setDetail(null);
      await reload();
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSavingLocal(false);
    }
  };

  return (
    <>
      <header className="admin-page-head">
        <h1>1:1 문의 관리</h1>
        <p>문의 상세 확인 및 답변 등록(API 연동)</p>
      </header>

      {loadErr ? (
        <p className="card-inline-msg" role="alert">
          {loadErr}
        </p>
      ) : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>No</th>
              <th>작성자</th>
              <th>제목</th>
              <th>작성일</th>
              <th>상태</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.writerEmail}</td>
                <td>{t.title}</td>
                <td>{formatPublishedDate(t.createdAt)}</td>
                <td>{inquiryStatusLabel(t.status)}</td>
                <td>
                  <button
                    type="button"
                    className="admin-btn-sm"
                    disabled={pending}
                    onClick={() => void openAnswer(t.id)}
                  >
                    답변
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailOpen && detail ? (
        <div
          className="panel flat"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              background: "var(--panel-bg, #fff)",
              maxWidth: 560,
              width: "100%",
              padding: "1.25rem",
              borderRadius: 8,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>문의 #{detail.id}</h2>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
              <strong>작성자</strong> {detail.writerName} ({detail.writerEmail})
            </p>
            <p style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>{detail.title}</p>
            <p style={{ whiteSpace: "pre-wrap", marginBottom: "1rem", fontSize: "0.95rem" }}>{detail.content}</p>
            <form onSubmit={onSaveAnswer}>
              {saveErr ? (
                <p className="card-inline-msg" role="alert">
                  {saveErr}
                </p>
              ) : null}
              <label className="auth-label" htmlFor="ans-body">
                답변
              </label>
              <textarea
                id="ans-body"
                className="inquiry-textarea"
                rows={5}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                required
              />
              <div className="static-cta-row" style={{ marginTop: "1rem" }}>
                <button type="submit" className="admin-btn-primary" disabled={savingLocal}>
                  {savingLocal ? "저장 중…" : "답변 저장"}
                </button>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => {
                    setDetailOpen(false);
                    setDetail(null);
                  }}
                >
                  닫기
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
