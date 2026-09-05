import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DocsFooter } from './DocsFooter';
import { useTr, type Bi } from '@/i18n/LangContext';

/** 文档子页面导航结构 */
export const DOCS_NAV: { to: string; label: Bi; no: string }[] = [
  { to: '/docs', label: { zh: '文档主页', en: 'Docs Home' }, no: '' },
  { to: '/docs/guide', label: { zh: '使用指南', en: 'User Guide' }, no: '01' },
  { to: '/docs/markdown', label: { zh: 'Markdown 简历教程', en: 'Markdown Resume Tutorial' }, no: '02' },
  { to: '/docs/theme', label: { zh: '主题配置', en: 'Theme Settings' }, no: '03' },
  { to: '/docs/icons', label: { zh: '图标库', en: 'Icon Library' }, no: '04' },
  { to: '/docs/ai', label: { zh: 'AI 助手', en: 'AI Assistant' }, no: '05' },
  { to: '/docs/changelog', label: { zh: '更新日志', en: 'Changelog' }, no: '' },
];

/** 文档子页面布局：右侧目录导航 + 底部页脚（与 DocsPage 同风格的入场动画） */
export function DocsLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const tr = useTr();

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
      {/* 页头 */}
      <header className="max-w-7xl mx-auto w-full px-6 pt-14 pb-10">
        <p className="docs-enter font-mono text-xs uppercase tracking-[0.22em] text-primary-600 mb-4">
          &lt; DOCS /&gt;
        </p>
        <h1 className="docs-enter docs-enter-1 text-3xl md:text-4xl font-bold tracking-tight">
          {tr({ zh: '使用文档', en: 'Documentation' })}
        </h1>
        <p className="docs-enter docs-enter-2 text-gray-600 mt-3 max-w-[36em] leading-relaxed">
          {tr({
            zh: '从创建简历到导出 PDF 的完整指南。右侧目录可在各子文档间切换。',
            en: 'A complete guide from creating a resume to exporting a PDF. Use the table of contents on the right to switch between sections.',
          })}
        </p>
      </header>

      {/* 主体：左内容 + 右目录 */}
      <div className="max-w-7xl mx-auto w-full px-6 pb-20 flex gap-10 items-start flex-1">
        <main className="docs-enter docs-enter-2 flex-1 min-w-0">{children}</main>

        <nav className="docs-enter docs-enter-3 hidden lg:block w-48 shrink-0 sticky top-24" aria-label={tr({ zh: '文档目录', en: 'Documentation contents' })}>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2 px-3">
            {tr({ zh: '目录', en: 'Contents' })}
          </p>
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
                    {tr(item.label)}
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
