import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  FileText,
  TrainFront,
} from 'lucide-react';
import { TRANSPORT_LABELS } from '../data/destinations';
import { formatShortDate, formatSlashDate } from '../engine/travelEngine';
import { CalculationResult, FareSegment } from '../types/travel';

interface GuideResultPanelProps {
  result: CalculationResult;
  matchedFareSegments: FareSegment[];
  originLabel: string;
  fareDestLabel: string;
  onOpenReport: () => void;
  onGoToFareTab: () => void;
}

export const GuideResultPanel: React.FC<GuideResultPanelProps> = ({
  result,
  matchedFareSegments,
  originLabel,
  fareDestLabel,
  onOpenReport,
  onGoToFareTab,
}) => {
  const [copiedRange, setCopiedRange] = useState(false);

  const handleCopyRange = async () => {
    if (!result.valid) return;
    try {
      await navigator.clipboard.writeText(result.reportRangeFormatted);
      setCopiedRange(true);
      setTimeout(() => setCopiedRange(false), 1800);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = result.reportRangeFormatted;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedRange(true);
      setTimeout(() => setCopiedRange(false), 1800);
    }
  };

  if (!result.valid) {
    return (
      <section className="executive-card rounded-2xl p-6">
        <div className="flex items-start gap-3 text-amber-700 dark:text-amber-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-semibold">請修正公務起訖時間</h2>
            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
              {result.errorMessage}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const oneWayFare = matchedFareSegments.reduce((sum, s) => sum + s.price, 0);
  const roundTripFare = oneWayFare * 2;

  return (
    <div className="space-y-6">
      {/* 核心結果焦點區 */}
      <section
        aria-label="差勤填寫指南"
        className="executive-card rounded-2xl overflow-hidden"
      >
        {/* 主焦點：皇室鈷藍商務高對比申報時間區 */}
        <div className="p-6 pb-5 bg-gradient-to-br from-[#0B2D63] via-[#113D82] to-[#0A2552] text-white border-b border-blue-400/25">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-blue-100/85">
              <span className="font-semibold text-sky-200">
                線上差勤系統應申報起訖時間
              </span>
              <span aria-hidden="true">·</span>
              <span>{result.destination.shortName}</span>
              <span aria-hidden="true">·</span>
              <span>{TRANSPORT_LABELS[result.transport]}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">單趟 {result.oneWayHours}h</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyRange}
                className="btn-metal-silver inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                {copiedRange ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    已複製起訖
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    一鍵複製
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onOpenReport}
                className="btn-metal-primary inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                <FileText className="w-3.5 h-3.5" />
                核銷報表
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-mono-num text-2xl sm:text-[30px] font-semibold tracking-tight text-white">
              {formatShortDate(result.reportStartDate)} {result.reportStartTime}
            </p>
            <span className="text-sm text-sky-200/80">至</span>
            <p className="font-mono-num text-2xl sm:text-[30px] font-semibold tracking-tight text-white">
              {formatShortDate(result.reportEndDate)} {result.reportEndTime}
            </p>
          </div>
          <p className="mt-1.5 text-xs text-blue-100/80 font-mono-num">
            完整起訖：{result.reportRangeFormatted}（完整涵蓋去回程日期，確保公差平安保險效力）
          </p>
        </div>

        {/* 次焦點雙指標：核給公差天數 & 可申報路程補休時數 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-blue-100 dark:divide-blue-900/60">
          <div className="p-6">
            <div className="text-xs text-slate-500 dark:text-blue-200/75">
              系統核給公差天數上限
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono-num text-3xl font-semibold text-[#0C254B] dark:text-white">
                {result.allowedDays.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-slate-600 dark:text-blue-200">
                天
              </span>
              {result.extraBudgetDays > 0 && (
                <span className="text-xs text-blue-700/80 dark:text-sky-300/90 ml-1">
                  · 含路程假 {result.extraBudgetDays.toFixed(1)} 天
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-blue-200/70">
              {result.modeDescription}
            </p>
          </div>

          <div
            className={`p-6 ${
              result.totalCompLeaveHours > 0
                ? 'bg-emerald-50/75 dark:bg-emerald-950/25'
                : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-blue-200/75">
                可手動申報「路程補休時數」
              </span>
              {result.totalCompLeaveHours > 0 && (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  符合補休資格
                </span>
              )}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span
                className={`font-mono-num text-3xl font-semibold ${
                  result.totalCompLeaveHours > 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-[#0C254B] dark:text-white'
                }`}
              >
                {result.totalCompLeaveHours}
              </span>
              <span
                className={`text-sm font-medium ${
                  result.totalCompLeaveHours > 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-blue-200'
                }`}
              >
                小時
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-blue-200/75">
              {result.totalCompLeaveHours > 0 ? (
                <>
                  假日路程／公務{' '}
                  <span className="font-mono-num font-semibold">
                    {result.holidayCompLeaveHours}h
                  </span>
                  {' · '}
                  平日非辦公時間{' '}
                  <span className="font-mono-num font-semibold">
                    {result.weekdayAfterHoursCompHours}h
                  </span>
                </>
              ) : (
                '全段路程皆落於平日正常辦公時間內（給薪路程公假，免另報補休）'
              )}
            </p>
          </div>
        </div>

        {/* V121 法規採計摘要 */}
        {result.v121AppliedRules.length > 0 && (
          <div className="px-6 py-4 bg-blue-50/70 dark:bg-[#08172E]/80 border-t border-blue-100 dark:border-blue-900/60">
            <div className="text-xs font-semibold text-[#0F356E] dark:text-sky-300 mb-1.5">
              V121 補休核算依據（注意事項六、八）
            </div>
            <ul className="space-y-1">
              {result.v121AppliedRules.map((ruleText, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-700 dark:text-blue-100/80 leading-relaxed"
                >
                  {idx + 1}. {ruleText}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 逐日行程與行政院辦公日曆對照表 */}
      <section
        aria-label="逐日行程與日曆對照解析"
        className="executive-card rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-blue-100 dark:border-blue-900/60 flex items-baseline justify-between gap-4">
          <h3 className="text-sm font-semibold text-[#0C254B] dark:text-white">
            逐日行程與辦公日曆對照解析
          </h3>
          <span className="text-xs text-blue-700/80 dark:text-sky-300/80 font-mono-num">
            共 {result.dailySchedule.length} 日
          </span>
        </div>

        <div className="divide-y divide-blue-100/80 dark:divide-blue-900/50">
          {result.dailySchedule.map((day) => (
            <div
              key={`${day.date}-${day.role}`}
              className={`px-6 py-4 transition-colors ${
                day.isHoliday
                  ? 'bg-amber-50/60 dark:bg-amber-950/20'
                  : 'hover:bg-blue-50/45 dark:hover:bg-blue-950/25'
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <span className="font-mono-num text-sm font-semibold text-[#0C254B] dark:text-white">
                    {formatSlashDate(day.date)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-blue-200/70">
                    {day.weekdayLabel}
                  </span>
                  <span aria-hidden="true" className="text-blue-200 dark:text-blue-800">
                    ·
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      day.isHoliday
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-slate-500 dark:text-blue-200/70'
                    }`}
                  >
                    {day.isHoliday ? `放假日：${day.calendarLabel}` : day.calendarLabel}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0">
                  <span className="font-medium text-slate-700 dark:text-blue-100">
                    {day.roleLabel}
                  </span>
                  <span className="font-mono-num text-slate-500 dark:text-blue-200/70">
                    {day.leaveWindow}
                  </span>
                  {day.compLeaveHours > 0 ? (
                    <span className="font-mono-num font-semibold text-emerald-700 dark:text-emerald-400">
                      +{day.compLeaveHours} 小時補休
                    </span>
                  ) : (
                    <span className="font-mono-num text-slate-400 dark:text-blue-300/45">
                      0h 補休
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-600 dark:text-blue-100/80 leading-relaxed">
                {day.guidanceText}
              </p>
              {day.compLeaveHours > 0 && (
                <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  計算依據：{day.compLeaveReason}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 連動車資快速預覽條 */}
      <section className="executive-card rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <TrainFront className="w-5 h-5 text-blue-700 dark:text-sky-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#0C254B] dark:text-white truncate">
              參考車資試算：{originLabel} ➔ {fareDestLabel}
            </div>
            <div className="text-xs text-slate-600 dark:text-blue-200/75 mt-0.5 font-mono-num">
              {matchedFareSegments.length > 0 ? (
                <>
                  單趟 NT$ {oneWayFare.toLocaleString()} · 來回 NT${' '}
                  {roundTripFare.toLocaleString()}（共 {matchedFareSegments.length} 段）
                </>
              ) : (
                '可前往車資分段頁面自訂起訖站與轉乘票價'
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToFareTab}
          className="btn-metal-silver inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0"
        >
          編輯分段車資
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>
    </div>
  );
};
