import { getApiBaseUrl } from "../api-base";
import type {
  ApiResponse,
  AuthResponse,
  FindIdResponse,
  LoginRequest,
  RegisterRequest,
} from "../../types/auth";

async function parseJsonSafe(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function ensureSuccess<T>(body: ApiResponse<T> | null, fallbackMessage: string): ApiResponse<T> {
  if (!body || !body.success) {
    throw new Error(body?.message ?? fallbackMessage);
  }
  return body;
}

export async function login(request: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const body = (await parseJsonSafe(res)) as ApiResponse<AuthResponse> | null;
  if (!body) {
    return { success: false, message: "응답을 해석할 수 없습니다.", errorCode: "PARSE" };
  }
  return body;
}

export async function register(request: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const body = (await parseJsonSafe(res)) as ApiResponse<AuthResponse> | null;
  if (!body) {
    return { success: false, message: "응답을 해석할 수 없습니다.", errorCode: "PARSE" };
  }
  return body;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<ApiResponse<{ accessToken: string; refreshToken?: string }>> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const body = (await parseJsonSafe(res)) as ApiResponse<{ accessToken: string; refreshToken?: string }> | null;
  if (!body) {
    return { success: false, message: "응답을 해석할 수 없습니다.", errorCode: "PARSE" };
  }
  return body;
}

export async function logoutRemote(): Promise<void> {
  try {
    await fetch(`${getApiBaseUrl()}/api/auth/logout`, { method: "POST" });
  } catch {
    /* noop */
  }
}

export async function findIdByPhone(phoneNumber: string): Promise<FindIdResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/find-id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });
  const body = (await parseJsonSafe(res)) as ApiResponse<FindIdResponse> | null;
  const ok = ensureSuccess(body, "아이디 조회에 실패했습니다.");
  if (!ok.data) {
    throw new Error("응답 데이터가 없습니다.");
  }
  return ok.data;
}

export async function sendPasswordResetCode(email: string): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/password-reset/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const body = (await parseJsonSafe(res)) as ApiResponse<unknown> | null;
  ensureSuccess(body, "인증번호 발송에 실패했습니다.");
}

export async function confirmPasswordReset(payload: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/password-reset/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await parseJsonSafe(res)) as ApiResponse<unknown> | null;
  ensureSuccess(body, "비밀번호 변경에 실패했습니다.");
}
