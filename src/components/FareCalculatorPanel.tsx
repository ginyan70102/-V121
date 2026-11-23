import React, { useState } from 'react';
import {
  CheckCircle2,
  CircleDashed,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  BASE_SEGMENTS,
  DESTINATION_STATIONS,
  FARE_MODE_LABELS,
  getRouteKey,
  ORIGIN_STATIONS,
} from '../data/fares';
import { CustomFareLeg, FareSegment, StoredFareOverride } from '../types/travel';

interface FareCalculatorPanelProps {
  originId: string;
  destId: string;
  useHsrTransfer: boolean;
  segments: FareSegment[];
  routeSummary: string;
  onChangeOrigin: (id: string) => void;
  onChangeDest: (id: string) => void;
  onToggleHsrTransfer: (enabled: boolean) => void;
  onUpdateSegmentOverride: (segmentId: string, override: StoredFareOverride) => void;
  onResetSegmentOverride: (segmentId: string) => void;
  onAddCustomLeg: (leg: Omit<CustomFareLeg, 'id'>) => void;
  onRemoveCustomLeg: (legId: string) => void;
}

const QUICK_ROUTES = [
  { label: '成功 ➔ 台北（經玉里轉乘）', origin: 'chenggong', dest: 'taipei', hsr: false },
  { label: '成功 ➔ 綠島（經富岡漁港）', origin: 'chenggong', dest: 'green_island', hsr: false },
  { label: '臺東 ➔ 高雄（已確認 $485）', origin: 'taitung', dest: 'kaohsiung', hsr: false },
  { label: '臺東 ➔ 台中（已確認 $982）', origin: 'taitung', dest: 'taichung', hsr: false },
  { label: '玉里 ➔ 宜蘭（已確認 $547）', origin: 'yuli', dest: 'yilan', hsr: false },
];

