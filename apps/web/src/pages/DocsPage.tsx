import { useEffect, useState } from 'react';
import { DocsContent, SECTIONS } from '@/components/DocsContent';

export function DocsPage() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  // 滚动时高亮当前章节（取视口上方最近的章节）
  useEffect(() => {
    const onScroll = () => {
      let current: string = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 140) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-white text-gray-900">
      {/* 页头 */}
      <header className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary-600 mb-4">
          &lt; DOCS /&gt;
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">使用文档</h1>
        <p className="text-gray-600 mt-3 max-w-[36em] leading-relaxed">
          从注册到导出 PDF 的完整指南。右侧目录可快速跳转到对应章节。
        </p>
      </header>

      {/* 主体：左内容 + 右目录 */}
      <div className="max-w-7xl mx-auto px-6 pb-20 flex gap-10 items-start">
        {/* 左侧内容 */}
        <main className="flex-1 min-w-0">
          <DocsContent />
        </main>

        {/* 右侧章节目录 */}
        <nav
          className="hidden lg:block w-44 shrink-0 sticky top-24"
          aria-label="文档目录"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2 px-3">
            目录
          </p>
          <ul className="flex flex-col gap-0.5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => jump(s.id)}
                  aria-current={active === s.id ? 'true' : undefined}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] text-left transition-colors ${
                    active === s.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-mono text-[11px] tabular-nums opacity-70">{s.no}</span>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
