/** 텍스트/CSV 줄 단위 또는 첫 번째 칸(탭·쉼표 구분, 엑셀 행 복사). */

export function normalizeCouponCell(s: string): string {
  let t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

function looksLikeHeaderRow(firstCell: string): boolean {
  const t = firstCell.trim().toLowerCase();
  return (
    [
      "code",
      "credential",
      "coupon",
      "coupon_no",
      "couponcode",
      "쿠폰",
      "쿠폰번호",
      "번호",
    ].includes(t) ||
    firstCell.trim().startsWith("#")
  );
}

/** 한 줄에서 쿠폰 코드 한 건 추출 — 탭이 있으면 첫 칸만, 없으면 쉼표로 구분된 첫 필드(단순), 그 외 줄 전체. */
export function extractFirstCouponField(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  if (trimmed.includes("\t")) {
    const first = trimmed.split("\t")[0];
    return normalizeCouponCell(first) || null;
  }

  if (trimmed.includes(",")) {
    const m = trimmed.match(/^"((?:[^"]|"")*)"\s*(?:,|$)/);
    if (m) {
      return m[1].replace(/""/g, '"').trim() || null;
    }
    return normalizeCouponCell(trimmed.split(",")[0]) || null;
  }

  return normalizeCouponCell(trimmed) || null;
}

/** 중복 제거(등장 순 유지). */
export function uniqOrdered(codes: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of codes) {
    if (seen.has(c)) continue;
    seen.add(c);
    out.push(c);
  }
  return out;
}

export function parseCouponCredentialsFromText(raw: string): string[] {
  const lines = raw.split(/\r?\n/);
  const rawCodes: string[] = [];
  for (const line of lines) {
    const cell = extractFirstCouponField(line);
    if (cell) rawCodes.push(cell);
  }
  return uniqOrdered(rawCodes);
}

async function readSpreadsheetMatrix(
  file: File,
): Promise<{ sheetName: string; matrix: (string | number | boolean | undefined)[][] } | null> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".xlsm") || lower.endsWith(".ods")) {
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    if (!sheet) {
      return null;
    }

    const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | undefined)[]>(sheet, {
      header: 1,
      defval: "",
      raw: false,
    });

    return { sheetName: sheetName ?? "Sheet1", matrix };
  }
  return null;
}

/** 엑셀 A열 상품 DB ID + B열 쿠폰 번호 또는, 헤더가 있으면 열 이름으로 찾음 */
export type BulkCouponSheetRow = { productId: number; credential: string };

export type ParsedBulkCouponFile =
  | { kind: "sheet"; rows: BulkCouponSheetRow[]; hint: string }
  | { kind: "codesOnly"; credentials: string[]; hint: string };

function detectPidCredColumns(headerCells: unknown[]): { pidIdx: number; credIdx: number } {
  const texts = headerCells.map((c) =>
    String(c ?? "")
      .trim()
      .toLowerCase(),
  );

  let pidIdx = 0;
  let credIdx = texts.length > 1 ? 1 : 0;

  texts.forEach((t, i) => {
    if (/^(상품\s*id|product\s*id|id)$/i.test(t.trim())) pidIdx = i;
  });

  texts.forEach((t, i) => {
    if (/쿠폰.*코드|^쿠폰번호$|credential|coupon|발급|pin|번호/.test(String(t ?? "")) && !/상품\s*코드/i.test(String(t ?? ""))) {
      credIdx = i;
    }
  });

  if (credIdx === pidIdx && texts.length > 1) {
    credIdx = pidIdx === 0 ? 1 : 0;
  }

  return { pidIdx, credIdx };
}

function parseMatrixBulkRows(matrix: (string | number | boolean | undefined)[][]): BulkCouponSheetRow[] {
  if (!matrix.length) return [];

  const r0 = matrix[0];
  if (!Array.isArray(r0) || r0.length < 2) return [];

  const s0 = String(r0[0] ?? "").trim();
  const s1 = String(r0[1] ?? "").trim();
  const pidTry = Number.parseInt(s0.replace(/\s/g, ""), 10);
  const headerPreferred =
    /[가-힣a-z]/i.test(s0) ||
    /\bid\b/i.test(s0) ||
    /상품\s*db\s*id|상품\s*번호/i.test(s0.toLowerCase());
  const startsWithNumericRow =
    Number.isFinite(pidTry) &&
    pidTry > 0 &&
    s1 !== "";

  let start = 1;
  let pidIdx = 0;
  let credIdx = 1;

  if (!headerPreferred || startsWithNumericRow) {
    start = 0;
    pidIdx = 0;
    credIdx = 1;
  } else {
    const cols = detectPidCredColumns(r0);
    pidIdx = cols.pidIdx;
    credIdx = cols.credIdx;
  }

  const out: BulkCouponSheetRow[] = [];
  for (let ri = start; ri < matrix.length; ri++) {
    const row = matrix[ri];
    if (!Array.isArray(row) || row.length === 0) continue;
    const rawPid = row[pidIdx];
    const rawCred = row[credIdx];
    if (rawCred == null) continue;

    const cred = String(rawCred).trim();
    if (!cred || cred.startsWith("#")) continue;

    const pidSan = String(rawPid ?? "")
      .replace(/\s/g, "")
      .replace(/,/g, "");
    const pidNum = Number.parseInt(pidSan, 10);

    if (!Number.isFinite(pidNum) || pidNum <= 0) continue;

    out.push({ productId: pidNum, credential: cred });
  }
  return out;
}

