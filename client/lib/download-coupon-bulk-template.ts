/** 관리자 쿠폰 코드 대량등록용 빈 엑셀 양식 (A열 상품 ID, B열 쿠폰 번호) */

export async function downloadCouponBulkTemplateXlsx(fileName = "쿠폰코드_대량등록_양식.xlsx"): Promise<void> {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([
    ["상품 ID", "쿠폰 번호"],
    ["", ""],
    ["", ""],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "쿠폰등록");

  const raw = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([raw as unknown as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
