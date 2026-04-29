import { getApiBaseUrl } from "./api-base";
import type { ApiResponse } from "../types/auth";

type PresignData = {
  uploadUrl: string;
  objectKey: string;
  expiresInMinutes: number;
};

/** presign 받은 뒤 브라우저에서 S3로 직접 업로드, DB 저장용 objectKey 반환 */
export async function uploadCatalogImageViaPresign(accessToken: string, file: File): Promise<string> {
  const base = getApiBaseUrl();
  const contentType =
    file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";

  const res = await fetch(`${base}/api/admin/catalog/images/presign-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name || "image.jpg",
      contentType,
    }),
  });

  const body = (await res.json()) as ApiResponse<PresignData> | null;
  if (!body?.success || !body.data?.uploadUrl || !body.data?.objectKey) {
    throw new Error(body?.message ?? "이미지 업로드 준비(presign)에 실패했습니다.");
  }

  const put = await fetch(body.data.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
    mode: "cors",
  });

  if (!put.ok) {
    throw new Error(`파일 업로드에 실패했습니다.(${put.status}) S3 CORS 설정을 확인해 주세요.`);
  }

  return body.data.objectKey;
}
