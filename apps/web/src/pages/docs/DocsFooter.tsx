import { Link } from 'react-router-dom';

const AUTHOR_URL = 'https://duan-deqing.github.io/';

/** 相关资源外链 */
const RESOURCES: { label: string; href: string }[] = [
  { label: 'Markdown 中文教程', href: 'https://markdown.com.cn' },
  { label: 'OpenAI', href: 'https://openai.com' },
  { label: 'DeepSeek', href: 'https://deepseek.com' },
  { label: 'Qwen（通义千问）', href: 'https://qwen.ai/home' },
  { label: 'GLM（智谱开放平台）', href: 'https://bigmodel.cn' },
  { label: 'Xiaomi MiMo', href: 'https://mimo.mi.com/' },
];

/** 文档站内导航 */
const DOC_LINKS: { label: string; to: string }[] = [
  { label: '文档主页', to: '/docs' },
  { label: 'Markdown 简历教程', to: '/docs/markdown' },
  { label: '更新日志', to: '/docs/changelog' },
];

/** 文档页面页脚：相关资源 / 文档 / 联系 三栏 */
export function DocsFooter() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* 相关资源 */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-4">
            相关资源
          </p>
          <ul className="flex flex-col gap-2.5">
            {RESOURCES.map((r) => (
              <li key={r.label}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 文档 */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-4">
            文档
          </p>
          <ul className="flex flex-col gap-2.5">
            {DOC_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-[13px] text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 联系 */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-4">
            联系
          </p>
          <a
            href={AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-gray-500 hover:text-primary-600 transition-colors"
          >
            STYLAN —— 作者主页
          </a>
          <p className="text-[13px] text-gray-400 mt-3 leading-relaxed">
            ZENSHEET · 简历 —— 静下心来，写好一份简历。
          </p>
        </div>
      </div>
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-gray-400">
          ZENSHEET · 简历 · 在线 Markdown 简历编辑器 · 模板 · AI · PDF
        </div>
      </div>
    </footer>
  );
}
