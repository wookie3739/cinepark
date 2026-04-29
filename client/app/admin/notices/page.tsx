"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  adminCreateNotice,
  adminDeleteNotice,
  adminFetchNoticePage,
  adminUpdateNotice,
  fetchNoticeDetail,
} from "../../../lib/api/customer-service";
import { formatPublishedDate } from "../../../lib/format-date";
import type { NoticeSummary } from "../../../types/customer-service";

const CUSTOM_CATEGORY_VALUE = "__custom__";

const NOTICE_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "분류 없음" },
  { value: "[공지]", label: "[공지]" },
  { value: "[안내]", label: "[안내]" },
  { value: "[긴급]", label: "[긴급]" },
  { value: "[이벤트]", label: "[이벤트]" },
  { value: "[점검]", label: "[점검]" },
  { value: CUSTOM_CATEGORY_VALUE, label: "직접 입력" },
];

function categorySelectFromStored(category: string | null | undefined): { select: string; custom: string } {
  const c = category?.trim() ?? "";
  if (!c) {
    return { select: "", custom: "" };
  }
  const isPreset =
    NOTICE_CATEGORY_OPTIONS.some((o) => o.value !== "" && o.value !== CUSTOM_CATEGORY_VALUE && o.value === c);
  if (isPreset) {
    return { select: c, custom: "" };
  }
  return { select: CUSTOM_CATEGORY_VALUE, custom: c };
}

export default function AdminNoticesPage() {
  const { accessToken } = useAuth();
  const [rows, setRows] = useState<NoticeSummary[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryPreset, setCategoryPreset] = useState("");
  const [categoryCustom, setCategoryCustom] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    const page = await adminFetchNoticePage(accessToken, 0, 100);
    setRows(page.content);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    setLoadErr(null);
    reload().catch((e) => setLoadErr(e instanceof Error ? e.message : "목록 로드 실패"));
  }, [accessToken, reload]);

  function resetForm() {
    setEditingId(null);
    setCategoryPreset("");
    setCategoryCustom("");
    setTitle("");
    setBody("");
    setPinned(false);
  }

  const openCreate = () => {
    if (formOpen && editingId === null) {
      setFormOpen(false);
      resetForm();
      return;
    }
    resetForm();
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = async (id: number) => {
    try {
      const d = await fetchNoticeDetail(id);
      setEditingId(id);
      const cat = categorySelectFromStored(d.category);
      setCategoryPreset(cat.select);
      setCategoryCustom(cat.custom);
      setTitle(d.title);
      setBody(d.body);
      setPinned(d.pinned);
      setFormOpen(true);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : "상세 로드 실패");
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      return;
    }
    setSaving(true);
    setLoadErr(null);
    try {
      const categoryResolved =
        categoryPreset === CUSTOM_CATEGORY_VALUE
          ? categoryCustom.trim() || null
          : categoryPreset.trim() || null;
      const payload = {
        category: categoryResolved,
        title: title.trim(),
        body,
        pinned,
      };
      if (editingId == null) {
        await adminCreateNotice(accessToken, payload);
      } else {
        await adminUpdateNotice(accessToken, editingId, payload);
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
    if (!accessToken || !confirm("이 공지를 삭제할까요?")) {
      return;
    }
    setLoadErr(null);
    try {
      await adminDeleteNotice(accessToken, id);
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
        <h1>공지사항 관리</h1>
        <p>등록·수정·삭제는 서버 API와 연동됩니다.</p>
      </header>

      {loadErr ? (
        <p className="card-inline-msg" role="alert">
          {loadErr}
        </p>
      ) : null}

      <div className="admin-toolbar">
        <button type="button" className="admin-btn-primary" onClick={openCreate}>
          {formOpen && editingId == null ? "등록 폼 닫기" : "공지 등록"}
        </button>
      </div>

      {formOpen ? (
        <form className="admin-form panel flat" onSubmit={onSubmit} style={{ marginBottom: "1.5rem" }}>
          <h2 className="static-title" style={{ fontSize: "1.1rem" }}>
            {editingId == null ? "공지 등록" : `공지 수정 (#${editingId})`}
          </h2>
          <div className="auth-field">
            <label className="auth-label" htmlFor="n-cat-select">
              분류
            </label>
            <select
              id="n-cat-select"
              className="admin-select"
              value={categoryPreset}
              onChange={(e) => setCategoryPreset(e.target.value)}
            >
              {NOTICE_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value || "none"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {categoryPreset === CUSTOM_CATEGORY_VALUE ? (
            <div className="auth-field">
              <label className="auth-label" htmlFor="n-cat-custom">
                분류 직접 입력
              </label>
              <input
                id="n-cat-custom"
                value={categoryCustom}
                onChange={(e) => setCategoryCustom(e.target.value)}
                placeholder="예: [안내]"
                maxLength={32}
              />
            </div>
          ) : null}
          <div className="auth-field">
            <label className="auth-label" htmlFor="n-title">
              제목
            </label>
            <input id="n-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={255} />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="n-body">
              본문
            </label>
            <textarea
              id="n-body"
              className="inquiry-textarea"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <label className="auth-field" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            상단 고정
          </label>
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
              <th>No</th>
              <th>분류</th>
              <th>제목</th>
              <th>등록일</th>
              <th>상단고정</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((n) => (
              <tr key={n.id}>
                <td>{n.id}</td>
                <td>{n.category ?? "—"}</td>
                <td>{n.title}</td>
                <td>{formatPublishedDate(n.createdAt)}</td>
                <td>{n.pinned ? "예" : "아니오"}</td>
                <td>
                  <button type="button" className="admin-btn-sm" onClick={() => void openEdit(n.id)}>
                    수정
                  </button>{" "}
                  <button type="button" className="admin-btn-sm" onClick={() => void onDelete(n.id)}>
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
