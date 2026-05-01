"use client";

import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  adminAppendCouponCodes,
  adminCreateProduct,
  adminDeleteProduct,
  adminFetchCategories,
  adminFetchProductCouponCodes,
  adminFetchProductDetail,
  adminFetchProductPage,
  adminUpdateProduct,
} from "../../../lib/api/admin-catalog";
import { uploadCatalogImageViaPresign } from "../../../lib/catalog-upload";
import type {
  AdminCouponProductRow,
  CouponCategory,
  CouponCodeAdminRow,
  CouponProductSavePayload,
} from "../../../types/catalog";
import type { SpringPage } from "../../../types/customer-service";

/** 금액 입력(문자열) — 빈 문자열 허용해 백스페이스로 0부터 지울 수 있게 함 */
function wonInputToNumber(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return 0;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function numberToWonInput(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  return String(Math.floor(n));
}

const SHELF_EDIT_OPTS: { value: string; label: string }[] = [
  { value: "DRAFT", label: "임시 저장 (화면에 노출 안 함)" },
  { value: "ON_SALE", label: "판매 개시 (활성화)" },
  { value: "HIDDEN", label: "비활성화" },
];

function shelfLabelKo(status: string): string {
  switch (status) {
    case "DRAFT":
      return "임시 저장";
    case "ON_SALE":
      return "판매 중";
    case "HIDDEN":
      return "비활성";
    default:
      return status;
  }
}

function couponCodeStatusKo(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "미판매(재고)";
    case "USED":
      return "사용됨";
    case "VOID":
      return "무효";
    default:
      return status;
  }
}

function formatAdminInstant(s: string | null): string {
  if (s == null || s === "") return "—";
  try {
    return new Date(s).toLocaleString("ko-KR");
  } catch {
    return s;
  }
}

