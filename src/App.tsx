import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  FileText,
  Moon,
  Sun,
  Upload,
  X,
} from 'lucide-react';
import { CalendarDataPanel } from './components/CalendarDataPanel';
import { FareCalculatorPanel } from './components/FareCalculatorPanel';
import { GuideResultPanel } from './components/GuideResultPanel';
import { KotlinSourcePanel } from './components/KotlinSourcePanel';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { ReportModal } from './components/ReportModal';
import { TripParametersPanel } from './components/TripParametersPanel';
import {
  getDefaultTravelHours,
  getDestinationById,
  getTravelHoursKey,
} from './data/destinations';
import {
  buildRouteSegments,
  DESTINATION_STATIONS,
  ORIGIN_STATIONS,
} from './data/fares';
import { buildDefaultCalendarDataset } from './data/taiwanCalendar';
import {
  parseGovernmentCalendarText,
  readCalendarFileWithEncodingFallback,
} from './engine/calendarParser';
import {
  calculateTaitungTravel,
  getTodayDateString,
} from './engine/travelEngine';
import {
  AppExportSettings,
  CalendarDataset,
  CustomFareLeg,
  StoredFareOverride,
  TransportMode,
  TripInput,
} from './types/travel';

type ActiveTab = 'calculator' | 'fares' | 'calendar' | 'kotlin';

const TAITUNG_BACKDROP_URL =
  '/src/assets/images/taitung_specialties_backdrop_1795424236894.jpg';

