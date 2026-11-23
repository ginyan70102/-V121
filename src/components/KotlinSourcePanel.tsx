import React, { useState } from 'react';
import { Check, Code2, Copy, Download } from 'lucide-react';
import { KOTLIN_SOURCE_FILES } from '../data/kotlinSources';

export const KotlinSourcePanel: React.FC = () => {
  const [activeId, setActiveId] = useState(KOTLIN_SOURCE_FILES[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeFile =
    KOTLIN_SOURCE_FILES.find((f) => f.id === activeId) ?? KOTLIN_SOURCE_FILES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = activeFile.code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(activeFile.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const bundle = KOTLIN_SOURCE_FILES.map(
      (f) =>
        `// ==========================================================================\n// FILE: ${f.path}\n// ==========================================================================\n\n${f.code}`
    ).join('\n\n');
    const blob = new Blob([bundle], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TaitungTravel_V121_Android_Kotlin_Sources.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="executive-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-blue-100 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#0C254B] dark:text-white">
            Android Kotlin 2.0 / Jetpack Compose 專案原始碼（V121）
          </h2>
          <p className="text-xs text-slate-500 dark:text-blue-200/70 mt-0.5">
            依第四部分規格清單完整對應產出 5 個核心模組，可直接貼入 Android Studio（Min SDK 26 / Material 3）編譯。
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadAll}
          className="btn-metal-primary inline-flex items-center gap-1.5 h-9 px-4 text-xs font-medium rounded-lg whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          打包下載全部 5 檔
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-blue-100 dark:border-blue-900/60 divide-y divide-blue-100/70 dark:divide-blue-900/50">
          {KOTLIN_SOURCE_FILES.map((file) => {
            const active = file.id === activeFile.id;
            return (
              <button
                key={file.id}
                type="button"
                onClick={() => setActiveId(file.id)}
                className={`w-full text-left px-5 py-4 transition-colors ${
                  active
                    ? 'bg-blue-50/90 dark:bg-blue-950/60'
                    : 'hover:bg-blue-50/45 dark:hover:bg-blue-950/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Code2
                    className={`w-4 h-4 shrink-0 ${
                      active
                        ? 'text-blue-700 dark:text-sky-400'
                        : 'text-slate-400 dark:text-blue-300/50'
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold truncate ${
                      active
                        ? 'text-[#0E3672] dark:text-sky-300'
                        : 'text-[#0C254B] dark:text-slate-100'
                    }`}
                  >
                    {file.filename}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-700 dark:text-blue-100/90 mt-1">
                  {file.title}
                </div>
                <p className="text-xs text-slate-500 dark:text-blue-200/70 mt-1 leading-relaxed">
                  {file.summary}
                </p>
              </button>
            );
          })}
        </aside>

        <div className="lg:col-span-8 flex flex-col min-w-0">
          <div className="px-5 py-3 bg-blue-50/70 dark:bg-[#08172E] border-b border-blue-100 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono-num text-xs text-slate-600 dark:text-blue-200/80 truncate">
              {activeFile.path}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="btn-metal-silver inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md whitespace-nowrap"
              >
                {copiedId === activeFile.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    複製程式碼
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadFile}
                className="btn-metal-silver inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                下載 .kt
              </button>
            </div>
          </div>

          <pre className="flex-1 p-5 overflow-auto text-xs leading-relaxed font-mono-num bg-[#061224] text-blue-50 max-h-[580px]">
            <code>{activeFile.code}</code>
          </pre>
        </div>
      </div>
    </section>
  );
};