/** 줄 단위 쿠폰 번호 — 빈 줄 제거, 앞뒤 공백 제거, 입력 내 중복 제거(순서 유지) */
function parseCredentialLines(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (t === "" || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

const IMG_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export default function AdminProductsPage() {
  const { accessToken } = useAuth();
  const [page, setPage] = useState<SpringPage<AdminCouponProductRow> | null>(null);
  const [categories, setCategories] = useState<CouponCategory[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [brandLabel, setBrandLabel] = useState("");
  const [unitPriceInput, setUnitPriceInput] = useState("");
  const [originPriceInput, setOriginPriceInput] = useState("");
  const [usageUrlInput, setUsageUrlInput] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  /** 수정 시 노출 상태 */
  const [shelfEdit, setShelfEdit] = useState("ON_SALE");
  const [categoryId, setCategoryId] = useState<number>(0);

  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainBlobUrl, setMainBlobUrl] = useState<string | null>(null);
  const [mainRemoteUrl, setMainRemoteUrl] = useState<string | null>(null);
  const [mainKeyPersisted, setMainKeyPersisted] = useState<string | null>(null);
  const [mainCleared, setMainCleared] = useState(false);

  const [detailFiles, setDetailFiles] = useState<File[]>([]);
  const [detailRemoteUrls, setDetailRemoteUrls] = useState<string[]>([]);
  const [detailKeysJsonPersisted, setDetailKeysJsonPersisted] = useState<string | null>(null);
  const [detailCleared, setDetailCleared] = useState(false);

  const [codesModalRow, setCodesModalRow] = useState<AdminCouponProductRow | null>(null);
  const [codesPage, setCodesPage] = useState<SpringPage<CouponCodeAdminRow> | null>(null);
  const [codesLoading, setCodesLoading] = useState(false);
  const [codesErr, setCodesErr] = useState<string | null>(null);
  const [codesAppendDraft, setCodesAppendDraft] = useState("");
  const [codesAppendSaving, setCodesAppendSaving] = useState(false);

  useEffect(() => {
    if (!mainFile) {
      setMainBlobUrl(null);
      return;
    }
    const url = URL.createObjectURL(mainFile);
    setMainBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [mainFile]);

  const reload = useCallback(async () => {
    if (!accessToken) return;
    const [p, cats] = await Promise.all([
      adminFetchProductPage(accessToken, 0, 100),
      adminFetchCategories(accessToken),
    ]);
    setPage(p);
    setCategories(cats);
  }, [accessToken]);

  useEffect(() => {
    if (categories.length === 0) return;
    setCategoryId((prev) => (prev === 0 ? categories[0].id : prev));
  }, [categories]);

  useEffect(() => {
    if (!accessToken) return;
    setLoadErr(null);
    reload().catch((e) => setLoadErr(e instanceof Error ? e.message : "목록 로드 실패"));
  }, [accessToken, reload]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setBrandLabel("");
    setUnitPriceInput("");
    setOriginPriceInput("");
    setUsageUrlInput("");
    setShortDesc("");
    setShelfEdit("ON_SALE");
    setMainFile(null);
    setMainRemoteUrl(null);
    setMainKeyPersisted(null);
    setMainCleared(false);
    setDetailFiles([]);
    setDetailRemoteUrls([]);
    setDetailKeysJsonPersisted(null);
    setDetailCleared(false);
    if (categories.length > 0) setCategoryId(categories[0].id);
  }

  const openCreate = () => {
    resetForm();
    setFormOpen((o) => !o);
  };

  const openEdit = async (row: AdminCouponProductRow) => {
    if (!accessToken) return;
    setLoadErr(null);
    try {
      const d = await adminFetchProductDetail(accessToken, row.id);
      setEditingId(row.id);
      setName(d.name);
      setBrandLabel(d.brandLabel);
      setUnitPriceInput(numberToWonInput(d.unitPrice));
      setOriginPriceInput(numberToWonInput(d.originPrice));
      setUsageUrlInput(d.usageUrl ?? "");
      setShortDesc(d.shortDesc ?? "");
      setShelfEdit(String(row.shelfStatus));
      setCategoryId(d.categoryId ?? categories.find((c) => c.code === row.categoryCode)?.id ?? 0);
      setMainFile(null);
      setMainRemoteUrl(d.mainImageUrl ?? null);
      setMainKeyPersisted(d.mainImageKey ?? null);
      setMainCleared(false);
      setDetailFiles([]);
      setDetailRemoteUrls(d.detailImageUrls ?? []);
      setDetailKeysJsonPersisted(d.detailImageKeys ?? null);
      setDetailCleared(false);
      setFormOpen(true);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : "상세 로드 실패");
    }
  };

  const buildSavePayloadWithKeys = (mainImageKeyOut: string | null, detailImageKeysJson: string | null): CouponProductSavePayload => ({
    name: name.trim(),
    brandLabel: brandLabel.trim(),
    unitPrice: wonInputToNumber(unitPriceInput),
    originPrice: wonInputToNumber(originPriceInput),
    shortDesc: shortDesc || null,
    bullets: null,
    noticeHtml: null,
    usageUrl: usageUrlInput.trim() || null,
    mainImageKey: mainImageKeyOut,
    detailImageKeys: detailImageKeysJson,
    shelfStatus: editingId == null ? "ON_SALE" : shelfEdit,
    categoryId,
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setLoadErr(null);
    try {
      let mainKeyOut: string | null = mainCleared ? null : mainKeyPersisted;
      if (mainFile) {
        mainKeyOut = await uploadCatalogImageViaPresign(accessToken, mainFile);
      }

      let detailJson: string | null = null;

      if (detailCleared) {
        detailJson = null;
      } else if (detailFiles.length > 0) {
        const keys: string[] = [];
        for (const f of detailFiles) {
          keys.push(await uploadCatalogImageViaPresign(accessToken, f));
        }
        detailJson = JSON.stringify(keys);
      } else {
        detailJson = detailKeysJsonPersisted ?? null;
      }

      const payload = buildSavePayloadWithKeys(mainKeyOut, detailJson);

      if (editingId == null) {
        await adminCreateProduct(accessToken, payload);
      } else {
        await adminUpdateProduct(accessToken, editingId, payload);
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
    if (!accessToken || !confirm("이 상품을 삭제할까요? 관련 코드 풀이 함께 삭제되지 않을 수 있습니다.")) {
      return;
    }
    try {
      await adminDeleteProduct(accessToken, id);
      await reload();
    } catch (err) {
      setLoadErr(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  const fetchCodesPage = useCallback(
    async (row: AdminCouponProductRow, pageIdx: number) => {
      if (!accessToken) return;
      setCodesLoading(true);
      setCodesErr(null);
      try {
        const p = await adminFetchProductCouponCodes(accessToken, row.id, pageIdx, 25);
        setCodesPage(p);
      } catch (e) {
        setCodesErr(e instanceof Error ? e.message : "목록 로드 실패");
        setCodesPage(null);
      } finally {
        setCodesLoading(false);
      }
    },
    [accessToken],
  );

  const closeCodesModal = useCallback(() => {
    setCodesModalRow(null);
    setCodesPage(null);
    setCodesErr(null);
    setCodesAppendDraft("");
    setCodesAppendSaving(false);
  }, []);

  const openCodesModal = (row: AdminCouponProductRow) => {
    setCodesModalRow(row);
    setCodesPage(null);
    setCodesAppendDraft("");
    setCodesErr(null);
    void fetchCodesPage(row, 0);
  };

  const submitAppendCredentials = async () => {
    if (!accessToken || !codesModalRow) return;
    const credentials = parseCredentialLines(codesAppendDraft);
    if (credentials.length === 0) {
      setCodesErr("쿠폰 번호를 한 줄 이상 입력해 주세요.");
      return;
    }
    setCodesAppendSaving(true);
    setCodesErr(null);
    try {
      const { added } = await adminAppendCouponCodes(accessToken, codesModalRow.id, { credentials });
      setCodesAppendDraft("");
      setCodesModalRow((prev) => (prev ? { ...prev, availableStock: prev.availableStock + added } : null));
      await Promise.all([reload(), fetchCodesPage(codesModalRow, 0)]);
    } catch (e) {
      setCodesErr(e instanceof Error ? e.message : "재고 추가 실패");
    } finally {
      setCodesAppendSaving(false);
    }
  };

  useEffect(() => {
    if (!codesModalRow) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") closeCodesModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [codesModalRow, closeCodesModal]);

  const rows = page?.content ?? [];

  return (
    <>
      <header className="admin-page-head">
        <h1>쿠폰 상품</h1>
        <p>
          상품(SKU)을 등록합니다. 공개 상세 페이지는 <code>/coupons/&lt;상품 코드&gt;</code> 입니다. 쿠폰 번호는 목록「상세」
          모달에서 줄 단위로 넣거나, 왼쪽 메뉴「쿠폰 › 쿠폰 코드 대량 등록」으로 여러 상품에 나눠 넣을 수 있습니다.
        </p>
      </header>

      {loadErr ? (
        <p className="card-inline-msg" role="alert">
          {loadErr}
        </p>
      ) : null}

      <div className="admin-toolbar">
        <button type="button" className="admin-btn-primary" onClick={openCreate}>
          {formOpen && editingId == null ? "등록 폼 닫기" : "상품 등록"}
        </button>
      </div>

      {formOpen ? (
        <form className="admin-form panel flat" onSubmit={onSubmit} style={{ marginBottom: "1.5rem" }}>
          <h2 className="static-title">
            {editingId == null ? "상품 등록" : `상품 수정 (#${editingId})`}
          </h2>
          <div className="admin-form-row">
            <label htmlFor="cat">카테고리</label>
            <select
              id="cat"
              className="admin-select"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form-row">
            <label htmlFor="pname">상품명</label>
            <input
              id="pname"
              className="admin-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 롯데시네마 통합예매권"
              required
            />
          </div>
          <div className="admin-form-row">
            <label htmlFor="brand">브랜드</label>
            <input
              id="brand"
              className="admin-input"
              value={brandLabel}
              onChange={(e) => setBrandLabel(e.target.value)}
              placeholder="예: 롯데시네마"
              required
            />
          </div>
          <div className="admin-form-row">
            <label htmlFor="unit">판매가</label>
            <input
              id="unit"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="admin-input"
              value={unitPriceInput}
              onChange={(e) => setUnitPriceInput(e.target.value.replace(/\D/g, ""))}
              placeholder="예: 12000"
            />
          </div>
          <div className="admin-form-row">
            <label htmlFor="origin">정가</label>
            <input
              id="origin"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="admin-input"
              value={originPriceInput}
              onChange={(e) => setOriginPriceInput(e.target.value.replace(/\D/g, ""))}
              placeholder="예: 15000"
            />
          </div>
          <div className="admin-form-row">
            <label htmlFor="usageUrl">제휴 사용 링크(URL)</label>
            <input
              id="usageUrl"
              type="url"
              inputMode="url"
              autoComplete="off"
              className="admin-input admin-input-mono"
              value={usageUrlInput}
              onChange={(e) => setUsageUrlInput(e.target.value)}
              placeholder="예: https://brand.co.kr/redemption (고객이 쿠폰을 입력·사용할 제휴 페이지)"
            />
          </div>
          <p className="muted" style={{ margin: "-8px 0 16px", fontSize: 12, lineHeight: 1.6, maxWidth: 720 }}>
            미입력 시 상세·헤더·랜딩「쿠폰 사용 안내」·주문 완료에서 해당 상품 관련 버튼이 나오지 않습니다. 판매 중·재고가
            있고 URL이 있을 때만 목록(헤더·랜딩)에 노출됩니다. http(s)로 시작하는 전체 주소를 넣어 주세요.
          </p>
          <div className="admin-form-row">
            <label htmlFor="short">요약</label>
            <textarea
              id="short"
              className="admin-textarea admin-textarea--compact"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="예: 전국 롯데시네마에서 이용 가능한 통합예매권"
              rows={2}
            />
          </div>

          <div className="admin-form-row">
            <span className="admin-form-label-text">메인 이미지</span>
            <div className="admin-image-field">
              {(mainBlobUrl || (!mainCleared && mainRemoteUrl)) && (
                <div className="admin-image-preview-wrap">
                  <img
                    className="admin-image-preview"
                    src={mainCleared ? undefined : mainBlobUrl ?? mainRemoteUrl ?? undefined}
                    alt=""
                  />
                </div>
              )}
              <input
                id="mainImg"
                type="file"
                accept={IMG_ACCEPT}
                className="admin-bulk-file-input"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) {
                    setMainFile(f);
                    setMainCleared(false);
                  }
                }}
              />
              <label htmlFor="mainImg" className="admin-btn-outline admin-bulk-file-label">
                이미지 파일 선택
              </label>
              <button
                type="button"
                className="admin-btn-sm"
                onClick={() => {
                  setMainFile(null);
                  setMainCleared(true);
                  setMainRemoteUrl(null);
                  setMainKeyPersisted(null);
                }}
              >
                이미지 제거
              </button>
              <p className="muted admin-image-hint">
                저장 시 서버(S3)에 올라가며, 별도 URL을 입력할 필요가 없습니다. 지원: JPEG, PNG, WebP, GIF
              </p>
            </div>
          </div>

          <div className="admin-form-row">
            <span className="admin-form-label-text">상세 이미지</span>
            <div className="admin-image-field">
              {detailFiles.length > 0 ? (
                <ul className="admin-detail-thumb-list">
                  {detailFiles.map((f, idx) => (
                    <li key={`${f.name}-${idx}`}>
                      <span className="admin-detail-thumb-name">{f.name}</span>
                    </li>
                  ))}
                </ul>
              ) : !detailCleared && detailRemoteUrls.length > 0 ? (
                <ul className="admin-detail-thumb-list admin-detail-thumb-list--urls">
                  {detailRemoteUrls.map((u, idx) => (
                    <li key={`${idx}-${u}`}>
                      <img className="admin-detail-thumb-mini" src={u} alt="" width={72} height={72} loading="lazy" />
                    </li>
                  ))}
                </ul>
              ) : null}
              <input
                id="detailImg"
                type="file"
                accept={IMG_ACCEPT}
                multiple
                className="admin-bulk-file-input"
                onChange={(e) => {
                  const fs = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (fs.length === 0) return;
                  setDetailFiles(fs);
                  setDetailCleared(false);
                }}
              />
              <label htmlFor="detailImg" className="admin-btn-outline admin-bulk-file-label">
                여러 장 선택 가능
              </label>
              <button
                type="button"
                className="admin-btn-sm"
                onClick={() => {
                  setDetailFiles([]);
                  setDetailCleared(true);
                  setDetailRemoteUrls([]);
                  setDetailKeysJsonPersisted(null);
                }}
              >
                상세 이미지 전부 제거
              </button>
              <p className="muted admin-image-hint">
                새로 고르면 기존 이미지는 모두 교체됩니다. 순서대로 등록되며 저장 시 업로드됩니다.
              </p>
            </div>
          </div>

          {editingId != null ? (
            <div className="admin-form-row">
              <label htmlFor="shelf">노출·판매 상태</label>
              <select id="shelf" className="admin-select" value={shelfEdit} onChange={(e) => setShelfEdit(e.target.value)}>
                {SHELF_EDIT_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

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
              <th>상품 ID</th>
              <th>상품 코드</th>
              <th>카테고리</th>
              <th>상품명</th>
              <th>노출·판매</th>
              <th>가격</th>
              <th>사용 링크</th>
              <th>재고</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>
                  <span className="admin-code">{r.productCode}</span>
                  <div>
                    <Link
                      className="admin-product-preview-link"
                      href={`/coupons/${r.productCode}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      미리보기
                    </Link>
                  </div>
                </td>
                <td>
                  {r.categoryLabel}
                  <br />
                  <span className="muted">{r.categoryCode}</span>
                </td>
                <td>{r.name}</td>
                <td>{shelfLabelKo(r.shelfStatus)}</td>
                <td>{r.unitPrice.toLocaleString()}원</td>
                <td>{r.usageLinkRegistered ? "등록됨" : "—"}</td>
                <td>{r.availableStock}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button type="button" className="admin-btn-sm" onClick={() => openCodesModal(r)}>
                    상세
                  </button>
                  <button type="button" className="admin-btn-sm" onClick={() => void openEdit(r)}>
                    수정
                  </button>
                  <button type="button" className="admin-btn-sm" onClick={() => void onDelete(r.id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {page && page.totalPages > 1 ? (
        <p className="muted">
          페이지 {page.number + 1} / {page.totalPages}
        </p>
      ) : null}

      {codesModalRow ? (
        <div className="admin-modal-backdrop" role="presentation" onClick={closeCodesModal}>
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-coupon-codes-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-head">
              <div>
                <h2 id="admin-coupon-codes-title" className="admin-modal-title">
                  쿠폰 코드
                </h2>
                <p className="muted admin-modal-meta">
                  {codesModalRow.name} · 상품 ID {codesModalRow.id} · 상품 코드{" "}
                  <code className="admin-code">{codesModalRow.productCode}</code>
                  <br />
                  미판매 재고(등록 가능 수량): <strong>{codesModalRow.availableStock}</strong>
                </p>
              </div>
              <button type="button" className="admin-modal-close" onClick={closeCodesModal} aria-label="닫기">
                ×
              </button>
            </div>

            <div className="admin-form-row" style={{ marginBottom: "1rem" }}>
              <label htmlFor="admin-append-credentials">재고 추가(쿠폰 번호)</label>
              <textarea
                id="admin-append-credentials"
                className="admin-textarea"
                rows={4}
                value={codesAppendDraft}
                onChange={(e) => setCodesAppendDraft(e.target.value)}
                placeholder="한 줄에 쿠폰 번호 하나. 여러 줄 붙여넣기 가능."
                disabled={codesAppendSaving}
              />
              <div className="button-row" style={{ marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="admin-btn-primary"
                  disabled={codesAppendSaving || codesLoading}
                  onClick={() => void submitAppendCredentials()}
                >
                  {codesAppendSaving ? "추가 중…" : "재고 추가"}
                </button>
              </div>
            </div>

            {codesErr ? (
              <p className="card-inline-msg" role="alert">
                {codesErr}
              </p>
            ) : null}

            {codesLoading ? (
              <p className="muted">불러오는 중…</p>
            ) : codesPage ? (
              <>
                <div className="admin-table-wrap admin-table-wrap--in-modal">
                  <table className="admin-table admin-table--compact-codes">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>쿠폰 번호</th>
                        <th>상태</th>
                        <th>주문 ID</th>
                        <th>회원 ID</th>
                        <th>발급일</th>
                        <th>등록일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codesPage.content.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="muted">
                            등록된 쿠폰 코드가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        codesPage.content.map((c: CouponCodeAdminRow) => (
                          <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>
                              <code className="admin-code">{c.credential}</code>
                            </td>
                            <td>{couponCodeStatusKo(c.status)}</td>
                            <td>{c.orderId ?? "—"}</td>
                            <td>{c.issuedToUserId ?? "—"}</td>
                            <td>{formatAdminInstant(c.issuedAt)}</td>
                            <td>{formatAdminInstant(c.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {codesPage.totalPages > 1 ? (
                  <div className="admin-modal-pager">
                    <button
                      type="button"
                      className="admin-btn-sm"
                      disabled={codesPage.first}
                      onClick={() => void fetchCodesPage(codesModalRow, codesPage.number - 1)}
                    >
                      이전
                    </button>
                    <span className="muted">
                      {codesPage.number + 1} / {codesPage.totalPages}
                    </span>
                    <button
                      type="button"
                      className="admin-btn-sm"
                      disabled={codesPage.last}
                      onClick={() => void fetchCodesPage(codesModalRow, codesPage.number + 1)}
                    >
                      다음
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
