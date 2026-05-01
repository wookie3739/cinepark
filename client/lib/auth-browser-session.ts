/**
 * 브라우저 세션의 JWT 액세스 토큰.
 * 키는 `AuthContext`가 읽고 쓰는 값과 동일해야 합니다 (`AUTH_SESSION_ACCESS_KEY`).
 */
export const AUTH_SESSION_ACCESS_KEY = "cinepark_access_token";

export function getBrowserAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const t = sessionStorage.getItem(AUTH_SESSION_ACCESS_KEY);
    return t && t.trim() ? t.trim() : null;
  } catch {
    return null;
  }
}
