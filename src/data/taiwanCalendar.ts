import { CalendarDataset, CalendarEntry } from '../types/travel';

interface HolidayDef {
  date: string;
  isHoliday: boolean;
  category: string;
  name: string;
}

const TAIWAN_SPECIAL_DAYS_2025_2026: HolidayDef[] = [
  // 2025 (民國 114 年) 行政院人事行政總處辦公日曆表
  { date: '2025-01-01', isHoliday: true, category: '放假之紀念日及節日', name: '中華民國開國紀念日' },
  { date: '2025-01-25', isHoliday: true, category: '星期六、星期日', name: '例假日' },
  { date: '2025-01-26', isHoliday: true, category: '星期六、星期日', name: '例假日' },
  { date: '2025-01-27', isHoliday: true, category: '調整放假日', name: '小年夜調整放假' },
  { date: '2025-01-28', isHoliday: true, category: '放假之紀念日及節日', name: '農曆除夕' },
  { date: '2025-01-29', isHoliday: true, category: '放假之紀念日及節日', name: '春節初一' },
  { date: '2025-01-30', isHoliday: true, category: '放假之紀念日及節日', name: '春節初二' },
  { date: '2025-01-31', isHoliday: true, category: '放假之紀念日及節日', name: '春節初三' },
  { date: '2025-02-08', isHoliday: false, category: '補行上班日', name: '補行上班（1/27 調整放假補班）' },
  { date: '2025-02-28', isHoliday: true, category: '放假之紀念日及節日', name: '和平紀念日' },
  { date: '2025-04-03', isHoliday: true, category: '補假', name: '兒童節補假' },
  { date: '2025-04-04', isHoliday: true, category: '放假之紀念日及節日', name: '兒童節及民族掃墓節' },
  { date: '2025-05-30', isHoliday: true, category: '補假', name: '端午節補假' },
  { date: '2025-05-31', isHoliday: true, category: '放假之紀念日及節日', name: '端午節' },
  { date: '2025-09-28', isHoliday: true, category: '放假之紀念日及節日', name: '孔子誕辰紀念日（教師節）' },
  { date: '2025-09-29', isHoliday: true, category: '補假', name: '教師節補假' },
  { date: '2025-10-06', isHoliday: true, category: '放假之紀念日及節日', name: '中秋節' },
  { date: '2025-10-10', isHoliday: true, category: '放假之紀念日及節日', name: '國慶日' },
  { date: '2025-10-24', isHoliday: true, category: '補假', name: '臺灣光復暨金門古寧頭大捷紀念日補假' },
  { date: '2025-10-25', isHoliday: true, category: '放假之紀念日及節日', name: '臺灣光復暨金門古寧頭大捷紀念日' },
  { date: '2025-12-25', isHoliday: true, category: '放假之紀念日及節日', name: '行憲紀念日' },

  // 2026 (民國 115 年) 行政院人事行政總處辦公日曆表
  { date: '2026-01-01', isHoliday: true, category: '放假之紀念日及節日', name: '中華民國開國紀念日' },
  { date: '2026-02-15', isHoliday: true, category: '放假之紀念日及節日', name: '小年夜' },
  { date: '2026-02-16', isHoliday: true, category: '放假之紀念日及節日', name: '農曆除夕' },
  { date: '2026-02-17', isHoliday: true, category: '放假之紀念日及節日', name: '春節初一' },
  { date: '2026-02-18', isHoliday: true, category: '放假之紀念日及節日', name: '春節初二' },
  { date: '2026-02-19', isHoliday: true, category: '放假之紀念日及節日', name: '春節初三' },
  { date: '2026-02-20', isHoliday: true, category: '補假', name: '春節補假' },
  { date: '2026-02-27', isHoliday: true, category: '補假', name: '和平紀念日補假' },
  { date: '2026-02-28', isHoliday: true, category: '放假之紀念日及節日', name: '和平紀念日' },
  { date: '2026-04-03', isHoliday: true, category: '補假', name: '兒童節補假' },
  { date: '2026-04-04', isHoliday: true, category: '放假之紀念日及節日', name: '兒童節' },
  { date: '2026-04-05', isHoliday: true, category: '放假之紀念日及節日', name: '民族掃墓節（清明節）' },
  { date: '2026-04-06', isHoliday: true, category: '補假', name: '民族掃墓節補假' },
  { date: '2026-05-01', isHoliday: true, category: '放假之紀念日及節日', name: '勞動節' },
  { date: '2026-06-19', isHoliday: true, category: '放假之紀念日及節日', name: '端午節' },
  { date: '2026-09-25', isHoliday: true, category: '放假之紀念日及節日', name: '中秋節' },
  { date: '2026-09-28', isHoliday: true, category: '放假之紀念日及節日', name: '孔子誕辰紀念日（教師節）' },
  { date: '2026-10-09', isHoliday: true, category: '調整放假日', name: '國慶日調整放假' },
  { date: '2026-10-10', isHoliday: true, category: '放假之紀念日及節日', name: '國慶日' },
  { date: '2026-10-25', isHoliday: true, category: '放假之紀念日及節日', name: '臺灣光復暨金門古寧頭大捷紀念日' },
  { date: '2026-10-26', isHoliday: true, category: '補假', name: '臺灣光復暨金門古寧頭大捷紀念日補假' },
  { date: '2026-12-25', isHoliday: true, category: '放假之紀念日及節日', name: '行憲紀念日' },
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function buildDefaultCalendarDataset(years: number[] = [2026, 2025]): CalendarDataset {
  const specialMap = new Map<string, HolidayDef>();
  for (const item of TAIWAN_SPECIAL_DAYS_2025_2026) {
    specialMap.set(item.date, item);
  }

  const entries: Record<string, CalendarEntry> = {};
  let totalRecords = 0;

  for (const year of years) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
      const special = specialMap.get(dateStr);

      if (special) {
        entries[dateStr] = {
          date: dateStr,
          isHoliday: special.isHoliday,
          category: special.category,
          name: special.name,
        };
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        entries[dateStr] = {
          date: dateStr,
          isHoliday: true,
          category: '星期六、星期日',
          name: dayOfWeek === 6 ? '例假日（星期六）' : '例假日（星期日）',
        };
      } else {
        entries[dateStr] = {
          date: dateStr,
          isHoliday: false,
          category: '正常工作日',
          name: `${year} 正常工作日`,
        };
      }
      totalRecords++;
    }
  }

  const sortedYears = [...years].sort((a, b) => b - a);
  return {
    sourceName: `內建 ${sortedYears.join(' / ')} 行政院辦公日曆表`,
    years: sortedYears,
    totalRecords,
    entries,
    importedAt: new Date().toISOString(),
  };
}