const STORAGE_KEYS = {
  theme: 'taitung_travel_theme',
  customHours: 'taitung_travel_custom_hours_v121',
  fareOverrides: 'taitung_travel_fare_overrides_v121',
  customFareLegs: 'taitung_travel_custom_fare_legs_v121',
  defaultOrigin: 'taitung_travel_default_origin_v121',
  calendar: 'taitung_travel_calendar_v121',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [backdropFailed, setBackdropFailed] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return false;
    } catch {
      return false;
    }
  });

  const [calendar, setCalendar] = useState<CalendarDataset>(() => {
    const saved = loadJson<CalendarDataset | null>(STORAGE_KEYS.calendar, null);
    if (saved && saved.entries && saved.years?.length > 0) {
      return saved;
    }
    return buildDefaultCalendarDataset([2026, 2025]);
  });

  const [customTravelHours, setCustomTravelHours] = useState<Record<string, number>>(() =>
    loadJson(STORAGE_KEYS.customHours, {})
  );

  const [fareOverrides, setFareOverrides] = useState<Record<string, StoredFareOverride>>(() =>
    loadJson(STORAGE_KEYS.fareOverrides, {})
  );

  const [customFareLegs, setCustomFareLegs] = useState<CustomFareLeg[]>(() =>
    loadJson(STORAGE_KEYS.customFareLegs, [])
  );

  // V121 規範：每次開啟自動抓取本機今日日期
  const [tripInput, setTripInput] = useState<TripInput>(() => {
    const today = getTodayDateString();
    const initialDest = getDestinationById('taichung');
    const key = getTravelHoursKey(initialDest.id, initialDest.defaultTransport);
    const savedHours = loadJson<Record<string, number>>(STORAGE_KEYS.customHours, {});
    return {
      destinationId: initialDest.id,
      transport: initialDest.defaultTransport,
      oneWayHours:
        savedHours[key] ?? getDefaultTravelHours(initialDest, initialDest.defaultTransport),
      startDate: today,
      startTime: '09:00',
      endDate: today,
      endTime: '16:00',
    };
  });

  const [fareOriginId, setFareOriginId] = useState<string>(() =>
    loadJson(STORAGE_KEYS.defaultOrigin, 'taitung')
  );
  const [fareDestId, setFareDestId] = useState<string>('taichung');
  const [useHsrTransfer, setUseHsrTransfer] = useState<boolean>(false);
  const [reportOpen, setReportOpen] = useState<boolean>(false);
  const [showReportPromptBar, setShowReportPromptBar] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const quickCsvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.customHours, JSON.stringify(customTravelHours));
    } catch {
      // ignore
    }
  }, [customTravelHours]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.fareOverrides, JSON.stringify(fareOverrides));
    } catch {
      // ignore
    }
  }, [fareOverrides]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.customFareLegs, JSON.stringify(customFareLegs));
    } catch {
      // ignore
    }
  }, [customFareLegs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.defaultOrigin, JSON.stringify(fareOriginId));
    } catch {
      // ignore
    }
  }, [fareOriginId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const handleTripInputChange = (next: TripInput) => {
    if (next.destinationId !== tripInput.destinationId) {
      const destCfg = getDestinationById(next.destinationId);
      if (destCfg.defaultFareDestinationId) {
        setFareDestId(destCfg.defaultFareDestinationId);
      }
    }
    if (
      next.transport === 'hsr' &&
      (next.destinationId === 'taichung' || next.destinationId === 'taipei')
    ) {
      setUseHsrTransfer(true);
    } else if (next.transport === 'train') {
      setUseHsrTransfer(false);
    }
    setTripInput(next);
  };

  const calculationResult = useMemo(
    () => calculateTaitungTravel(tripInput, calendar),
    [tripInput, calendar]
  );

  const { segments: fareSegments, routeSummary } = useMemo(
    () =>
      buildRouteSegments(
        fareOriginId,
        fareDestId,
        useHsrTransfer,
        fareOverrides,
        customFareLegs
      ),
    [fareOriginId, fareDestId, useHsrTransfer, fareOverrides, customFareLegs]
  );

  const originLabel =
    ORIGIN_STATIONS.find((s) => s.id === fareOriginId)?.label ?? fareOriginId;
  const fareDestLabel =
    DESTINATION_STATIONS.find((s) => s.id === fareDestId)?.label ?? fareDestId;

  const handleSaveCustomHours = (
    destId: string,
    transport: TransportMode,
    hours: number
  ) => {
    const key = getTravelHoursKey(destId, transport);
    setCustomTravelHours((prev) => ({ ...prev, [key]: hours }));
  };

  const handleResetCustomHours = (destId: string, transport: TransportMode) => {
    const key = getTravelHoursKey(destId, transport);
    setCustomTravelHours((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleImportCalendar = (dataset: CalendarDataset) => {
    setCalendar(dataset);
    try {
      localStorage.setItem(STORAGE_KEYS.calendar, JSON.stringify(dataset));
    } catch {
      // ignore quota
    }
    showToast(
      `已載入 ${dataset.years.join(' / ')} 行政機關辦公日曆（${dataset.totalRecords} 筆）`
    );
  };

  const handleResetDefaultCalendar = () => {
    const def = buildDefaultCalendarDataset([2026, 2025]);
    setCalendar(def);
    try {
      localStorage.removeItem(STORAGE_KEYS.calendar);
    } catch {
      // ignore
    }
    showToast('已還原內建 2026 / 2025 辦公日曆');
  };

  const handleQuickCsvUpload = async (file?: File) => {
    if (!file) return;
    try {
      const text = await readCalendarFileWithEncodingFallback(file);
      const parsed = parseGovernmentCalendarText(text, file.name);
      handleImportCalendar(parsed);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '匯入日曆失敗');
    }
  };

  const handleExportSettingsJson = () => {
    const payload: AppExportSettings = {
      version: 'V121',
      exportedAt: new Date().toISOString(),
      customTravelHours,
      fareOverrides,
      customFareLegs,
      defaultOriginId: fareOriginId,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taitung-travel-settings-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已匯出個人化車資與車程設定檔 (.json)');
  };

  const handleImportSettingsJson = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as Partial<AppExportSettings>;
    if (parsed.customTravelHours && typeof parsed.customTravelHours === 'object') {
      setCustomTravelHours(parsed.customTravelHours);
    }
    if (parsed.fareOverrides && typeof parsed.fareOverrides === 'object') {
      setFareOverrides(parsed.fareOverrides);
    }
    if (Array.isArray(parsed.customFareLegs)) {
      setCustomFareLegs(parsed.customFareLegs);
    }
    if (typeof parsed.defaultOriginId === 'string') {
      setFareOriginId(parsed.defaultOriginId);
    }
    showToast('已成功匯入設定檔');
  };

  const handleUpdateSegmentOverride = (
    segmentId: string,
    override: StoredFareOverride
  ) => {
    const isCustom = customFareLegs.some((l) => l.id === segmentId);
    if (isCustom) {
      setCustomFareLegs((prev) =>
        prev.map((l) =>
          l.id === segmentId
            ? { ...l, price: override.price, confirmed: override.confirmed }
            : l
        )
      );
    } else {
      setFareOverrides((prev) => ({ ...prev, [segmentId]: override }));
    }
    showToast('已更新並儲存分段票價');
  };

  const handleResetSegmentOverride = (segmentId: string) => {
    setFareOverrides((prev) => {
      const copy = { ...prev };
      delete copy[segmentId];
      return copy;
    });
    showToast('已還原 V121 預設票價');
  };

  const handleAddCustomLeg = (leg: Omit<CustomFareLeg, 'id'>) => {
    const id = `custom:${Date.now()}`;
    setCustomFareLegs((prev) => [...prev, { ...leg, id }]);
    showToast('已新增自訂接駁區段');
  };

  const handleRemoveCustomLeg = (legId: string) => {
    setCustomFareLegs((prev) => prev.filter((l) => l.id !== legId));
    showToast('已移除自訂區段');
  };

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'calculator', label: '差勤試算' },
    { id: 'fares', label: '車資分段' },
    { id: 'calendar', label: '辦公日曆' },
    { id: 'kotlin', label: 'Android 源碼' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col text-slate-900 dark:text-slate-100">
      {/* 全版臺東特產商業藍調背景層（釋迦、池上金黃稻穗、洛神花、鹿野紅烏龍） */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#081F44] via-[#0F356E] to-[#071836] no-print"
      >
        {!backdropFailed && (
          <img
            src={TAITUNG_BACKDROP_URL}
            alt="臺東特產背景：臺東釋迦、池上金黃稻穗、洛神花與鹿野紅烏龍"
            referrerPolicy="no-referrer"
            onError={() => setBackdropFailed(true)}
            className="w-full h-full object-cover object-bottom opacity-80 dark:opacity-55 scale-[1.01]"
          />
        )}
        {/* 精密校準的皇室海藍遮罩：完整透出左右兩側與下方臺東特產，同時維持商務級高對比閱讀度 */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? 'bg-gradient-to-b from-[#051226]/86 via-[#081D3D]/74 to-[#051226]/82'
              : 'bg-gradient-to-b from-[#0A2959]/80 via-[#0E3672]/58 to-[#071F45]/72'
          }`}
        />
      </div>

      {/* 嚴格三區塊金屬藍頂部導覽列 */}
      <header className="sticky top-0 z-30 h-14 bg-gradient-to-b from-[#0F336B]/95 to-[#09224A]/95 backdrop-blur-md border-b border-blue-300/25 shadow-[0_4px_16px_rgba(4,15,38,0.32)] no-print">
        <div className="max-w-[1240px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element brand wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 rounded"
          >
            臺東差勤通
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav
            aria-label="主導覽"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-4 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                    active
                      ? 'text-white font-semibold'
                      : 'text-blue-100/75 hover:text-white'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-sky-300 via-white to-sky-300"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary metallic action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              disabled={!calculationResult.valid}
              className="btn-metal-primary h-9 px-4 text-xs font-medium rounded-lg disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              產生核銷報表
            </button>
          </div>
        </div>
      </header>

      {/* 行動裝置單行頁籤列 */}
      <nav
        aria-label="行動導覽"
        className="md:hidden bg-[#0A2550]/95 backdrop-blur-md border-b border-blue-300/20 px-4 overflow-x-auto no-print"
      >
        <div className="flex items-center gap-5">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative py-3 text-xs font-medium whitespace-nowrap shrink-0 ${
                  active ? 'text-white font-semibold' : 'text-blue-200/80'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-sky-300"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 工作區主容器 */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 商務旗艦頂部主視覺條（完整呈現臺東特產美學與核心動作金屬鍵） */}
        <section className="relative rounded-2xl overflow-hidden border border-blue-300/35 shadow-[0_12px_34px_rgba(4,16,38,0.34)] no-print">
          {!backdropFailed && (
            <img
              src={TAITUNG_BACKDROP_URL}
              alt="臺東特產商業主視覺：釋迦、池上米稻穗、洛神花與鹿野紅烏龍"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071D42]/92 via-[#0C2F66]/78 to-[#071D42]/55" />

          <div className="relative px-6 py-6 sm:px-8 sm:py-7 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="max-w-2xl">
              <div className="text-xs font-medium text-sky-200/90 tracking-wide">
                臺東縣政府公務出差精算系統 · 臺東釋迦、池上米與紅烏龍山海印象
              </div>
              <h1 className="mt-1.5 text-2xl sm:text-[28px] font-bold tracking-tight text-white [text-wrap:balance]">
                臺東縣政府員工出差天數與路程補休計算器
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-blue-100/90">
                <span>已載入 {calendar.years.join(' / ')} 行政機關辦公日曆</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">{calendar.totalRecords} 筆基準日期</span>
                <span aria-hidden="true">·</span>
                <span>V121 假日半日路程按單趟車程覈實採計</span>
                <span aria-hidden="true">·</span>
                <span>支援手機離線安裝</span>
              </div>
            </div>

            {/* 金屬質感操作鍵群組（含 PWA 安裝到手機鍵） */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <PWAInstallButton />

              <input
                ref={quickCsvInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                className="hidden"
                onChange={(e) => {
                  handleQuickCsvUpload(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => quickCsvInputRef.current?.click()}
                className="btn-metal-silver inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <Upload className="w-3.5 h-3.5" />
                匯入日曆 CSV
              </button>
              <button
                type="button"
                onClick={handleExportSettingsJson}
                className="btn-metal-silver inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <Download className="w-3.5 h-3.5" />
                匯出設定檔
              </button>
              <button
                type="button"
                onClick={() => setIsDark((d) => !d)}
                aria-label={isDark ? '切換淺色模式' : '切換深色模式'}
                className="btn-metal-silver inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>

        {/* 操作即時回饋訊息 */}
        {toastMessage && (
          <div
            role="status"
            className="px-4 py-2.5 rounded-lg bg-[#092147] border border-sky-400/40 text-white text-xs font-medium shadow-lg no-print"
          >
            {toastMessage}
          </div>
        )}

        {/* 頁籤內容視圖 */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <TripParametersPanel
                input={tripInput}
                customTravelHours={customTravelHours}
                onChange={handleTripInputChange}
                onSaveCustomHours={handleSaveCustomHours}
                onResetCustomHours={handleResetCustomHours}
              />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <GuideResultPanel
                result={calculationResult}
                matchedFareSegments={fareSegments}
                originLabel={originLabel}
                fareDestLabel={fareDestLabel}
                onOpenReport={() => setReportOpen(true)}
                onGoToFareTab={() => setActiveTab('fares')}
              />

              {/* 浮動核銷報表引導提示列（以 executive-card 封裝搭配皇室藍光澤漸層聚焦） */}
              {calculationResult.valid && showReportPromptBar && (
                <aside
                  aria-label="核銷報表操作提示"
                  className="sticky bottom-4 z-20 executive-card rounded-2xl overflow-hidden no-print"
                >
                  <div className="bg-gradient-to-r from-[#0A2757]/95 via-[#164A9E]/88 to-[#0E3675]/95 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-sky-200 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          差勤試算已就緒，可立即產出核銷明細報表
                        </p>
                        <p className="text-[11px] text-blue-100/85 font-mono-num truncate">
                          核給 {calculationResult.allowedDays.toFixed(1)} 天 · 路程補休{' '}
                          {calculationResult.totalCompLeaveHours} 小時 · 支援 LINE 複製與 PDF 列印
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setReportOpen(true)}
                        className="btn-metal-primary inline-flex items-center gap-1.5 h-9 px-4 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        產生核銷報表
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReportPromptBar(false)}
                        aria-label="關閉此提示列"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-blue-100/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </div>
        )}

        {activeTab === 'fares' && (
          <FareCalculatorPanel
            originId={fareOriginId}
            destId={fareDestId}
            useHsrTransfer={useHsrTransfer}
            segments={fareSegments}
            routeSummary={routeSummary}
            onChangeOrigin={setFareOriginId}
            onChangeDest={setFareDestId}
            onToggleHsrTransfer={setUseHsrTransfer}
            onUpdateSegmentOverride={handleUpdateSegmentOverride}
            onResetSegmentOverride={handleResetSegmentOverride}
            onAddCustomLeg={handleAddCustomLeg}
            onRemoveCustomLeg={handleRemoveCustomLeg}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarDataPanel
            calendar={calendar}
            onImportCalendar={handleImportCalendar}
            onResetDefaultCalendar={handleResetDefaultCalendar}
            onExportSettingsJson={handleExportSettingsJson}
            onImportSettingsJson={handleImportSettingsJson}
          />
        )}

        {activeTab === 'kotlin' && <KotlinSourcePanel />}
      </main>

      {/* 簡潔商務藍靜態頁尾 */}
      <footer className="border-t border-blue-300/20 bg-[#061836]/80 backdrop-blur-md py-5 mt-8 no-print">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-100/80">
          <span>
            臺東差勤通 · 依《臺東縣政府員工出差天數核給標準表》及注意事項六、八試算
          </span>
          <span>支援 PWA 離線安裝 · 所有日曆比對與個人車資設定皆安全儲存於本機端</span>
        </div>
      </footer>

      {/* 離線狀態提示 */}
      <OfflineIndicator />

      {/* 核銷報表預覽與列印視窗 */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        result={calculationResult}
        input={tripInput}
        fareSegments={fareSegments}
        originLabel={originLabel}
        destLabel={fareDestLabel}
      />
    </div>
  );
}