function spreadsheetFirstSheetOnlyCodes(
  matrix: (string | number | boolean | undefined)[][],
): { credentials: string[] } {
  const out: string[] = [];

  matrix.forEach((row, ri) => {
    if (!Array.isArray(row) || row.length === 0) return;
    const c0 = row[0] != null ? String(row[0]).trim() : "";

    if (ri === 0 && matrix.length > 1 && looksLikeHeaderRow(c0)) {
      return;
    }
    if (!c0) return;
    out.push(c0);
  });

  const credentials = uniqOrdered(out);
  return { credentials };
}

export async function parseCredentialExcelOrTextFile(
  file: File,
): Promise<{ credentials: string[]; hint: string }> {
  const sheet = await readSpreadsheetMatrix(file);

  if (sheet) {
    const { credentials } = spreadsheetFirstSheetOnlyCodes(sheet.matrix);
    return {
      credentials,
      hint:
        credentials.length === 0
          ? "첫 열(A열)에 번호만 있는지 확인해 주세요."
          : `"${sheet.sheetName}" 시트 첫 열 기준 ${credentials.length}건`,
    };
  }

  const text = await file.text();
  const credentials = parseCouponCredentialsFromText(text);
  return {
    credentials,
    hint: credentials.length === 0 ? "인식된 코드가 없습니다." : `파일에서 ${credentials.length}건`,
  };
}

/** 엑셀 2열(상품 ID + 코드) 또는 1열(코드만) 판별 */
export async function parseCouponBulkSpreadsheetFile(file: File): Promise<ParsedBulkCouponFile> {
  const sheet = await readSpreadsheetMatrix(file);

  if (sheet) {
    const { sheetName, matrix } = sheet;

    let maxCols = 0;
    matrix.forEach((row) => {
      if (Array.isArray(row) && row.length > maxCols) maxCols = row.length;
    });

    if (maxCols >= 2) {
      const rows = parseMatrixBulkRows(matrix);
      if (rows.length > 0) {
        return {
          kind: "sheet",
          rows,
          hint: `"${sheetName}" 첫 시트 기준 상품별 코드 ${rows.length}건 인식했습니다.`,
        };
      }
    }

    const { credentials } = spreadsheetFirstSheetOnlyCodes(matrix);
    return {
      kind: "codesOnly",
      credentials,
      hint:
        credentials.length === 0
          ? "두 열(상품 ID·쿠폰번호) 또는 첫 열(코드만) 형식을 확인해 주세요."
          : `첫 열만 읽었습니다 (${credentials.length}건). 같은 상품에만 넣으려면 아래 서식에서 「상품 ID」를 채워 주세요.`,
    };
  }

  const text = await file.text();
  const credentials = parseCouponCredentialsFromText(text);
  const twoColLines = text.split(/\r?\n/).filter((ln) => {
    const cells = ln.split("\t").map((x) => x.trim());
    return cells.length >= 2 && cells[1]!.length > 0 && /^-?\d+$/.test(cells[0]!.replace(/\s/g, ""));
  });

  if (twoColLines.length > 0) {
    const rows: BulkCouponSheetRow[] = [];
    for (const ln of text.split(/\r?\n/)) {
      const t = ln.trim();
      if (!t || t.startsWith("#")) continue;
      let a = "";
      let b = "";
      if (t.includes("\t")) {
        const p = t.split("\t").map((x) => x.trim());
        [a = "", b = ""] = p;
      } else if (t.includes(",")) {
        const p = t.split(",").map((x) => x.trim());
        [a = "", b = ""] = p;
      } else continue;
      const pid = Number.parseInt(a.replace(/\s/g, ""), 10);

      if (!Number.isFinite(pid) || pid <= 0 || !b) continue;
      rows.push({ productId: pid, credential: b });
    }
    if (rows.length > 0) {
      return {
        kind: "sheet",
        rows,
        hint: `태블러 텍스트에서 ${rows.length}건 인식했습니다.`,
      };
    }
  }

  return {
    kind: "codesOnly",
    credentials,
    hint: credentials.length === 0 ? "인식된 코드가 없습니다." : `파일에서 ${credentials.length}건`,
  };
}