export function lookupCalendarDay(
  dateStr: string,
  dataset: CalendarDataset
): {
  isHoliday: boolean;
  label: string;
  category: string;
  yearMatched: boolean;
} {
  const [yStr, mStr, dStr] = dateStr.split('-');
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  const dateObj = new Date(year, month - 1, day);
  const dow = dateObj.getDay();
  const isWeekend = dow === 0 || dow === 6;

  const exact = dataset.entries[dateStr];
  const yearMatched = dataset.years.includes(year);

  if (exact) {
    return {
      isHoliday: exact.isHoliday,
      label: exact.name || (exact.isHoliday ? exact.category || '放假日' : `${year} 正常工作日`),
      category: exact.category,
      yearMatched: true,
    };
  }

  // V121 Year Smart-Locking: If year is covered in dataset, unlisted weekday = normal working day
  if (yearMatched) {
    if (isWeekend) {
      return {
        isHoliday: true,
        label: dow === 6 ? '例假日（星期六）' : '例假日（星期日）',
        category: '星期六、星期日',
        yearMatched: true,
      };
    }
    return {
      isHoliday: false,
      label: `${year} 正常工作日`,
      category: '正常工作日',
      yearMatched: true,
    };
  }

  // Fallback for years outside loaded CSV
  if (isWeekend) {
    return {
      isHoliday: true,
      label: dow === 6 ? '例假日（週六推估）' : '例假日（週日推估）',
      category: '週末推估',
      yearMatched: false,
    };
  }
  return {
    isHoliday: false,
    label: `${year} 一般工作日（未載入該年日曆）`,
    category: '未載入年度推估',
    yearMatched: false,
  };
}

export const SAMPLE_2026_CSV = `date,isholiday,holidaycategory,name
20260101,是,放假之紀念日及節日,中華民國開國紀念日
20260215,是,放假之紀念日及節日,小年夜
20260216,是,放假之紀念日及節日,農曆除夕
20260217,是,放假之紀念日及節日,春節初一
20260218,是,放假之紀念日及節日,春節初二
20260219,是,放假之紀念日及節日,春節初三
20260220,是,補假,春節補假
20260227,是,補假,和平紀念日補假
20260228,是,放假之紀念日及節日,和平紀念日
20260403,是,補假,兒童節補假
20260404,是,放假之紀念日及節日,兒童節
20260405,是,放假之紀念日及節日,民族掃墓節
20260406,是,補假,民族掃墓節補假
20260501,是,放假之紀念日及節日,勞動節
20260619,是,放假之紀念日及節日,端午節
20260925,是,放假之紀念日及節日,中秋節
20260928,是,放假之紀念日及節日,孔子誕辰紀念日（教師節）
20261009,是,調整放假日,國慶日調整放假
20261010,是,放假之紀念日及節日,國慶日
20261025,是,放假之紀念日及節日,臺灣光復暨金門古寧頭大捷紀念日
20261026,是,補假,臺灣光復暨金門古寧頭大捷紀念日補假
20261225,是,放假之紀念日及節日,行憲紀念日`;
