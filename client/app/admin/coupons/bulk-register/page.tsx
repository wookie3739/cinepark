"use client";

import { type ChangeEvent, type DragEvent, type FormEvent, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { adminBulkAppendCouponRows } from "../../../../lib/api/admin-catalog";
import { downloadCouponBulkTemplateXlsx } from "../../../../lib/download-coupon-bulk-template";
import { parseCouponBulkSpreadsheetFile } from "../../../../lib/parse-coupon-bulk";

export default function AdminCouponBulkRegisterPage() {
  const { accessToken } = useAuth();
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bulkParsedSheet, setBulkParsedSheet] = useState<{ productId: number; credential: string }[] | null>(
    null,
  );
  const [bulkFileHint, setBulkFileHint] = useState<string | null>(null);
  const [bulkDropActive, setBulkDropActive] = useState(false);

  const ingestBulkSpreadsheetParsed = async (file: File) => {
    setLoadErr(null);
    setSuccessMsg(null);
    try {
      const parsed = await parseCouponBulkSpreadsheetFile(file);

      if (parsed.kind === "sheet") {
        setBulkFileHint(parsed.hint);
        setBulkParsedSheet(parsed.rows);
        if (parsed.rows.length === 0) {
          setLoadErr("엑셀에서 인식된 행이 없습니다. A열 상품 ID, B열 쿠폰번호 형식을 확인해 주세요.");
        }
        return;
      }

      setBulkParsedSheet(null);
      setBulkFileHint(null);
      setLoadErr(
        "한 열만 있는 파일은 사용할 수 없습니다. A열에 상품 ID, B열에 쿠폰 번호가 있는 엑셀을 넣어 주세요.",
      );
    } catch (err) {
      setBulkParsedSheet(null);
      setBulkFileHint(null);
      setLoadErr(err instanceof Error ? err.message : "파일 처리 실패");
    }
  };

  const onBulkAppend = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (!bulkParsedSheet || bulkParsedSheet.length === 0) {
      setLoadErr("엑셀 파일을 먼저 넣어 주세요. (A열 상품 ID, B열 쿠폰 번호)");
      return;
    }

    setSaving(true);
    setLoadErr(null);
    setSuccessMsg(null);
    try {
      const { added } = await adminBulkAppendCouponRows(accessToken, bulkParsedSheet);
      setBulkParsedSheet(null);
      setBulkFileHint(null);
      setSuccessMsg(`${added}건이 추가되었습니다.`);
    } catch (err) {
      setLoadErr(err instanceof Error ? err.message : "등록 실패");
    } finally {
      setSaving(false);
    }
  };

  const onBulkFileChosen = async (ev: ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    ev.target.value = "";
    if (!f) return;
    await ingestBulkSpreadsheetParsed(f);
  };

  const onBulkDrag = (ev: DragEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    setBulkDropActive(ev.type === "dragenter" || ev.type === "dragover");
  };

  const onBulkDrop = async (ev: DragEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    setBulkDropActive(false);
    const f = ev.dataTransfer?.files?.[0];
    if (!f) return;
    await ingestBulkSpreadsheetParsed(f);
  };

  return (
    <>
      <header className="admin-page-head">
        <h1>쿠폰 코드 대량 등록</h1>
        <p>
          엑셀 양식(A열 상품 DB ID, B열 쿠폰 번호)으로 여러 상품에 쿠폰 코드를 한 번에 넣습니다. 상품 ID는{" "}
          <strong>쿠폰 상품</strong> 목록의「상품 ID」열 숫자를 사용합니다.
        </p>
      </header>

      {successMsg ? (
        <p className="card-inline-msg admin-msg-success" role="status">
          {successMsg}
        </p>
      ) : null}

      {loadErr ? (
        <p className="card-inline-msg" role="alert">
          {loadErr}
        </p>
      ) : null}

      <div className="panel flat admin-register-section">
        <div className="admin-bulk-title-row">
          <h2 className="static-title admin-register-section-title">엑셀 파일로 등록</h2>
          <button
            type="button"
            className="admin-btn-outline"
            onClick={() => void downloadCouponBulkTemplateXlsx()}
          >
            양식 다운로드 (.xlsx)
          </button>
        </div>

        <div className="admin-bulk-instructions muted">
          <p>
            첫 시트에서 <strong>A열</strong>은 아래 표의「상품 ID」(목록의 <strong>상품 ID</strong> 열 숫자),{" "}
            <strong>B열</strong>은 발급할 쿠폰 번호입니다. 1행에 제목을 넣어도 됩니다.
          </p>
          <table className="admin-bulk-sample-table">
            <thead>
              <tr>
                <th />
                <th scope="col">A열</th>
                <th scope="col">B열</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1행(제목)</th>
                <td>상품 ID</td>
                <td>쿠폰 번호</td>
              </tr>
              <tr>
                <th scope="row">2행~</th>
                <td>예: 12 (목록의 상품 ID)</td>
                <td>예: CODE-0001</td>
              </tr>
            </tbody>
          </table>
        </div>

        <form onSubmit={onBulkAppend} className="admin-form admin-form--compact">
          <div
            className={`admin-dropzone ${bulkDropActive ? "admin-dropzone--active" : ""}`}
            onDragEnter={onBulkDrag}
            onDragLeave={onBulkDrag}
            onDragOver={onBulkDrag}
            onDrop={onBulkDrop}
          >
            <p className="admin-dropzone-title">엑셀(xlsx 등)을 여기에 끌어다 놓기</p>
            <p className="muted admin-dropzone-sub">또는 파일 선택</p>
            <input
              type="file"
              id="bulkExcel"
              className="admin-bulk-file-input"
              accept=".xlsx,.xls,.xlsm,.csv,.txt,text/csv"
              onChange={onBulkFileChosen}
            />
            <label htmlFor="bulkExcel" className="admin-btn-outline admin-bulk-file-label">
              파일 선택
            </label>
            <span className="muted admin-bulk-file-note">xlsx / csv / txt</span>
          </div>

          {bulkFileHint ? <p className="card-inline-msg admin-bulk-file-hint">{bulkFileHint}</p> : null}

          <button type="submit" className="admin-btn-primary" disabled={saving || (bulkParsedSheet?.length ?? 0) === 0}>
            등록 실행
          </button>
        </form>
      </div>
    </>
  );
}
