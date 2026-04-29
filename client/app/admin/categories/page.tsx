"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminFetchCategories,
  adminUpdateCategory,
} from "../../../lib/api/admin-catalog";
import type { CouponCategory, CouponCategorySavePayload } from "../../../types/catalog";

export default function AdminCategoriesPage() {
  const { accessToken } = useAuth();
  const [rows, setRows] = useState<CouponCategory[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [active, setActive] = useState(true);

  const reload = useCallback(async () => {
    if (!accessToken) return;
    const list = await adminFetchCategories(accessToken);
    setRows(list);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    setLoadErr(null);
    reload().catch((e) => setLoadErr(e instanceof Error ? e.message : "목록 로드 실패"));
  }, [accessToken, reload]);

  function resetForm() {
    setEditingId(null);
    setCode("");
    setLabel("");
    setSortOrder(0);
    setActive(true);
  }

  const openCreate = () => {
    resetForm();
    setFormOpen((o) => !o);
  };

  const openEdit = (c: CouponCategory) => {
    setEditingId(c.id);
    setCode(c.code);
    setLabel(c.label);
    setSortOrder(c.sortOrder);
    setActive(c.active);
    setFormOpen(true);
  };

  const payload = (): CouponCategorySavePayload => ({
    code: code.trim(),
    label: label.trim(),
    sortOrder,
    active,
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setLoadErr(null);
    try {
      if (editingId == null) {
        await adminCreateCategory(accessToken, payload());
      } else {
        await adminUpdateCategory(accessToken, editingId, payload());
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
    if (!accessToken || !confirm("이 카테고리를 삭제할까요? 하위 상품이 있으면 실패할 수 있습니다.")) {
      return;
    }
    try {
      await adminDeleteCategory(accessToken, id);
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
        <h1>쿠폰 카테고리</h1>
        <p>코드·라벨·정렬·노출 여부를 관리합니다.</p>
      </header>

      {loadErr ? (
        <p className="card-inline-msg" role="alert">
          {loadErr}
        </p>
      ) : null}

      <div className="admin-toolbar">
        <button type="button" className="admin-btn-primary" onClick={openCreate}>
          {formOpen && editingId == null ? "등록 폼 닫기" : "카테고리 등록"}
        </button>
      </div>

      {formOpen ? (
        <form className="admin-form panel flat" onSubmit={onSubmit} style={{ marginBottom: "1.5rem" }}>
          <h2 className="static-title">
            {editingId == null ? "카테고리 등록" : `카테고리 수정 (#${editingId})`}
          </h2>
          <div className="admin-form-row">
            <label htmlFor="ccode">코드</label>
            <input
              id="ccode"
              className="admin-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="예: movie"
              required
              maxLength={64}
              disabled={editingId != null}
            />
          </div>
          <div className="admin-form-row">
            <label htmlFor="clabel">라벨</label>
            <input
              id="clabel"
              className="admin-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="예: 영화관"
              required
              maxLength={200}
            />
          </div>
          <div className="admin-form-row">
            <label htmlFor="csort">정렬</label>
            <input
              id="csort"
              type="number"
              className="admin-input"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number.parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div className="admin-form-row admin-form-row--check">
            <label htmlFor="cactive">노출</label>
            <span className="admin-checkbox">
              <input id="cactive" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <span className="admin-checkbox-hint">목록에 표시합니다</span>
            </span>
          </div>
          <div className="button-row">
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              저장
            </button>
          </div>
        </form>
      ) : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>코드</th>
              <th>라벨</th>
              <th>정렬</th>
              <th>노출</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.code}</td>
                <td>{c.label}</td>
                <td>{c.sortOrder}</td>
                <td>{c.active ? "예" : "아니오"}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button type="button" className="admin-btn-sm" onClick={() => openEdit(c)}>
                    수정
                  </button>
                  <button type="button" className="admin-btn-sm" onClick={() => void onDelete(c.id)}>
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
