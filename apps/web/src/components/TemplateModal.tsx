import { useEffect, useRef, useState } from 'react';
import { useUI } from '@/store/UIContext';
import { usePreview } from '@/store/PreviewContext';
import { builtinTemplates } from '@/templates';
import { TemplatePreview } from '@/components/TemplatePreview';
import { HoverTip } from '@/components/HoverTip';

/** 屏幕顶部中央胶囊提示（与 Coffee 致谢胶囊同款样式） */
type TopPill = { id: number; text: string; visible: boolean };

/** 模板库弹窗：以卡片展示全部内置模板（实时预览 + 名称 + 标签 + 添加按钮）。
 *  「添加」后该模板进入主题面板的模板卡片列表可供切换 */
export function TemplateModal() {
  const { templateModalOpen, toggleTemplateModal, addedTemplates, addTemplate, removeTemplate } = useUI();
  const { currentTemplate } = usePreview();
  // 添加/取消添加的顶部胶囊提示；id 递增用于连续操作时重播动画
  const [pill, setPill] = useState<TopPill | null>(null);
  const pillIdRef = useRef(0);
  const pillTimersRef = useRef<number[]>([]);

  const showPill = (text: string) => {
    pillTimersRef.current.forEach((t) => window.clearTimeout(t));
    pillIdRef.current += 1;
    setPill({ id: pillIdRef.current, text, visible: true });
    pillTimersRef.current = [
      window.setTimeout(() => setPill((p) => (p ? { ...p, visible: false } : p)), 2400),
      window.setTimeout(() => setPill(null), 2700),
    ];
  };

  // 卸载时清理胶囊定时器
  useEffect(() => () => pillTimersRef.current.forEach((t) => window.clearTimeout(t)), []);

  // Esc 关闭
  useEffect(() => {
    if (!templateModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleTemplateModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [templateModalOpen, toggleTemplateModal]);

  if (!templateModalOpen) return null;
  const currentId = currentTemplate?.id || 'classic';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="模板库"
    >
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes tplPillIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tplPillOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-10px) scale(0.95); }
        }
        .tpl-modal-in { animation: modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .tpl-backdrop-in { animation: backdropIn 0.2s ease-out both; }
        .tpl-pill-in { animation: tplPillIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .tpl-pill-out { animation: tplPillOut 0.3s ease-in both; }
        @media (prefers-reduced-motion: reduce) {
          .tpl-modal-in, .tpl-backdrop-in, .tpl-pill-in, .tpl-pill-out { animation: none; }
        }
      `}</style>
      {/* 遮罩：打开后背景变灰聚焦，点击关闭 */}
      <div
        className="tpl-backdrop-in absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
        onClick={toggleTemplateModal}
        aria-hidden="true"
      />
      {/* 面板：宽度按屏幕 16:9 比例计算，顶栏固定、滚动区限制在其下方 */}
      <div
        className="tpl-modal-in relative flex flex-col bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
        style={{ width: 'min(1600px, 94vw, calc(82vh * 16 / 9))', maxHeight: '85vh' }}
      >
        {/* 顶栏：与预览顶栏同构（mono 眉标 + py-2 + h-7 按钮 = 44px 等高） */}
        <div className="flex items-center gap-3 px-5 py-2 bg-white border-b border-gray-200 flex-none">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0"
            aria-hidden="true"
          >
            {'< TEMPLATES />'}
          </p>
          <h3 className="text-sm font-semibold text-gray-900">模板库</h3>
          <HoverTip text="关闭">
            <button
              onClick={toggleTemplateModal}
              className="ml-auto w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
              aria-label="关闭模板库"
            >
              ✕
            </button>
          </HoverTip>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-4 overflow-y-auto flex-1 min-h-0">
          {builtinTemplates.map((t) => {
            const isCurrent = t.id === currentId;
            const isAdded = addedTemplates.includes(t.id);
            return (
              <div
                key={t.id}
                className={`rounded-xl border overflow-hidden flex flex-col ${
                  isCurrent ? 'border-primary-400 ring-1 ring-primary-200' : 'border-gray-200'
                }`}
              >
                <TemplatePreview templateId={t.id} height={208} mode="fill" className="border-b border-gray-100" />
                <div className="p-3 flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{t.name}</h4>
                    {/* 彩色胶囊标签：取模板默认主色着色 */}
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border shrink-0"
                      style={{
                        color: t.defaultTheme.primaryColor,
                        borderColor: `color-mix(in srgb, ${t.defaultTheme.primaryColor} 35%, transparent)`,
                        backgroundColor: `color-mix(in srgb, ${t.defaultTheme.primaryColor} 10%, transparent)`,
                      }}
                    >
                      {t.id}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 flex-1">{t.description}</p>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full h-8 rounded-md bg-primary-50 text-primary-600 text-[13px] font-medium cursor-default"
                    >
                      使用中
                    </button>
                  ) : isAdded ? (
                    <button
                      onClick={() => {
                        removeTemplate(t.id);
                        showPill(`已移除「${t.name}」`);
                      }}
                      className="w-full h-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 text-[13px] font-medium transition-colors"
                      aria-label={`取消添加 ${t.name}`}
                    >
                      取消添加
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        addTemplate(t.id);
                        showPill(`已添加「${t.name}」，可在主题面板切换`);
                      }}
                      className="w-full h-8 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-medium transition-colors"
                      aria-label={`添加 ${t.name}`}
                    >
                      添加
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 顶部中央胶囊提示：与 Coffee 致谢胶囊同款；不拦截点击 */}
        {pill && (
          <div
            className="fixed left-1/2 top-6 -translate-x-1/2 z-[110] pointer-events-none"
            role="status"
            aria-live="polite"
          >
            <div
              key={pill.id}
              className={`${
                pill.visible ? 'tpl-pill-in' : 'tpl-pill-out'
              } px-5 py-2.5 rounded-full bg-gray-900/90 text-white text-[13px] font-medium shadow-lg whitespace-nowrap`}
            >
              {pill.text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
