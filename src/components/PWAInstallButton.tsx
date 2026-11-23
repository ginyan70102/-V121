import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Share,
  Smartphone,
  WifiOff,
  X,
} from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isInAppBrowser, install } =
    usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // 已安裝並於獨立 App 視窗執行時，自動隱藏安裝鈕
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="btn-metal-install inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <Smartphone className="w-3.5 h-3.5" />
        安裝到手機
      </button>

      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="安裝臺東差勤通到手機桌面"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041024]/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#0D1E38] border border-blue-200 dark:border-blue-800/70 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-[#0D326B] to-[#174CA0] text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/pwa-192x192.png"
                  alt="臺東差勤通圖示"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg border border-blue-300/40 shadow-sm object-cover shrink-0"
                />
                <div>
                  <h3 className="text-sm font-semibold">安裝「臺東差勤通」至桌面</h3>
                  <p className="text-[11px] text-blue-100/90 mt-0.5">
                    免上架商店 · 全螢幕開啟 · 斷網離線可用
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="關閉安裝指引"
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-blue-100 hover:bg-white/15 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm text-slate-700 dark:text-slate-200">
              {isInAppBrowser ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg p-3 text-xs leading-relaxed">
                    <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      偵測到您正於 LINE 或社群 App 內建瀏覽器開啟，需先切換至系統瀏覽器才能執行安裝。
                    </span>
                  </div>
                  <ol className="space-y-2 text-xs leading-relaxed list-decimal list-inside text-slate-600 dark:text-slate-300">
                    <li>點擊畫面右上角或右下角「⋮ / 分享」選單。</li>
                    <li>選擇「使用預設瀏覽器開啟（Chrome 或 Safari）」。</li>
                    <li>開啟後再點一次「安裝到手機」即可建立桌面圖示。</li>
                  </ol>
                </div>
              ) : isIOS ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    iPhone／iPad 請透過 Safari 內建功能 2 步驟加入桌面：
                  </p>
                  <ol className="space-y-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono-num font-semibold text-blue-700 dark:text-sky-400">
                        01.
                      </span>
                      <span>
                        點擊 Safari 底部工具列的{' '}
                        <strong className="inline-flex items-center gap-0.5 font-semibold text-slate-900 dark:text-white">
                          <Share className="w-3.5 h-3.5 inline" /> 分享
                        </strong>{' '}
                        按鈕。
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono-num font-semibold text-blue-700 dark:text-sky-400">
                        02.
                      </span>
                      <span>
                        向下滑動並點選{' '}
                        <strong className="font-semibold text-slate-900 dark:text-white">
                          加入主畫面
                        </strong>
                        ，再按右上角「新增」即完成安裝。
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    透過瀏覽器安裝即可在手機或電腦桌面建立獨立 App 圖示並支援離線運作：
                  </p>
                  <ol className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono-num font-semibold text-blue-700 dark:text-sky-400">
                        01.
                      </span>
                      <span>
                        <strong>Android 手機（Chrome / Edge）</strong>：點右上角「⋮」選單 ➔ 選擇「安裝應用程式」或「加到主畫面」。
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono-num font-semibold text-blue-700 dark:text-sky-400">
                        02.
                      </span>
                      <span>
                        <strong>iPhone（Safari）</strong>：點底部「分享」➔ 選擇「加入主畫面」。
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono-num font-semibold text-blue-700 dark:text-sky-400">
                        03.
                      </span>
                      <span>
                        <strong>電腦版 Chrome / Edge</strong>：點網址列右側的「安裝應用程式」圖示即可建立桌面捷徑。
                      </span>
                    </li>
                  </ol>
                  <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 pt-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>若以手機正式網址開啟，點此按鈕將直接觸發一鍵原生安裝視窗。</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="btn-metal-primary h-9 px-5 text-xs font-medium rounded-lg"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-[#0D326B] border border-sky-400/50 px-3.5 py-2 text-xs font-medium text-white shadow-lg no-print"
    >
      <WifiOff className="w-3.5 h-3.5 text-sky-300" />
      離線模式運作中 · 所有差勤試算與本機設定照常使用
    </div>
  );
};
