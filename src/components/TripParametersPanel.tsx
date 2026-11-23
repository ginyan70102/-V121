import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Minus,
  Plus,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  DESTINATIONS,
  getDefaultTravelHours,
  getDestinationById,
  getTravelHoursKey,
  TRANSPORT_LABELS,
} from '../data/destinations';
import {
  getTodayDateString,
  roundEndTimeCeil30,
  roundStartTimeFloor30,
  TIME_STEP_OPTIONS,
} from '../engine/travelEngine';
import { DestinationGroup, TransportMode, TripInput } from '../types/travel';

interface TripParametersPanelProps {
  input: TripInput;
  customTravelHours: Record<string, number>;
  onChange: (next: TripInput) => void;
  onSaveCustomHours: (destinationId: string, transport: TransportMode, hours: number) => void;
  onResetCustomHours: (destinationId: string, transport: TransportMode) => void;
}

const GROUP_ORDER: { group: DestinationGroup; title: string }[] = [
  { group: 'in_county', title: '臺東縣內' },
  { group: 'islands', title: '離島與外島（覈實申報）' },
  { group: 'east_south', title: '花宜高屏（半日 1.0 ／ 全日 1.5 天）' },
  { group: 'north_tainan', title: '北桃竹苗基南（半日 1.5 ／ 全日 2.0 天）' },
  { group: 'central', title: '中彰投雲嘉（汽火車 2.0/3.0 天；高鐵 1.5/2.0 天）' },
];

interface ScenarioPreset {
  label: string;
  caption: string;
  apply: () => Partial<TripInput>;
}

const V121_PRESETS: ScenarioPreset[] = [
  {
    label: '台中 3 日逢國慶補假',
    caption: '10/6–10/8 火車 · 10/9 全日路程 8h',
    apply: () => ({
      destinationId: 'taichung',
      transport: 'train',
      oneWayHours: 6.0,
      startDate: '2026-10-06',
      startTime: '09:00',
      endDate: '2026-10-08',
      endTime: '16:00',
    }),
  },
  {
    label: '台北 1 日逢週六回程',
    caption: '10/2 整天火車 · 10/3 半日覈實 5h',
    apply: () => ({
      destinationId: 'taipei',
      transport: 'train',
      oneWayHours: 5.0,
      startDate: '2026-10-02',
      startTime: '09:30',
      endDate: '2026-10-02',
      endTime: '16:30',
    }),
  },
  {
    label: '屏東整天逢週日去程',
    caption: '10/19 整天 · 10/18 半日 3.5h➔4h',
    apply: () => ({
      destinationId: 'pingtung',
      transport: 'train',
      oneWayHours: 3.5,
      startDate: '2026-10-19',
      startTime: '09:00',
      endDate: '2026-10-19',
      endTime: '16:00',
    }),
  },
  {
    label: '今日當日往返',
    caption: '重設為系統今日日期',
    apply: () => {
      const today = getTodayDateString();
      return {
        startDate: today,
        endDate: today,
        startTime: '09:00',
        endTime: '16:00',
      };
    },
  },
];

