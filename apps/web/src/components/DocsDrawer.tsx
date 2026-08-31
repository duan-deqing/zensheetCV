import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DocsContent, SECTIONS } from '@/components/DocsContent';

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

/**
 * 编辑器右侧文档抽屉：从屏幕右缘滑出，正文与文档页共用 DocsContent。
 * 目录以横向胶囊形式置顶，滚动时高亮当前章节（基于抽屉容器自身滚动）。
 */
export function DocsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 打开时锁定 body 滚动，Esc 关闭
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  // 容器滚动时高亮当前章节（取容器视口上方最近的章节）
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      let current: string = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const target = el.querySelector(`#${s.id}`);
        if (target && target.getBoundingClientRect().top <= el.getBoundingClientRect().top + 24) {
          current = s.id;
        }
      }
      setActive(current);
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [open]);

  if (!open) return null;

  const jump = (id: string) => {
    scrollRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="使用文档">
      <style>{`
        @keyframes docsDrawerIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .docs-drawer-panel { animation: docsDrawerIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .docs-drawer-panel { animation: none; }
        }
      `}</style>

      {/* 点击遮罩关闭 */}
      <button
        type="button"
        aria-label="关闭文档"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-gray-900/20 cursor-default"
      />

      {/* 右侧文档面板：与屏幕边缘留出间距的浮动圆角卡片 */}
      <aside className="docs-drawer-panel absolute top-4 right-4 bottom-4 w-[min(480px,calc(100vw-2rem))] bg-white border border-gray-200 rounded-2xl shadow-[0_24px_70px_rgba(17,24,39,0.22)] flex flex-col overflow-hidden">
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
            onClick={onClose}
            aria-label="关闭"
            className="w-7 h-7 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* 章节胶囊目录：横向换行排布，点击平滑跳转 */}
        <div className="shrink-0 px-5 pt-3 pb-2 border-b border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => jump(s.id)}
                aria-current={active === s.id ? 'true' : undefined}
                className={`px-2.5 py-1 rounded-full text-[12px] border transition-colors ${
                  active === s.id
                    ? 'bg-primary-50 border-primary-200 text-primary-700 font-medium'
                    : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 文档正文：抽屉容器内滚动 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
          <DocsContent />
        </div>
      </aside>
    </div>,
    document.body
  );
}
