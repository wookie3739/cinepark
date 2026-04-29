export function formatPublishedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function inquiryStatusLabel(status: string): string {
  if (status === "ANSWERED") {
    return "답변완료";
  }
  if (status === "OPEN") {
    return "미답변";
  }
  return status;
}
