import React, { useMemo, useRef, useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  RotateCcw,
  Search,
  Upload,
} from 'lucide-react';
import { SAMPLE_2026_CSV } from '../data/taiwanCalendar';
import {
  parseGovernmentCalendarText,
  readCalendarFileWithEncodingFallback,
} from '../engine/calendarParser';
import { formatSlashDate, getWeekdayLabel } from '../engine/travelEngine';
import { CalendarDataset } from '../types/travel';

interface CalendarDataPanelProps {
  calendar: CalendarDataset;
  onImportCalendar: (dataset: CalendarDataset) => void;
  onResetDefaultCalendar: () => void;
  onExportSettingsJson: () => void;
  onImportSettingsJson: (file: File) => Promise<void>;
}

export const CalendarDataPanel: React.FC<CalendarDataPanelProps> = ({
  calendar,
  onImportCalendar,
  onResetDefaultCalendar,
  onExportSettingsJson,
  onImportSettingsJson,
}) => {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const [selectedYear, setSelectedYear] = useState<number | 'all'>(calendar.years[0] ?? 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyNamedHolidays, setOnlyNamedHolidays] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return Object.values(calendar.entries)
      .filter((entry) => {
        if (selectedYear !== 'all' && !entry.date.startsWith(String(selectedYear))) {
          return false;
        }
        if (onlyNamedHolidays) {
          const isSpecial =
            (entry.isHoliday && !entry.category.includes('星期六、星期日')) ||
            entry.category.includes('補行上班');
          if (!isSpecial) return false;
        }
        if (q) {
          return (
            entry.date.includes(q) ||
            entry.name.toLowerCase().includes(q) ||
            entry.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [calendar.entries, selectedYear, onlyNamedHolidays, searchQuery]);

  const handleCsvSelect = async (file?: File) => {
    if (!file) return;
    try {
      const text = await readCalendarFileWithEncodingFallback(file);
      const parsed = parseGovernmentCalendarText(text, file.name);
      onImportCalendar(parsed);
      setSelectedYear(parsed.years[0] ?? 'all');
      setStatusMsg({
        type: 'ok',
        text: `已成功匯入「${file.name}」，鎖定年份 ${parsed.years.join(' / ')}（共 ${parsed.totalRecords} 筆基準日曆）。`,
      });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : '無法解析日曆檔案，請確認格式為 CSV 或 TSV。',
      });
    }
  };

  const handleJsonSelect = async (file?: File) => {
    if (!file) return;
    try {
      await onImportSettingsJson(file);
      setStatusMsg({
        type: 'ok',
        text: `已成功還原設定檔「${file.name}」（含自訂車資、核對狀態與車程記憶）。`,
      });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : '設定檔 JSON 格式不正確。',
      });
    }
  };

  const handleDownloadSampleCsv = () => {
    const blob = new Blob(['\uFEFF' + SAMPLE_2026_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2026_taiwan_calendar_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div
          className={`px-4 py-3 rounded-lg border text-xs font-medium ${
            statusMsg.type === 'ok'
              ? 'bg-emerald-50/95 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50/95 dark:bg-red-950/70 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 辦公日曆匯入區 */}
        <section className="executive-card rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#0C254B] dark:text-white">
                行政院辦公日曆表（CSV / TSV）
              </h2>
              <p className="text-xs text-slate-500 dark:text-blue-200/70 mt-1">
                100% 本機離線解析，自動辨識逗號／Tab／分號並支援 V121 年份智慧鎖定
              </p>
            </div>
            <FileSpreadsheet className="w-5 h-5 text-blue-700 dark:text-sky-400 shrink-0" />
          </div>

          <div className="pt-2 space-y-1 text-xs text-slate-600 dark:text-blue-200/80">
            <div>
              目前來源：
              <span className="font-semibold text-[#0C254B] dark:text-white">
                {calendar.sourceName}
              </span>
            </div>
            <div className="font-mono-num">
              涵蓋年份：{calendar.years.join('、')} 年 · 完整基準共 {calendar.totalRecords} 筆
            </div>
          </div>

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            className="hidden"
            onChange={(e) => {
              handleCsvSelect(e.target.files?.[0]);
              e.target.value = '';
            }}
          />

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => csvInputRef.current?.click()}
              className="btn-metal-primary inline-flex items-center gap-1.5 h-10 px-4 text-xs font-medium rounded-lg whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              匯入日曆 CSV / TSV
            </button>
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="btn-metal-silver inline-flex items-center gap-1.5 h-10 px-3.5 text-xs font-medium rounded-lg whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              下載 2026 範例 CSV
            </button>
            <button
              type="button"
              onClick={() => {
                onResetDefaultCalendar();
                setStatusMsg({ type: 'ok', text: '已還原內建 2026 / 2025 行政院辦公日曆表。' });
              }}
              className="btn-metal-silver inline-flex items-center gap-1.5 h-10 px-3 text-xs font-medium rounded-lg whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              還原內建日曆
            </button>
          </div>
        </section>

        {/* 同仁設定檔備份與分享（JSON） */}
        <section className="executive-card rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[#0C254B] dark:text-white">
              設定檔備份與同仁共享（JSON）
            </h2>
            <p className="text-xs text-slate-500 dark:text-blue-200/70 mt-1">
              匯出您已核對確認之車資票價、自訂接駁區段與各縣市車程時數記憶，分享給科室同仁一鍵匯入使用。
            </p>
          </div>

          <ul className="text-xs text-slate-600 dark:text-blue-200/80 space-y-1 pt-1">
            <li>・包含所有已修改之票價金額與「已確認」狀態標記</li>
            <li>・包含各路線新增之捷運／公車／接駁自訂區段</li>
            <li>・包含個人化各目的地單趟預估車程時數</li>
          </ul>

          <input
            ref={jsonInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              handleJsonSelect(e.target.files?.[0]);
              e.target.value = '';
            }}
          />

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onExportSettingsJson}
              className="btn-metal-primary inline-flex items-center gap-1.5 h-10 px-4 text-xs font-medium rounded-lg whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              匯出設定檔 (.json)
            </button>
            <button
              type="button"
              onClick={() => jsonInputRef.current?.click()}
              className="btn-metal-silver inline-flex items-center gap-1.5 h-10 px-4 text-xs font-medium rounded-lg whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              匯入設定檔 (.json)
            </button>
          </div>
        </section>
      </div>

      {/* 日曆明細查詢表 */}
      <section className="executive-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-100 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-sm font-semibold text-[#0C254B] dark:text-white">
              已載入國定假日與補班明細
            </h3>
            <div className="flex items-center gap-1 p-1 bg-blue-100/75 dark:bg-[#07152A] border border-blue-200/80 dark:border-blue-900/70 rounded-lg">
              {calendar.years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setSelectedYear(y)}
                  className={`px-2.5 py-1 text-xs font-mono-num rounded-md transition-colors ${
                    selectedYear === y
                      ? 'btn-metal-segment-active font-medium'
                      : 'text-slate-700 dark:text-blue-200/80 hover:text-[#0C254B] dark:hover:text-white'
                  }`}
                >
                  {y}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedYear('all')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  selectedYear === 'all'
                    ? 'btn-metal-segment-active font-medium'
                    : 'text-slate-700 dark:text-blue-200/80 hover:text-[#0C254B] dark:hover:text-white'
                }`}
              >
                全部
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-blue-200 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={onlyNamedHolidays}
                onChange={(e) => setOnlyNamedHolidays(e.target.checked)}
                className="accent-blue-700"
              />
              僅顯示國定節日／補假／補班
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-blue-500/70 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋日期或節日..."
                className="h-9 pl-8 pr-3 text-xs bg-blue-50/55 dark:bg-[#081529] border border-blue-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white/95 dark:bg-[#0B182E]/95 border-b border-blue-100 dark:border-blue-900/60">
              <tr className="text-xs text-slate-500 dark:text-blue-200/70">
                <th className="text-left font-medium px-6 py-2.5">日期</th>
                <th className="text-left font-medium px-6 py-2.5">星期</th>
                <th className="text-left font-medium px-6 py-2.5">假別分類</th>
                <th className="text-left font-medium px-6 py-2.5">名稱／說明</th>
                <th className="text-right font-medium px-6 py-2.5">判定結果</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100/70 dark:divide-blue-900/50">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-slate-500">
                    找不到符合篩選條件的日期紀錄。
                  </td>
                </tr>
              ) : (
                filteredEntries.slice(0, 150).map((item) => (
                  <tr
                    key={item.date}
                    className="hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors"
                  >
                    <td className="px-6 py-2.5 font-mono-num text-[#0C254B] dark:text-white">
                      {formatSlashDate(item.date)}
                    </td>
                    <td className="px-6 py-2.5 text-xs text-slate-500 dark:text-blue-200/70">
                      {getWeekdayLabel(item.date)}
                    </td>
                    <td className="px-6 py-2.5 text-xs text-slate-600 dark:text-blue-200/80">
                      {item.category}
                    </td>
                    <td className="px-6 py-2.5 font-medium text-[#0C254B] dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-2.5 text-right text-xs font-medium">
                      {item.isHoliday ? (
                        <span className="text-amber-700 dark:text-amber-400">
                          放假日（計補休）
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-blue-200/70">正常上班日</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
