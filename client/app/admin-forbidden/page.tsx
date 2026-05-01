import { notFound } from "next/navigation";

/** proxy에서만 rewrite로 진입; 직접 접근 시에도 동일하게 404 처리 */
export default function AdminForbiddenTriggerPage() {
  notFound();
}
