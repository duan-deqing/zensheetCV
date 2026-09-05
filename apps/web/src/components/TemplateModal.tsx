import { useEffect, useRef, useState } from 'react';
import { useUI } from '@/store/UIContext';
import { usePreview } from '@/store/PreviewContext';
import { builtinTemplates } from '@/templates';
import { TemplatePreview } from '@/components/TemplatePreview';
import { HoverTip } from '@/components/HoverTip';
import { useModalClose } from '@/hooks/useModalClose';
import { useTr, type Bi } from '@/i18n/LangContext';

/** 屏幕顶部中央胶囊提示（与 Coffee 致谢胶囊同款样式） */
type TopPill = { id: number; text: string; visible: boolean };

/** 模板名称与描述的双语文案（模板定义在 templates/ 中，不在本次改动范围，故按 id 在此覆盖） */
export const TEMPLATE_TEXT: Record<string, { name: Bi; description: Bi }> = {
  classic: {
    name: { zh: '经典简洁', en: 'Classic' },
    description: { zh: '经典黑白设计，适合正式求职场景', en: 'Timeless black-and-white design for formal job applications.' },
  },
  carbon: {
    name: { zh: '碳黑章标', en: 'Carbon' },
    description: { zh: '灰底章节条 + 左侧竖标，黑白灰商务风，适合正式求职与国企/事业单位', en: 'Gray section bars with a left accent stripe — a formal monochrome style for corporate and public-sector roles.' },
  },
  modern: {
    name: { zh: '现代设计', en: 'Modern' },
    description: { zh: '蓝色主调，现代感十足，适合互联网/科技公司', en: 'A bold blue palette with a modern feel, ideal for tech and internet companies.' },
  },
  elegant: {
    name: { zh: '优雅复古', en: 'Elegant' },
    description: { zh: '优雅复古设计，适合设计/创意/教育行业', en: 'Elegant vintage design for design, creative, and education fields.' },
  },
  tech: {
    name: { zh: '技术极简', en: 'Tech Minimal' },
    description: { zh: '极简技术风格，适合技术/开源/开发者', en: 'Minimalist technical style for developers and open-source work.' },
  },
  muji: {
    name: { zh: '墨纸极简', en: 'Ink & Paper' },
    description: { zh: '深色题头横幅 + 居中胶囊标题，黑白灰沉稳耐看', en: 'Dark header banner with centered pill titles — a calm, understated monochrome look.' },
  },
  azure: {
    name: { zh: '青线极简', en: 'Azure Lines' },
    description: { zh: '主题色细线标题 + 灰阶正文，留白克制、素净轻盈', en: 'Thin accent underlines with gray body text — restrained whitespace, clean and light.' },
  },
  sunrise: {
    name: { zh: '朝阳暖橙', en: 'Sunrise Glow' },
    description: { zh: '暖橙渐变题头 + 主题色标题线，明快有活力', en: 'Warm gradient header with accent title lines — bright and energetic.' },
  },
};

/** 模板库弹窗：以卡片展示全部内置模板（实时预览 + 名称 + 标签 + 添加按钮）。
 *  「添加」后该模板进入主题面板的模板卡片列表可供切换 */
export function TemplateModal() {
  const { templateModalOpen, toggleTemplateModal, addedTemplates, addTemplate, removeTemplate } = useUI();
  const { currentTemplate } = usePreview();
  const tr = useTr();
  // 统一关闭流程：淡出动画结束后再卸载
  const { closing, close } = useModalClose(templateModalOpen, toggleTemplateModal);
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

  // Esc 关闭由 useModalClose 内置监听

  if (!templateModalOpen) return null;
  const currentId = currentTemplate?.id || 'classic';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={tr({ zh: '模板库', en: 'Template Library' })}
    >
      {/* 遮罩：打开后背景变灰聚焦，点击关闭 */}
      <div
        className={`${closing ? 'modal-backdrop-out' : 'tpl-backdrop-in'} absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]`}
        onClick={close}
        aria-hidden="true"
      />
      {/* 面板：顶栏固定、滚动区限制在其下方。
          手机端：全宽 × (100dvh - 1rem) 固定高度（注意 calc 减号需空格：Tailwind 用 _ 转义）；
          sm 起：16:9 比例宽度 + 85vh 上限（flex-1 + min-h-0 网格滚动） */}
      <div
        className={`${closing ? 'modal-out' : 'tpl-modal-in'} relative flex flex-col bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden w-full h-[calc(100dvh_-_1rem)] sm:h-auto sm:w-[min(1600px,100%,calc(82vh*16/9))] sm:max-h-[85vh]`}
      >
        {/* 顶栏：与预览顶栏同构（mono 眉标 + py-2 + h-7 按钮 = 44px 等高） */}
        <div className="flex items-center gap-3 px-5 py-2 bg-white border-b border-gray-200 flex-none">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0"
            aria-hidden="true"
          >
            {'< TEMPLATES />'}
          </p>
          <h3 className="text-sm font-semibold text-gray-900">{tr({ zh: '模板库', en: 'Template Library' })}</h3>
          <HoverTip text={tr({ zh: '关闭', en: 'Close' })}>
            <button
              onClick={close}
              className="ml-auto w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
              aria-label={tr({ zh: '关闭模板库', en: 'Close Template Library' })}
            >
              ✕
            </button>
          </HoverTip>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-4 overflow-y-auto flex-1 min-h-0">
          {builtinTemplates.map((t) => {
            const isCurrent = t.id === currentId;
            const isAdded = addedTemplates.includes(t.id);
            const bi = TEMPLATE_TEXT[t.id];
            const name = bi ? tr(bi.name) : t.name;
            const description = bi ? tr(bi.description) : t.description;
            return (
              <div
                key={t.id}
                className={`rounded-xl border overflow-hidden flex flex-col min-h-[320px] ${
                  isCurrent ? 'border-primary-400 ring-1 ring-primary-200' : 'border-gray-200'
                }`}
              >
                <TemplatePreview templateId={t.id} height={208} mode="fill" className="border-b border-gray-100" />
                <div className="p-3 flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{name}</h4>
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
                  <p className="text-[13px] text-gray-500 flex-1">{description}</p>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full h-8 rounded-md bg-primary-50 text-primary-600 text-[13px] font-medium cursor-default"
                    >
                      {tr({ zh: '使用中', en: 'In Use' })}
                    </button>
                  ) : isAdded ? (
                    <button
                      onClick={() => {
                        removeTemplate(t.id);
                        showPill(tr({ zh: `已移除「${name}」`, en: `Removed "${name}"` }));
                      }}
                      className="w-full h-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 text-[13px] font-medium transition-colors"
                      aria-label={tr({ zh: `取消添加 ${name}`, en: `Remove ${name}` })}
                    >
                      {tr({ zh: '取消添加', en: 'Remove' })}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        addTemplate(t.id);
                        showPill(tr({ zh: `已添加「${name}」，可在主题面板切换`, en: `Added "${name}" — switch it in the Theme Panel` }));
                      }}
                      className="w-full h-8 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-medium transition-colors"
                      aria-label={tr({ zh: `添加 ${name}`, en: `Add ${name}` })}
                    >
                      {tr({ zh: '添加', en: 'Add' })}
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
