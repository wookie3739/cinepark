import { getApiBaseUrl } from "../api-base";
import type { ApiResponse, MyProfile, MyProfileUpdatePayload } from "../../types/auth";

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

function headersJson(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

async function readEnvelope<T>(res: Response): Promise<T> {
  const body = (await parseJsonSafe(res)) as ApiResponse<T> | null;
  if (!body?.success) {
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
  return body.data as T;
}

export async function fetchMyProfile(accessToken: string): Promise<MyProfile> {
  const res = await fetch(apiUrl("/api/me"), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readEnvelope<MyProfile>(res);
}

export async function patchMyProfile(
  accessToken: string,
  payload: MyProfileUpdatePayload,
): Promise<MyProfile> {
  const res = await fetch(apiUrl("/api/me"), {
    method: "PATCH",
    headers: headersJson(accessToken),
    body: JSON.stringify(payload),
  });
  return readEnvelope<MyProfile>(res);
}
