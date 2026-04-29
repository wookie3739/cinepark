import type { ApiResponse } from "../../types/auth";
import type { AdminDashboardOverview } from "../../types/dashboard";

import { getApiBaseUrl } from "../api-base";

async function parseJsonSafe(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function readEnvelope<T>(res: Response): Promise<T> {
  return parseJsonSafe(res).then((raw) => {
    const body = raw as ApiResponse<T> | null;
    if (!body?.success) {
      throw new Error(body?.message ?? `HTTP ${res.status}`);
    }
    return body.data as T;
  });
}

/** chartFrom·chartTo 미지정 시 서버 기본(최근 30일 등)으로 일별 시계열을 채운다. */
export async function adminFetchDashboard(
  accessToken: string,
  opts?: { chartFrom?: string; chartTo?: string },
): Promise<AdminDashboardOverview> {
  const qs = new URLSearchParams();
  if (opts?.chartFrom) qs.set("chartFrom", opts.chartFrom);
  if (opts?.chartTo) qs.set("chartTo", opts.chartTo);
  const suf = qs.toString() ? `?${qs.toString()}` : "";
  const res = await fetch(apiUrl(`/api/admin/dashboard${suf}`), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readEnvelope<AdminDashboardOverview>(res);
}