export const TripParametersPanel: React.FC<TripParametersPanelProps> = ({
  input,
  customTravelHours,
  onChange,
  onSaveCustomHours,
  onResetCustomHours,
}) => {
  const [showRoundingHelper, setShowRoundingHelper] = useState(false);
  const [rawStartInput, setRawStartInput] = useState('08:40');
  const [rawEndInput, setRawEndInput] = useState('16:40');

  const destination = getDestinationById(input.destinationId);
  const hoursKey = getTravelHoursKey(destination.id, input.transport);
  const defaultHours = getDefaultTravelHours(destination, input.transport);
  const isCustomHours =
    customTravelHours[hoursKey] !== undefined &&
    customTravelHours[hoursKey] !== defaultHours;

  const handleDestinationChange = (nextDestId: string) => {
    const nextDest = getDestinationById(nextDestId);
    const nextTransport = nextDest.supportedTransports.includes(input.transport)
      ? input.transport
      : nextDest.defaultTransport;
    const key = getTravelHoursKey(nextDest.id, nextTransport);
    const nextHours =
      customTravelHours[key] ?? getDefaultTravelHours(nextDest, nextTransport);
    onChange({
      ...input,
      destinationId: nextDest.id,
      transport: nextTransport,
      oneWayHours: nextHours,
    });
  };

  const handleTransportChange = (nextTransport: TransportMode) => {
    const key = getTravelHoursKey(destination.id, nextTransport);
    const nextHours =
      customTravelHours[key] ?? getDefaultTravelHours(destination, nextTransport);
    onChange({
      ...input,
      transport: nextTransport,
      oneWayHours: nextHours,
    });
  };

  const handleHoursAdjust = (nextHours: number) => {
    const clamped = Math.max(0.5, Math.min(16, Math.round(nextHours * 2) / 2));
    onSaveCustomHours(destination.id, input.transport, clamped);
    onChange({ ...input, oneWayHours: clamped });
  };

  const handleStartDateChange = (val: string) => {
    const nextEnd = val > input.endDate ? val : input.endDate;
    onChange({ ...input, startDate: val, endDate: nextEnd });
  };

  const handleEndDateChange = (val: string) => {
    const nextStart = val < input.startDate ? val : input.startDate;
    onChange({ ...input, startDate: nextStart, endDate: val });
  };

  const applyRoundingHelper = () => {
    const roundedStart = roundStartTimeFloor30(rawStartInput);
    const roundedEnd = roundEndTimeCeil30(rawEndInput);
    onChange({
      ...input,
      startTime: roundedStart,
      endTime: roundedEnd,
    });
    setShowRoundingHelper(false);
  };

  return (
    <section
      aria-label="差勤參數設定"
      className="executive-card rounded-2xl p-6"
    >
      <div className="flex items-baseline justify-between gap-4 pb-5 border-b border-blue-100 dark:border-blue-900/60">
        <div>
          <h2 className="text-base font-semibold text-[#0C254B] dark:text-white">
            差勤參數設定
          </h2>
          <p className="text-xs text-slate-500 dark:text-blue-200/70 mt-1">
            依臺東縣政府出差天數核給標準表與 V121 規範自動連動計算
          </p>
        </div>
        <span className="text-xs text-blue-700/80 dark:text-sky-300/80 font-mono-num shrink-0">
          30 分鐘級距
        </span>
      </div>

      <div className="space-y-5 pt-5">
        {/* 1. 出差目的地 */}
        <div>
          <label
            htmlFor="destination-select"
            className="block text-sm font-medium text-slate-800 dark:text-blue-100 mb-1.5"
          >
            出差目的地（縣市／離島）
          </label>
          <select
            id="destination-select"
            value={input.destinationId}
            onChange={(e) => handleDestinationChange(e.target.value)}
            className="w-full h-11 px-3.5 text-sm bg-blue-50/55 dark:bg-[#081529] border border-blue-200 dark:border-blue-800/80 rounded-lg text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-sky-400 transition-colors"
          >
            {GROUP_ORDER.map((g) => (
              <optgroup key={g.group} label={g.title}>
                {DESTINATIONS.filter((d) => d.group === g.group).map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {destination.note && (
            <p className="text-xs text-slate-500 dark:text-blue-200/70 mt-1.5">
              {destination.note}
            </p>
          )}
        </div>

        {/* 2. 交通工具（金屬觸感分段控制） */}
        <div>
          <span className="block text-sm font-medium text-slate-800 dark:text-blue-100 mb-1.5">
            主要交通工具
          </span>
          <div className="flex flex-wrap gap-1.5 p-1 bg-blue-100/75 dark:bg-[#07152A] border border-blue-200/80 dark:border-blue-900/70 rounded-xl">
            {destination.supportedTransports.map((mode) => {
              const active = input.transport === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleTransportChange(mode)}
                  className={`flex-1 min-w-[68px] h-9 px-3 text-sm font-medium rounded-lg whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    active
                      ? 'btn-metal-segment-active'
                      : 'text-slate-700 dark:text-blue-200/80 hover:text-[#0C2C5E] dark:hover:text-white'
                  }`}
                >
                  {TRANSPORT_LABELS[mode]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 單趟車程小時（拉絲金屬加減鍵） */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="travel-hours-input"
              className="text-sm font-medium text-slate-800 dark:text-blue-100"
            >
              單趟預估車程（小時）
            </label>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-blue-200/75">
              <span className="font-mono-num">預設 {defaultHours.toFixed(1)}h</span>
              {isCustomHours && (
                <>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetCustomHours(destination.id, input.transport);
                      onChange({ ...input, oneWayHours: defaultHours });
                    }}
                    className="inline-flex items-center gap-1 text-blue-700 dark:text-sky-400 hover:underline whitespace-nowrap"
                  >
                    <RotateCcw className="w-3 h-3" />
                    還原預設
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="減少 0.5 小時"
              onClick={() => handleHoursAdjust(input.oneWayHours - 0.5)}
              className="btn-metal-silver w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <input
                id="travel-hours-input"
                type="number"
                step={0.5}
                min={0.5}
                max={16}
                value={input.oneWayHours}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!Number.isNaN(v)) handleHoursAdjust(v);
                }}
                className="w-full h-11 px-3.5 pr-12 text-center font-mono-num text-base font-semibold bg-blue-50/55 dark:bg-[#081529] border border-blue-200 dark:border-blue-800/80 rounded-lg text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-blue-200/70 pointer-events-none">
                小時
              </span>
            </div>
            <button
              type="button"
              aria-label="增加 0.5 小時"
              onClick={() => handleHoursAdjust(input.oneWayHours + 0.5)}
              className="btn-metal-silver w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-blue-200/70 mt-1.5">
            修改後自動記憶於本機；假日半日路程補休依此車程無條件進位覈實計算。
          </p>
        </div>

        {/* 4. 公務起訖日期 */}
        <div className="pt-4 border-t border-blue-100 dark:border-blue-900/60">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-blue-100">
              <CalendarDays className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              實際公務起訖日期
            </span>
            <button
              type="button"
              onClick={() => {
                const today = getTodayDateString();
                onChange({ ...input, startDate: today, endDate: today });
              }}
              className="text-xs font-medium text-blue-700 dark:text-sky-400 hover:underline whitespace-nowrap"
            >
              設為今日
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="start-date"
                className="block text-xs text-slate-500 dark:text-blue-200/70 mb-1"
              >
                公務開始日期
              </label>
              <input
                id="start-date"
                type="date"
                value={input.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full h-11 px-3 font-mono-num text-sm bg-blue-50/55 dark:bg-[#081529] border border-blue-200 dark:border-blue-800/80 rounded-lg text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="block text-xs text-slate-500 dark:text-blue-200/70 mb-1"
              >
                公務結束日期
              </label>
              <input
                id="end-date"
                type="date"
                min={input.startDate}
                value={input.endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full h-11 px-3 font-mono-num text-sm bg-blue-50/55 dark:bg-[#081529] border border-blue-200 dark:border-blue-800/80 rounded-lg text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* 5. 公務起訖時間 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-blue-100">
              <Clock className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              實際公務起訖時間
            </span>
            <button
              type="button"
              onClick={() => setShowRoundingHelper((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-sky-400 hover:underline whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showRoundingHelper ? '收合取整輔助' : '非整點時間自動取整'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="start-time"
                className="block text-xs text-slate-500 dark:text-blue-200/70 mb-1"
              >
                開始時間（無條件捨去）
              </label>
              <select
                id="start-time"
                value={input.startTime}
                onChange={(e) => onChange({ ...input, startTime: e.target.value })}
                className="w-full h-11 px-3 font-mono-num text-sm bg-blue-50/55 dark:bg-[#081529] border border-blue-200 dark:border-blue-800/80 rounded-lg text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {TIME_STEP_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="end-time"
                className="block text-xs text-slate-500 dark:text-blue-200/70 mb-1"
              >
                結束時間（無條件進位）
              </label>
              <select
                id="end-time"
                value={input.endTime}
                onChange={(e) => onChange({ ...input, endTime: e.target.value })}
                className="w-full h-11 px-3 font-mono-num text-sm bg-blue-50/55 dark:bg-[#081529] border border-blue-200 dark:border-blue-800/80 rounded-lg text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {TIME_STEP_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showRoundingHelper && (
            <div className="mt-3 p-3.5 rounded-xl bg-blue-50/75 dark:bg-[#08162C] border border-blue-200 dark:border-blue-800/80 space-y-2.5">
              <p className="text-xs text-slate-700 dark:text-blue-100/90">
                輸入開會通知單原始時間，系統自動依 V121 規範修正（開始捨去至半點、結束進位至半點）：
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-blue-200/70 mb-1">
                    原始開始
                  </label>
                  <input
                    type="time"
                    value={rawStartInput}
                    onChange={(e) => setRawStartInput(e.target.value)}
                    className="w-full h-9 px-2.5 font-mono-num text-xs bg-white dark:bg-[#0D1E38] border border-blue-200 dark:border-blue-800 rounded-md text-slate-900 dark:text-slate-100"
                  />
                  <span className="block text-xs font-mono-num font-semibold text-blue-700 dark:text-sky-400 mt-1">
                    ➔ {roundStartTimeFloor30(rawStartInput)}
                  </span>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-blue-200/70 mb-1">
                    原始結束
                  </label>
                  <input
                    type="time"
                    value={rawEndInput}
                    onChange={(e) => setRawEndInput(e.target.value)}
                    className="w-full h-9 px-2.5 font-mono-num text-xs bg-white dark:bg-[#0D1E38] border border-blue-200 dark:border-blue-800 rounded-md text-slate-900 dark:text-slate-100"
                  />
                  <span className="block text-xs font-mono-num font-semibold text-blue-700 dark:text-sky-400 mt-1">
                    ➔ {roundEndTimeCeil30(rawEndInput)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={applyRoundingHelper}
                className="btn-metal-primary w-full h-9 text-xs font-medium rounded-lg"
              >
                套用修正後起訖時間
              </button>
            </div>
          )}

          {/* 快速半天 / 全天金屬銀鍵 */}
          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => onChange({ ...input, startTime: '09:00', endTime: '12:00' })}
              className="btn-metal-silver flex-1 h-8 px-2 text-xs font-medium rounded-lg whitespace-nowrap"
            >
              上午 09:00–12:00
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...input, startTime: '13:30', endTime: '16:30' })}
              className="btn-metal-silver flex-1 h-8 px-2 text-xs font-medium rounded-lg whitespace-nowrap"
            >
              下午 13:30–16:30
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...input, startTime: '09:00', endTime: '16:00' })}
              className="btn-metal-silver flex-1 h-8 px-2 text-xs font-medium rounded-lg whitespace-nowrap"
            >
              整天 09:00–16:00
            </button>
          </div>
        </div>

        {/* 6. V121 規範快速情境驗證 */}
        <div className="pt-4 border-t border-blue-100 dark:border-blue-900/60">
          <span className="block text-xs font-medium text-slate-600 dark:text-blue-200/80 mb-2">
            V121 典型情境快速套用
          </span>
          <div className="grid grid-cols-2 gap-2">
            {V121_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange({ ...input, ...preset.apply() })}
                className="btn-metal-silver text-left p-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="text-xs font-semibold truncate">
                  {preset.label}
                </div>
                <div className="text-[11px] opacity-75 mt-0.5 truncate">
                  {preset.caption}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
