import { getApiBaseUrl } from "../api-base";
import type { ApiResponse } from "../../types/auth";
import type {
  AdminMemberDetail,
  AdminMemberRow,
  FaqItem,
  FaqSavePayload,
  InquiryAdminDetail,
  InquiryAdminRow,
  InquiryCreatePayload,
  InquiryMine,
  NoticeDetail,
  NoticeSavePayload,
  NoticeSummary,
  SpringPage,
} from "../../types/customer-service";

async function parseJsonSafe(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function readEnvelope<T>(res: Response): Promise<T> {
  const body = (await parseJsonSafe(res)) as ApiResponse<T> | null;
  if (!body?.success) {
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
  return body.data as T;
}

function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function noticeSortParams(page: number, size: number): string {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  qs.append("sort", "pinned,desc");
  qs.append("sort", "createdAt,desc");
  return qs.toString();
}

export async function fetchNoticePage(page = 0, size = 20): Promise<SpringPage<NoticeSummary>> {
  const res = await fetch(apiUrl(`/api/notices?${noticeSortParams(page, size)}`), { cache: "no-store" });
  return readEnvelope<SpringPage<NoticeSummary>>(res);
}

export async function fetchNoticeDetail(id: number): Promise<NoticeDetail> {
  const res = await fetch(apiUrl(`/api/notices/${id}`), { cache: "no-store" });
  return readEnvelope<NoticeDetail>(res);
}

export async function fetchFaqList(): Promise<FaqItem[]> {
  const res = await fetch(apiUrl("/api/faqs"), { cache: "no-store" });
  return readEnvelope<FaqItem[]>(res);
}

async function authFetch<T>(
  path: string,
  init: RequestInit & { accessToken: string },
): Promise<T> {
  const { accessToken, headers: hdrs, ...rest } = init;
  const headers = new Headers(hdrs);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (rest.body && typeof rest.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(apiUrl(path), { ...rest, headers });
  return readEnvelope<T>(res);
}

async function authFetchVoid(path: string, init: RequestInit & { accessToken: string }): Promise<void> {
  const { accessToken, headers: hdrs, ...rest } = init;
  const headers = new Headers(hdrs);
  headers.set("Authorization", `Bearer ${accessToken}`);
  const res = await fetch(apiUrl(path), { ...rest, headers });
  const body = (await parseJsonSafe(res)) as ApiResponse<unknown> | null;
  if (!body?.success) {
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
}

export async function createInquiry(accessToken: string, payload: InquiryCreatePayload): Promise<InquiryMine> {
  return authFetch<InquiryMine>("/api/my/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export async function fetchMyInquiries(accessToken: string, page = 0, size = 20): Promise<SpringPage<InquiryMine>> {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  qs.append("sort", "createdAt,desc");
  return authFetch<SpringPage<InquiryMine>>(`/api/my/inquiries?${qs.toString()}`, {
    method: "GET",
    accessToken,
  });
}

export async function fetchMyInquiry(accessToken: string, id: number): Promise<InquiryMine> {
  return authFetch<InquiryMine>(`/api/my/inquiries/${id}`, {
    method: "GET",
    accessToken,
  });
}

export async function adminFetchNoticePage(accessToken: string, page = 0, size = 100): Promise<SpringPage<NoticeSummary>> {
  return authFetch<SpringPage<NoticeSummary>>(`/api/notices?${noticeSortParams(page, size)}`, {
    method: "GET",
    accessToken,
  });
}

export async function adminCreateNotice(accessToken: string, payload: NoticeSavePayload): Promise<NoticeDetail> {
  return authFetch<NoticeDetail>("/api/admin/notices", {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export async function adminUpdateNotice(accessToken: string, id: number, payload: NoticeSavePayload): Promise<NoticeDetail> {
  return authFetch<NoticeDetail>(`/api/admin/notices/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export async function adminDeleteNotice(accessToken: string, id: number): Promise<void> {
  await authFetchVoid(`/api/admin/notices/${id}`, { method: "DELETE", accessToken });
}

export async function adminCreateFaq(accessToken: string, payload: FaqSavePayload): Promise<FaqItem> {
  return authFetch<FaqItem>("/api/admin/faqs", {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export async function adminUpdateFaq(accessToken: string, id: number, payload: FaqSavePayload): Promise<FaqItem> {
  return authFetch<FaqItem>(`/api/admin/faqs/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export async function adminDeleteFaq(accessToken: string, id: number): Promise<void> {
  await authFetchVoid(`/api/admin/faqs/${id}`, { method: "DELETE", accessToken });
}

export async function adminFetchInquiries(accessToken: string, page = 0, size = 20): Promise<SpringPage<InquiryAdminRow>> {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  qs.append("sort", "createdAt,desc");
  return authFetch<SpringPage<InquiryAdminRow>>(`/api/admin/inquiries?${qs.toString()}`, {
    method: "GET",
    accessToken,
  });
}

export async function adminFetchInquiry(accessToken: string, id: number): Promise<InquiryAdminDetail> {
  return authFetch<InquiryAdminDetail>(`/api/admin/inquiries/${id}`, {
    method: "GET",
    accessToken,
  });
}

export async function adminAnswerInquiry(
  accessToken: string,
  id: number,
  answer: string,
): Promise<InquiryAdminDetail> {
  return authFetch<InquiryAdminDetail>(`/api/admin/inquiries/${id}/answer`, {
    method: "PATCH",
    body: JSON.stringify({ answer }),
    accessToken,
  });
}

export async function adminFetchMembers(
  accessToken: string,
  q = "",
  page = 0,
  size = 30,
): Promise<SpringPage<AdminMemberRow>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  params.append("sort", "createdAt,desc");
  const trimmed = q.trim();
  if (trimmed.length > 0) {
    params.set("q", trimmed);
  }
  return authFetch<SpringPage<AdminMemberRow>>(`/api/admin/members?${params.toString()}`, {
    method: "GET",
    accessToken,
  });
}

export async function adminFetchMemberDetail(accessToken: string, id: number): Promise<AdminMemberDetail> {
  return authFetch<AdminMemberDetail>(`/api/admin/members/${id}`, {
    method: "GET",
    accessToken,
  });
}
