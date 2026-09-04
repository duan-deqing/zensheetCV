import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useModalClose } from '@/hooks/useModalClose';
import {
  AIDocContent,
  DrawerNavContext,
  GuideContent,
  IconsDocContent,
  MarkdownDocContent,
  ThemeDocContent,
} from '@/pages/docs/DocsSubPages';

/** 关闭图标 */
function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/** 抽屉内的文档 Tab，与文档子页面一一对应 */
const TABS = [
  { id: 'guide', no: '01 · GUIDE', label: '使用指南', title: '使用指南', desc: '从创建简历到导出 PDF 的完整流程，并汇总其余教程入口。' },
  { id: 'markdown', no: '02 · MARKDOWN', label: 'Markdown 教程', title: 'Markdown 简历教程', desc: '常用语法速查，附使用示例与实时渲染效果预览。' },
  { id: 'theme', no: '03 · THEME', label: '主题配置', title: '主题配置', desc: '模板、视觉风格与页面布局的设置详解与注意事项。' },
  { id: 'icons', no: '04 · ICONS', label: '图标库', title: '图标库', desc: 'icon: 语法、使用方式与常用内置图标一览。' },
  { id: 'ai', no: '05 · AI', label: 'AI 助手', title: 'AI 助手', desc: '润色、关键词分析、要点成段，以及 API KEY 的获取与配置。' },
] as const;

type TabId = (typeof TABS)[number]['id'];

/** 跨文档跳转路径 → 抽屉 Tab */
const PATH_TO_TAB: Record<string, TabId> = {
  '/docs/guide': 'guide',
  '/docs/markdown': 'markdown',
  '/docs/theme': 'theme',
  '/docs/icons': 'icons',
  '/docs/ai': 'ai',
};

/**
 * 编辑器右侧文档抽屉：从屏幕右缘滑出，按 Tab 呈现五份子文档，
 * 正文组件与文档子页面共用（DocsSubPages 中的 *Content）。
 * 文档间的跳转链接在抽屉内表现为切换 Tab，而非路由跳转。
 */
export function DocsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<TabId>('guide');
  const scrollRef = useRef<HTMLDivElement>(null);
  // 统一关闭流程：滑出动画结束后再卸载（抽屉为滑入面板，采用对称滑出）
  const { closing, close } = useModalClose(open, onClose);

  // 打开时锁定 body 滚动，Esc 关闭
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, close]);

  // 切换 Tab 回到滚动顶部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  if (!open) return null;

  const meta = TABS.find((t) => t.id === tab)!;

  const handleNav = (to: string) => {
    const next = PATH_TO_TAB[to];
    if (next) setTab(next);
  };

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="使用文档">
      <style>{`
        @keyframes docsDrawerIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .docs-drawer-panel { animation: docsDrawerIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes docsDrawerOut {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        .docs-drawer-out { animation: docsDrawerOut 0.2s ease-in both; }
        @keyframes docsTabIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        .docs-drawer-tabpane { animation: docsTabIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .docs-drawer-panel, .docs-drawer-out, .docs-drawer-tabpane { animation: none; }
        }
      `}</style>

      {/* 点击遮罩关闭 */}
      <button
        type="button"
        aria-label="关闭文档"
        onClick={close}
        className={`absolute inset-0 w-full h-full bg-gray-900/20 cursor-default ${closing ? 'modal-backdrop-out' : ''}`}
      />

      {/* 右侧文档面板：与屏幕边缘留出间距的浮动圆角卡片 */}
      <aside className={`${closing ? 'docs-drawer-out' : 'docs-drawer-panel'} absolute top-4 right-4 bottom-4 w-[min(560px,calc(100vw-2rem))] bg-white border border-gray-200 rounded-2xl shadow-[0_24px_70px_rgba(17,24,39,0.22)] flex flex-col overflow-hidden`}>
        {/* 面板顶栏：mono 标签 + 标题 + 关闭按钮 */}
        <div className="shrink-0 flex items-center justify-between px-5 h-12 border-b border-gray-200">
          <div className="flex items-baseline gap-2.5 min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-600">
              &lt; DOCS /&gt;
            </span>
            <h2 className="text-[14px] font-semibold text-gray-900">使用文档</h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="关闭"
            className="w-7 h-7 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* 子文档 Tab：与文档站点的五份子文档一一对应 */}
        <div className="shrink-0 px-5 pt-3 pb-2.5 border-b border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? 'true' : undefined}
                className={`px-2.5 py-1 rounded-full text-[12px] border transition-colors ${
                  tab === t.id
                    ? 'bg-primary-50 border-primary-200 text-primary-700 font-medium'
                    : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 文档正文：抽屉容器内滚动，切换 Tab 时重放入场动画并回到顶部 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
          <div key={tab} className="docs-drawer-tabpane">
            {/* 紧凑页头 */}
            <header className="mb-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-600 mb-1.5">
                {meta.no}
              </p>
              <h3 className="text-lg font-bold tracking-tight text-gray-900">{meta.title}</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed mt-1.5">{meta.desc}</p>
            </header>

            <DrawerNavContext.Provider value={handleNav}>
              {tab === 'guide' && <GuideContent />}
              {tab === 'markdown' && <MarkdownDocContent />}
              {tab === 'theme' && <ThemeDocContent />}
              {tab === 'icons' && <IconsDocContent />}
              {tab === 'ai' && <AIDocContent />}
            </DrawerNavContext.Provider>
          </div>
        </div>

        {/* 面板底栏：跳转完整文档站点 */}
        <div className="shrink-0 flex items-center justify-between px-5 py-2.5 border-t border-gray-100">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-300">
            ZENSHEET DOCS
          </span>
          <Link
            to="/docs"
            onClick={onClose}
            className="text-[12px] font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            查看完整文档 →
          </Link>
        </div>
      </aside>
    </div>,
    document.body
  );
}
