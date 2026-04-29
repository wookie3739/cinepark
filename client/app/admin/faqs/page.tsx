"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { adminCreateFaq, adminDeleteFaq, adminUpdateFaq, fetchFaqList } from "../../../lib/api/customer-service";
import type { FaqItem } from "../../../types/customer-service";

export default function AdminFaqsPage() {
  const { accessToken } = useAuth();
  const [rows, setRows] = useState<FaqItem[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  /** 서버 @NotNull sortOrder — 신규는 0, 수정은 기존 값 유지 */
  const [persistedSortOrder, setPersistedSortOrder] = useState(0);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    const list = await fetchFaqList();
    setRows(list);
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    setLoadErr(null);
    reload().catch((e) => setLoadErr(e instanceof Error ? e.message : "목록 로드 실패"));
  }, [accessToken, reload]);

  function resetForm() {
    setEditingId(null);
    setPersistedSortOrder(0);
    setQuestion("");
    setAnswer("");
  }

  const openCreate = () => {
    if (formOpen && editingId === null) {
      setFormOpen(false);
      resetForm();
      return;
    }
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setPersistedSortOrder(item.sortOrder);
    setQuestion(item.question);
    setAnswer(item.answer);
    setFormOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      return;
    }
    setSaving(true);
    setLoadErr(null);
    try {
      const sortOrder = editingId == null ? 0 : persistedSortOrder;
      const payload = { question: question.trim(), answer, sortOrder };
      if (editingId == null) {
        await adminCreateFaq(accessToken, payload);
      } else {
        await adminUpdateFaq(accessToken, editingId, payload);
      }
      resetForm();
      setFormOpen(false);
      await reload();
    } catch (err) {
      setLoadErr(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!accessToken || !confirm("이 FAQ를 삭제할까요?")) {
      return;
    }
    try {
      await adminDeleteFaq(accessToken, id);
      await reload();
      if (editingId === id) {
        resetForm();
        setFormOpen(false);
      }
    } catch (err) {
      setLoadErr(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  return (
    <>
      <header className="admin-page-head">
        <h1>FAQ 관리</h1>
        <p>자주 하는 질문 등록·수정·삭제</p>
      </header>

      {loadErr ? (
        <p className="card-inline-msg" role="alert">
          {loadErr}
        </p>
      ) : null}

      <div className="admin-toolbar">
        <button type="button" className="admin-btn-primary" onClick={openCreate}>
          {formOpen && editingId == null ? "등록 폼 닫기" : "FAQ 등록"}
        </button>
      </div>

      {formOpen ? (
        <form className="admin-form panel flat" onSubmit={onSubmit} style={{ marginBottom: "1.5rem" }}>
          <h2 className="static-title" style={{ fontSize: "1.1rem" }}>
            {editingId == null ? "FAQ 등록" : `FAQ 수정 (#${editingId})`}
          </h2>
          <div className="auth-field">
            <label className="auth-label" htmlFor="fq-q">
              질문
            </label>
            <input id="fq-q" value={question} onChange={(e) => setQuestion(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="fq-a">
              답변
            </label>
            <textarea
              id="fq-a"
              className="inquiry-textarea"
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />
          </div>
          <div className="static-cta-row">
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              className="admin-btn-outline"
              onClick={() => {
                resetForm();
                setFormOpen(false);
              }}
            >
              취소
            </button>
          </div>
        </form>
      ) : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>질문</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.id}>
                <td>{f.question}</td>
                <td>
                  <button type="button" className="admin-btn-sm" onClick={() => openEdit(f)}>
                    수정
                  </button>{" "}
                  <button type="button" className="admin-btn-sm" onClick={() => void onDelete(f.id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