export const FareCalculatorPanel: React.FC<FareCalculatorPanelProps> = ({
  originId,
  destId,
  useHsrTransfer,
  segments,
  routeSummary,
  onChangeOrigin,
  onChangeDest,
  onToggleHsrTransfer,
  onUpdateSegmentOverride,
  onResetSegmentOverride,
  onAddCustomLeg,
  onRemoveCustomLeg,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editConfirmed, setEditConfirmed] = useState<boolean>(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newMode, setNewMode] = useState<FareSegment['mode']>('bus');
  const [newPrice, setNewPrice] = useState('100');
  const [newConfirmed, setNewConfirmed] = useState(true);

  const oneWayTotal = segments.reduce((sum, s) => sum + s.price, 0);
  const roundTripTotal = oneWayTotal * 2;
  const confirmedCount = segments.filter((s) => s.confirmed).length;
  const canUseHsr =
    (originId === 'taitung' || originId === 'chenggong') &&
    (destId === 'taichung' || destId === 'taipei');

  const startEdit = (seg: FareSegment) => {
    setEditingId(seg.id);
    setEditPrice(String(seg.price));
    setEditConfirmed(seg.confirmed);
  };

  const commitEdit = (seg: FareSegment) => {
    const parsed = Math.max(0, Math.round(Number(editPrice) || 0));
    onUpdateSegmentOverride(seg.id, { price: parsed, confirmed: editConfirmed });
    setEditingId(null);
  };

  const handleAddLegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFrom.trim() || !newTo.trim()) return;
    onAddCustomLeg({
      routeKey: getRouteKey(originId, destId, useHsrTransfer),
      from: newFrom.trim(),
      to: newTo.trim(),
      mode: newMode,
      price: Math.max(0, Math.round(Number(newPrice) || 0)),
      confirmed: newConfirmed,
    });
    setNewFrom('');
    setNewTo('');
    setNewPrice('100');
    setShowAddForm(false);
  };

  const coreConfirmedDefaults = Object.values(BASE_SEGMENTS).filter((s) => s.confirmed);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 左側：起訖站與路徑拆解設定 */}
        <section className="lg:col-span-5 executive-card rounded-2xl p-6 space-y-5">
          <div className="pb-4 border-b border-blue-100 dark:border-blue-900/60">
            <h2 className="text-base font-semibold text-[#0C254B] dark:text-white">
              車資分段路徑設定
            </h2>
            <p className="text-xs text-slate-500 dark:text-blue-200/70 mt-1">
              選擇起訖站後，系統自動拆解公車、臺鐵、高鐵或離島交通船轉乘區段
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="fare-origin"
                className="block text-sm font-medium text-slate-800 dark:text-blue-100 mb-1.5"
              >
                出發起點站
              </label>
              <select
                id="fare-origin"
                value={originId}
                onChange={(e) => onChangeOrigin(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-blue-50/55 dark:bg-[#081529] border border-blue-200 dark:border-blue-800/80 rounded-lg text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {ORIGIN_STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="fare-dest"
                className="block text-sm font-medium text-slate-800 dark:text-blue-100 mb-1.5"
              >
                抵達迄點站
              </label>
              <select
                id="fare-dest"
                value={destId}
                onChange={(e) => onChangeDest(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-blue-50/55 dark:bg-[#081529] border border-blue-200 dark:border-blue-800/80 rounded-lg text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {DESTINATION_STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {canUseHsr && (
              <label className="flex items-center justify-between gap-3 pt-1 cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-blue-100">
                    經高雄左營轉乘台灣高鐵
                  </div>
                  <div className="text-xs text-slate-500 dark:text-blue-200/70">
                    改以「台東➔高雄（火車）＋左營➔高鐵迄點」分段試算
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={useHsrTransfer}
                  onChange={(e) => onToggleHsrTransfer(e.target.checked)}
                  className="w-4 h-4 accent-blue-700 rounded"
                />
              </label>
            )}
          </div>

          <div className="pt-4 border-t border-blue-100 dark:border-blue-900/60">
            <div className="text-xs font-medium text-slate-600 dark:text-blue-200/80 mb-2">
              常用臺東公務路徑快選
            </div>
            <div className="space-y-2">
              {QUICK_ROUTES.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => {
                    onChangeOrigin(r.origin);
                    onChangeDest(r.dest);
                    onToggleHsrTransfer(r.hsr);
                  }}
                  className="btn-metal-silver w-full text-left px-3.5 py-2 text-xs font-medium rounded-lg"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 右側：分段票價明細與總計 */}
        <section className="lg:col-span-7 executive-card rounded-2xl overflow-hidden">
          {/* 總計橫幅 */}
          <div className="p-6 bg-gradient-to-br from-[#0B2D63] via-[#113D82] to-[#0A2552] text-white border-b border-blue-400/25">
            <div className="text-xs text-sky-200/90">{routeSummary}</div>
            <div className="mt-4 grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-blue-100/80">單趟交通費合計</div>
                <div className="mt-1 font-mono-num text-2xl sm:text-3xl font-semibold text-white">
                  NT$ {oneWayTotal.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-100/80">來回交通費合計</div>
                <div className="mt-1 font-mono-num text-2xl sm:text-3xl font-semibold text-sky-200">
                  NT$ {roundTripTotal.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-blue-100/85">
              共 <span className="font-mono-num">{segments.length}</span> 段行程 ·{' '}
              <span className="font-mono-num text-emerald-300 font-medium">
                {confirmedCount} 段已確認
              </span>
              {segments.length - confirmedCount > 0 && (
                <>
                  {' · '}
                  <span className="font-mono-num text-amber-300 font-medium">
                    {segments.length - confirmedCount} 段待核對票根
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 分段清單 */}
          <div className="divide-y divide-blue-100/80 dark:divide-blue-900/50">
            {segments.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-blue-200/70">
                目前路徑尚無預設分段，請切換不同起訖站或點擊下方新增自訂接駁區段。
              </div>
            ) : (
              segments.map((seg, index) => {
                const isEditing = editingId === seg.id;
                const hasBase = Boolean(BASE_SEGMENTS[seg.id]);
                return (
                  <div
                    key={seg.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-mono-num text-xs text-blue-700/70 dark:text-sky-400/80">
                          0{index + 1}.
                        </span>
                        <span className="text-sm font-semibold text-[#0C254B] dark:text-white">
                          {seg.from} ➔ {seg.to}
                        </span>
                        <span aria-hidden="true" className="text-blue-200 dark:text-blue-800">
                          ·
                        </span>
                        <span className="text-xs text-slate-600 dark:text-blue-200/80">
                          {seg.modeLabel}
                        </span>
                        <span aria-hidden="true" className="text-blue-200 dark:text-blue-800">
                          ·
                        </span>
                        {seg.confirmed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            已確認
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                            <CircleDashed className="w-3.5 h-3.5" />
                            未確認
                          </span>
                        )}
                      </div>
                      {seg.note && (
                        <p className="text-xs text-slate-500 dark:text-blue-200/70 mt-1">
                          {seg.note}
                        </p>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            $
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24 h-9 pl-6 pr-2 font-mono-num text-sm bg-blue-50/55 dark:bg-[#081529] border border-blue-300 dark:border-blue-700 rounded-md text-slate-900 dark:text-slate-100"
                          />
                        </div>
                        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-blue-200 cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={editConfirmed}
                            onChange={(e) => setEditConfirmed(e.target.checked)}
                            className="accent-blue-700"
                          />
                          標為已確認
                        </label>
                        <button
                          type="button"
                          onClick={() => commitEdit(seg)}
                          className="btn-metal-primary h-9 px-3 text-xs font-medium rounded-md whitespace-nowrap"
                        >
                          儲存
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="btn-metal-silver h-9 px-2.5 text-xs rounded-md whitespace-nowrap"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="font-mono-num text-base font-semibold text-[#0C254B] dark:text-white">
                          NT$ {seg.price.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(seg)}
                          aria-label={`修改 ${seg.from} 至 ${seg.to} 票價`}
                          className="btn-metal-silver inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium rounded-md whitespace-nowrap"
                        >
                          <Pencil className="w-3 h-3" />
                          修改
                        </button>
                        {hasBase && (
                          <button
                            type="button"
                            onClick={() => onResetSegmentOverride(seg.id)}
                            title="還原 V121 預設票價"
                            className="btn-metal-silver h-8 w-8 inline-flex items-center justify-center rounded-md"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {seg.isCustom && (
                          <button
                            type="button"
                            onClick={() => onRemoveCustomLeg(seg.id)}
                            aria-label="刪除此自訂分段"
                            className="h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 新增自訂接駁區段 */}
          <div className="px-6 py-4 bg-blue-50/55 dark:bg-[#08172E]/70 border-t border-blue-100 dark:border-blue-900/60">
            {!showAddForm ? (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="btn-metal-silver inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                新增自訂接駁區段（捷運／公車／計程車）
              </button>
            ) : (
              <form onSubmit={handleAddLegSubmit} className="space-y-3">
                <div className="text-xs font-semibold text-[#0C254B] dark:text-blue-100">
                  新增自訂接駁區段
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    placeholder="起站（如 台北站）"
                    value={newFrom}
                    onChange={(e) => setNewFrom(e.target.value)}
                    required
                    className="h-9 px-3 text-xs bg-white dark:bg-[#0D1E38] border border-blue-200 dark:border-blue-800 rounded-md text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="迄站（如 部會機關）"
                    value={newTo}
                    onChange={(e) => setNewTo(e.target.value)}
                    required
                    className="h-9 px-3 text-xs bg-white dark:bg-[#0D1E38] border border-blue-200 dark:border-blue-800 rounded-md text-slate-900 dark:text-slate-100"
                  />
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value as FareSegment['mode'])}
                    className="h-9 px-2.5 text-xs bg-white dark:bg-[#0D1E38] border border-blue-200 dark:border-blue-800 rounded-md text-slate-900 dark:text-slate-100"
                  >
                    {(Object.keys(FARE_MODE_LABELS) as FareSegment['mode'][]).map((m) => (
                      <option key={m} value={m}>
                        {FARE_MODE_LABELS[m]}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    placeholder="單趟金額"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                    className="h-9 px-3 font-mono-num text-xs bg-white dark:bg-[#0D1E38] border border-blue-200 dark:border-blue-800 rounded-md text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-blue-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newConfirmed}
                      onChange={(e) => setNewConfirmed(e.target.checked)}
                      className="accent-blue-700"
                    />
                    票價已確認
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="btn-metal-silver h-8 px-3 text-xs rounded-md"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="btn-metal-primary h-8 px-3.5 text-xs font-medium rounded-md"
                    >
                      加入分段
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* V121 六筆核心已確認基準票價速查表 */}
      <section className="executive-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-100 dark:border-blue-900/60 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-[#0C254B] dark:text-white">
            V121 內建核心已確認票價標準表
          </h3>
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            全數已核對確認
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-100 dark:border-blue-900/60 text-xs text-slate-500 dark:text-blue-200/70">
                <th className="text-left font-medium px-6 py-2.5">交通運具</th>
                <th className="text-left font-medium px-6 py-2.5">區間起訖</th>
                <th className="text-right font-medium px-6 py-2.5">單趟票價</th>
                <th className="text-right font-medium px-6 py-2.5">來回票價</th>
                <th className="text-right font-medium px-6 py-2.5">核對狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100/70 dark:divide-blue-900/50">
              {coreConfirmedDefaults.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors"
                >
                  <td className="px-6 py-2.5 text-slate-600 dark:text-blue-200/80">
                    {FARE_MODE_LABELS[item.mode]}
                  </td>
                  <td className="px-6 py-2.5 font-medium text-[#0C254B] dark:text-white">
                    {item.from} ➔ {item.to}
                  </td>
                  <td className="px-6 py-2.5 text-right font-mono-num text-[#0C254B] dark:text-white">
                    NT$ {item.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-2.5 text-right font-mono-num text-slate-600 dark:text-blue-200/80">
                    NT$ {(item.price * 2).toLocaleString()}
                  </td>
                  <td className="px-6 py-2.5 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    已確認
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
