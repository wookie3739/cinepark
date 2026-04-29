/** 백엔드 API 베이스 URL (예: Next dev 프록시 없이 브라우저에서 직접 호출 시) */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";
}
