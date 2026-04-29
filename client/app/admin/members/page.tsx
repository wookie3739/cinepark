"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  adminFetchMemberDetail,
  adminFetchMembers,
} from "../../../lib/api/customer-service";
import { formatPublishedDate } from "../../../lib/format-date";
import type { AdminMemberDetail, AdminMemberRow } from "../../../types/customer-service";

function roleLabel(role: string): string {
  if (role === "ADMIN") {
    return "관리자";
  }
  if (role === "USER") {
    return "회원";
  }
  return role;
}

export default function AdminMembersPage() {
  const { accessToken } = useAuth();
  const [rows, setRows] = useState<AdminMemberRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<AdminMemberDetail | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setLoading(true);
    setLoadErr(null);
    try {
      const page = await adminFetchMembers(accessToken, appliedQ, 0, 40);
      setRows(page.content);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, appliedQ]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    void load();
  }, [accessToken, load]);

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAppliedQ(searchDraft.trim());
  };

  const openDetail = async (id: number) => {
    if (!accessToken) {
      return;
    }
    try {
      const d = await adminFetchMemberDetail(accessToken, id);
      setDetail(d);
      setDetailOpen(true);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "상세 로드 실패");
    }
  };

  return (
    <>
      <header className="admin-page-head">
        <h1>회원 관리</h1>
        <p>가입 회원 목록 · 이메일·이름·전화번호로 검색 가능합니다.</p>
      </header>

      {loadErr ? (
        <p className="card-inline-msg" role="alert">
          {loadErr}
        </p>
      ) : null}

      <form className="admin-toolbar" onSubmit={onSearchSubmit} role="search">
        <input
          type="search"
          name="member-search"
          className="admin-search-input"
          placeholder="이메일, 이름, 전화번호"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          aria-label="회원 검색"
        />
        <button type="submit" className="admin-btn-primary">
          검색
        </button>
        <button
          type="button"
          className="admin-btn-sm"
          onClick={() => {
            setSearchDraft("");
            setAppliedQ("");
          }}
        >
          초기화
        </button>
      </form>

      {loading ? (
        <p className="muted">목록 불러오는 중…</p>
      ) : rows.length === 0 ? (
        <p className="muted">조건에 맞는 회원이 없습니다.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>이메일</th>
                <th>성함</th>
                <th>전화번호</th>
                <th>역할</th>
                <th>가입일</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.email}</td>
                  <td>{m.name}</td>
                  <td>{m.phoneNumber}</td>
                  <td>{roleLabel(m.role)}</td>
                  <td>{formatPublishedDate(m.createdAt)}</td>
                  <td>
                    <button type="button" className="admin-btn-sm" onClick={() => void openDetail(m.id)}>
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailOpen && detail ? (
        <div
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
            className="panel flat"
            style={{
              background: "var(--panel-flat-bg, #fff)",
              maxWidth: 480,
              width: "100%",
              padding: "1.25rem",
              borderRadius: 8,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>회원 상세 #{detail.id}</h2>
            <dl style={{ margin: 0, display: "grid", gap: "0.65rem", fontSize: "0.95rem" }}>
              <div>
                <dt className="muted" style={{ fontSize: "0.8rem", marginBottom: "0.15rem" }}>
                  이메일
                </dt>
                <dd style={{ margin: 0 }}>{detail.email}</dd>
              </div>
              <div>
                <dt className="muted" style={{ fontSize: "0.8rem", marginBottom: "0.15rem" }}>
                  이름
                </dt>
                <dd style={{ margin: 0 }}>{detail.name}</dd>
              </div>
              <div>
                <dt className="muted" style={{ fontSize: "0.8rem", marginBottom: "0.15rem" }}>
                  전화번호
                </dt>
                <dd style={{ margin: 0 }}>{detail.phoneNumber}</dd>
              </div>
              <div>
                <dt className="muted" style={{ fontSize: "0.8rem", marginBottom: "0.15rem" }}>
                  역할
                </dt>
                <dd style={{ margin: 0 }}>{roleLabel(detail.role)}</dd>
              </div>
              <div>
                <dt className="muted" style={{ fontSize: "0.8rem", marginBottom: "0.15rem" }}>
                  가입일
                </dt>
                <dd style={{ margin: 0 }}>{formatPublishedDate(detail.createdAt)}</dd>
              </div>
              <div>
                <dt className="muted" style={{ fontSize: "0.8rem", marginBottom: "0.15rem" }}>
                  약관 동의
                </dt>
                <dd style={{ margin: 0 }}>
                  이용 {detail.agreeTerms ? "O" : "X"} · 개인정보 {detail.agreePrivacy ? "O" : "X"} · 마케팅{" "}
                  {detail.agreeMarketing ? "O" : "X"}
                </dd>
              </div>
            </dl>
            <div className="static-cta-row" style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="admin-btn-sm"
                onClick={() => {
                  setDetailOpen(false);
                  setDetail(null);
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
