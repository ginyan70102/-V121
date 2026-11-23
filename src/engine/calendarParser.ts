import { CalendarDataset, CalendarEntry } from '../types/travel';

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * 解析多種日期格式：
 * - 20260101 (政府資料開放平台標準格式)
 * - 2026/1/1, 2026-01-01, 2026.01.01
 * - 115/01/01, 1150101 (民國年自動轉西元年)
 */
export function normalizeCalendarDate(raw: string): string | null {
  const cleaned = raw.trim().replace(/^["']|["']$/g, '').trim();
  if (!cleaned) return null;

  // 8-digit YYYYMMDD
  if (/^\d{8}$/.test(cleaned)) {
    const y = Number(cleaned.slice(0, 4));
    const m = Number(cleaned.slice(4, 6));
    const d = Number(cleaned.slice(6, 8));
    if (y >= 1990 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${pad2(m)}-${pad2(d)}`;
    }
  }

  // 7-digit ROC YYYMMDD
  if (/^\d{7}$/.test(cleaned)) {
    const y = Number(cleaned.slice(0, 3)) + 1911;
    const m = Number(cleaned.slice(3, 5));
    const d = Number(cleaned.slice(5, 7));
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${pad2(m)}-${pad2(d)}`;
    }
  }

  // Delimited YYYY/M/D or YYYY-M-D or YYY/M/D
  const match = cleaned.match(/^(\d{2,4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (match) {
    let y = Number(match[1]);
    const m = Number(match[2]);
    const d = Number(match[3]);
    if (y < 200) y += 1911; // ROC year
    if (y >= 1990 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${pad2(m)}-${pad2(d)}`;
    }
  }

  return null;
}

function detectDelimiter(headerLine: string): string {
  const tabCount = (headerLine.match(/\t/g) || []).length;
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semiCount = (headerLine.match(/;/g) || []).length;
  if (tabCount >= commaCount && tabCount >= semiCount && tabCount > 0) return '\t';
  if (semiCount > commaCount && semiCount > 0) return ';';
  return ',';
}

function splitRow(line: string, delimiter: string): string[] {
  if (delimiter === '\t') {
    return line.split('\t').map((cell) => cell.trim().replace(/^"|"$/g, ''));
  }
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseIsHoliday(val: string, category: string, name: string): boolean {
  const v = val.trim().toLowerCase();
  if (['是', 'true', '1', '2', 'y', 'yes', '休', '放假'].includes(v)) return true;
  if (['否', 'false', '0', 'n', 'no', '班', '上班'].includes(v)) return false;
  // 若無明確欄位，依分類推測
  if (category.includes('補行上班')) return false;
  if (category.includes('放假') || category.includes('補假') || category.includes('星期六') || category.includes('星期日')) {
    return true;
  }
  return Boolean(name);
}

/**
 * V121 行政院辦公日曆表 CSV / TSV 解析器
 * - 自動辨識逗號 (,)、Tab (\t) 與分號 (;)
 * - 支援政府資料開放平台與 Excel 匯出格式
 * - 自動捕捉涵蓋年份並啟用年份智慧鎖定
 */
export function parseGovernmentCalendarText(
  rawText: string,
  fileName: string
): CalendarDataset {
  const cleanedText = rawText.replace(/^\uFEFF/, '').trim();
  const lines = cleanedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error('檔案內容不足，請確認為包含標題列的 CSV 或 TSV 辦公日曆表。');
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitRow(lines[0], delimiter).map((h) => h.toLowerCase().replace(/\s+/g, ''));

  const findCol = (candidates: string[]): number =>
    headers.findIndex((h) => candidates.some((c) => h === c || h.includes(c)));

  let dateIdx = findCol(['date', '西元日期', '日期']);
  let isHolidayIdx = findCol(['isholiday', '是否放假', '放假']);
  const categoryIdx = findCol(['holidaycategory', '類別', '假別', 'category']);
  const nameIdx = findCol(['name', 'description', '備註', '名稱', '節日', '說明']);

  // Fallback for headerless or non-standard first row
  let startLine = 1;
  if (dateIdx === -1) {
    const firstCols = splitRow(lines[0], delimiter);
    if (normalizeCalendarDate(firstCols[0] || '')) {
      dateIdx = 0;
      isHolidayIdx = firstCols.length > 2 ? 2 : 1;
      startLine = 0;
    } else {
      dateIdx = 0;
    }
  }

  const entries: Record<string, CalendarEntry> = {};
  const yearSet = new Set<number>();
  let parsedRows = 0;

  for (let i = startLine; i < lines.length; i++) {
    const cols = splitRow(lines[i], delimiter);
    const rawDate = cols[dateIdx] ?? '';
    const dateStr = normalizeCalendarDate(rawDate);
    if (!dateStr) continue;

    const year = Number(dateStr.slice(0, 4));
    yearSet.add(year);

    const category = categoryIdx >= 0 ? (cols[categoryIdx] ?? '').trim() : '';
    const nameRaw = nameIdx >= 0 ? (cols[nameIdx] ?? '').trim() : '';
    const holidayRaw = isHolidayIdx >= 0 ? (cols[isHolidayIdx] ?? '').trim() : '';
    const isHoliday = parseIsHoliday(holidayRaw, category, nameRaw);

    const resolvedName =
      nameRaw ||
      (isHoliday
        ? category || '國定放假日'
        : category.includes('補行上班')
        ? '補行上班日'
        : `${year} 正常工作日`);

    entries[dateStr] = {
      date: dateStr,
      isHoliday,
      category: category || (isHoliday ? '放假日' : '正常工作日'),
      name: resolvedName,
    };
    parsedRows++;
  }

  if (parsedRows === 0) {
    throw new Error('未解析到有效日期資料，請確認日期欄位格式（如 20260101 或 2026/01/01）。');
  }

  // V121 年份智慧鎖定：補齊所涵蓋年份之完整 365/366 天基準，未列於清單之平日自動視為正常工作日
  const years = Array.from(yearSet).sort((a, b) => b - a);
  let totalYearDays = 0;

  for (const year of years) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      totalYearDays++;
      if (!entries[dateStr]) {
        const dow = d.getDay();
        const isWeekend = dow === 0 || dow === 6;
        entries[dateStr] = {
          date: dateStr,
          isHoliday: isWeekend,
          category: isWeekend ? '星期六、星期日' : '正常工作日',
          name: isWeekend
            ? dow === 6
              ? '例假日（星期六）'
              : '例假日（星期日）'
            : `${year} 正常工作日`,
        };
      }
    }
  }

  return {
    sourceName: fileName,
    years,
    totalRecords: totalYearDays,
    entries,
    importedAt: new Date().toISOString(),
  };
}

export async function readCalendarFileWithEncodingFallback(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    try {
      return new TextDecoder('big5').decode(buffer);
    } catch {
      return new TextDecoder('utf-8').decode(buffer);
    }
  }
}
