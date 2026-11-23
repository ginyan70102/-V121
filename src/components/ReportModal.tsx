import React, { useState } from 'react';
import { Check, Copy, Printer, X } from 'lucide-react';
import { TRANSPORT_LABELS } from '../data/destinations';
import {
  formatSlashDate,
  generateReimbursementTextReport,
} from '../engine/travelEngine';
import { CalculationResult, FareSegment, TripInput } from '../types/travel';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  result: CalculationResult;
  input: TripInput;
  fareSegments: FareSegment[];
  originLabel: string;
  destLabel: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  open,
  onClose,
  result,
  input,
  fareSegments,
  originLabel,
  destLabel,
}) => {
  const [copied, setCopied] = useState(false);

  if (!open || !result.valid) return null;

  const textReport = generateReimbursementTextReport(
    result,
    input,
    fareSegments,
    originLabel,
    destLabel
  );
  const oneWayFare = fareSegments.reduce((s, seg) => s + seg.price, 0);
  const roundTripFare = oneWayFare * 2;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(textReport);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = textReport;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="差勤核銷報表預覽"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041024]/70 backdrop-blur-xs"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0D1E38] border border-blue-200 dark:border-blue-800/80 rounded-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0C2F66] to-[#174A9C] text-white flex items-center justify-between gap-4 no-print">
          <div>
            <h2 className="text-base font-semibold">
              臺東縣政府出差差勤與核銷明細報表
            </h2>
            <p className="text-xs text-blue-100/85 mt-0.5">
              可一鍵複製純文字貼至 LINE／簽呈，或直接列印／另存 PDF 供核銷檢附
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉報表視窗"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-blue-100 hover:bg-white/15 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="border-b border-blue-100 dark:border-blue-900/60 pb-4">
            <h3 className="text-lg font-semibold text-[#0C254B] dark:text-white">
              臺東縣政府員工出差差勤與路程補休核銷明細（V121）
            </h3>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-blue-200/80">
              <div>出差地點：{result.destination.name}</div>
              <div>
                交通工具：{TRANSPORT_LABELS[result.transport]}（單趟 {result.oneWayHours} 小時）
              </div>
              <div className="font-mono-num">
                實際公務：{formatSlashDate(input.startDate)} {input.startTime} 至{' '}
                {formatSlashDate(input.endDate)} {input.endTime}
              </div>
              <div className="font-mono-num">
                差勤申報：{result.reportRangeFormatted}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-2 border-b border-blue-100 dark:border-blue-900/60">
            <div>
              <div className="text-xs text-slate-500 dark:text-blue-200/70">核給公差天數</div>
              <div className="font-mono-num text-xl font-semibold text-[#0C254B] dark:text-white mt-0.5">
                {result.allowedDays.toFixed(1)} 天
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-blue-200/70">可申報路程補休</div>
              <div className="font-mono-num text-xl font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {result.totalCompLeaveHours} 小時
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-blue-200/70">來回交通費合計</div>
              <div className="font-mono-num text-xl font-semibold text-blue-700 dark:text-sky-400 mt-0.5">
                NT$ {roundTripFare.toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-700 dark:text-blue-100 mb-2">
              純文字核銷明細（適合 LINE 傳送與差勤備註欄位貼上）
            </div>
            <pre className="p-4 rounded-xl bg-blue-50/70 dark:bg-[#071429] border border-blue-100 dark:border-blue-900/70 text-xs font-mono-num text-slate-800 dark:text-blue-100 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {textReport}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-blue-100 dark:border-blue-900/60 flex flex-wrap items-center justify-end gap-2.5 no-print">
          <button
            type="button"
            onClick={onClose}
            className="btn-metal-silver h-10 px-4 text-xs font-medium rounded-lg"
          >
            關閉
          </button>
          <button
            type="button"
            onClick={handleCopyText}
            className="btn-metal-silver inline-flex items-center gap-1.5 h-10 px-4 text-xs font-medium rounded-lg whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                已複製純文字報表
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                複製報表文字（LINE 適用）
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-metal-primary inline-flex items-center gap-1.5 h-10 px-4 text-xs font-medium rounded-lg whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            列印 ／ 另存 PDF
          </button>
        </div>
      </div>
    </div>
  );
};
