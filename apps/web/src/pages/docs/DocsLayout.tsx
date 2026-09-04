import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DocsFooter } from './DocsFooter';

/** 文档子页面导航结构 */
export const DOCS_NAV = [
  { to: '/docs', label: '文档主页', no: '' },
  { to: '/docs/guide', label: '使用指南', no: '01' },
  { to: '/docs/markdown', label: 'Markdown 简历教程', no: '02' },
  { to: '/docs/theme', label: '主题配置', no: '03' },
  { to: '/docs/icons', label: '图标库', no: '04' },
  { to: '/docs/ai', label: 'AI 助手', no: '05' },
  { to: '/docs/changelog', label: '更新日志', no: '' },
] as const;

/** 文档子页面布局：右侧目录导航 + 底部页脚（与 DocsPage 同风格的入场动画） */
export function DocsLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  // 路由切换回到页首
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // 内容块滚动入场（标记了 data-docs-reveal 的元素，进入视口时 fade-up，仅首次）
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-docs-reveal]'));
    els.forEach((el) => el.classList.add('docs-reveal'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('docs-reveal-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="bg-white text-gray-900 flex flex-col min-h-screen">
      <style>{`
        @keyframes docsFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }
        .docs-enter { animation: docsFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .docs-enter-1 { animation-delay: 0.06s; }
        .docs-enter-2 { animation-delay: 0.14s; }
        .docs-enter-3 { animation-delay: 0.22s; }
        .docs-reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .docs-reveal.docs-reveal-in { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          .docs-enter, .docs-reveal { animation: none; opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      {/* 页头 */}
      <header className="max-w-7xl mx-auto w-full px-6 pt-14 pb-10">
        <p className="docs-enter font-mono text-xs uppercase tracking-[0.22em] text-primary-600 mb-4">
          &lt; DOCS /&gt;
        </p>
        <h1 className="docs-enter docs-enter-1 text-3xl md:text-4xl font-bold tracking-tight">使用文档</h1>
        <p className="docs-enter docs-enter-2 text-gray-600 mt-3 max-w-[36em] leading-relaxed">
          从创建简历到导出 PDF 的完整指南。右侧目录可在各子文档间切换。
        </p>
      </header>

      {/* 主体：左内容 + 右目录 */}
      <div className="max-w-7xl mx-auto w-full px-6 pb-20 flex gap-10 items-start flex-1">
        <main className="docs-enter docs-enter-2 flex-1 min-w-0">{children}</main>

        <nav className="docs-enter docs-enter-3 hidden lg:block w-48 shrink-0 sticky top-24" aria-label="文档目录">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2 px-3">目录</p>
          <ul className="flex flex-col gap-0.5">
            {DOCS_NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] text-left transition-all duration-200 ${
                      active
                        ? 'bg-primary-50 text-primary-700 font-medium pl-4'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.no && (
                      <span className="font-mono text-[11px] tabular-nums opacity-70">{item.no}</span>
                    )}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <DocsFooter dark />
    </div>
  );
}

/** 子文档页头：章节编号 + 标题 + 描述 */
export function DocSectionHeader({
  no,
  title,
  desc,
}: {
  no: string;
  title: string;
  desc: string;
}) {
  return (
    <div data-docs-reveal className="mb-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary-600 mb-2">
        {no}
      </p>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-gray-600 mt-2 max-w-[40em] leading-relaxed">{desc}</p>
    </div>
  );
}

/** 内容小节：子标题 + 描述 + 内容 */
export function DocBlock({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section data-docs-reveal className="mb-12">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {desc && <p className="text-[13px] text-gray-500 leading-relaxed mb-4 max-w-[44em]">{desc}</p>}
      {children}
    </section>
  );
}
