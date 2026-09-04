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

/** 三栏页脚：相关资源 / 文档 / 联系 + QQ 群二维码。
 *  dark 为文档页深色变体，缺省浅色（首页） */
export function DocsFooter({ dark = false }: { dark?: boolean }) {
  const tone = {
    footer: dark ? 'border-zinc-800 bg-zinc-950' : 'border-gray-100 bg-gray-50/60',
    title: dark ? 'text-white' : 'text-gray-400',
    link: dark ? 'text-zinc-400 hover:text-primary-400' : 'text-gray-500 hover:text-primary-600',
    muted: dark ? 'text-zinc-500' : 'text-gray-400',
    divider: dark ? 'border-zinc-800' : 'border-gray-100',
    brand: dark ? 'text-white' : 'text-gray-400',
    credit: dark ? 'text-zinc-400' : 'text-gray-500',
    creditLink: dark
      ? 'text-primary-400 decoration-primary-700 hover:text-primary-300 hover:decoration-primary-400'
      : 'text-primary-600 decoration-primary-300 hover:text-primary-700 hover:decoration-primary-600',
    qrBorder: dark ? 'border-zinc-700' : 'border-gray-200',
    qrLabel: dark ? 'text-zinc-400' : 'text-gray-500',
  };
  return (
    <footer className={`border-t ${tone.footer}`}>
      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* 相关资源 */}
        <div>
          <p className={`font-mono text-sm font-bold tracking-[0.18em] ${tone.title} mb-4`}>
            相关资源
          </p>
          <ul className="flex flex-col gap-2.5">
            {RESOURCES.map((r) => (
              <li key={r.label}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[13px] transition-colors ${tone.link}`}
                >
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 文档 */}
        <div>
          <p className={`font-mono text-sm font-bold tracking-[0.18em] ${tone.title} mb-4`}>
            文档
          </p>
          <ul className="flex flex-col gap-2.5">
            {DOC_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`text-[13px] transition-colors ${tone.link}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 联系 */}
        <div>
          <p className={`font-mono text-sm font-bold tracking-[0.18em] ${tone.title} mb-4`}>
            联系
          </p>
          <a
            href={AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[13px] transition-colors ${tone.link}`}
          >
            STYLAN —— 作者主页
          </a>
          <p className={`text-[13px] ${tone.muted} mt-3 leading-relaxed`}>
            ZENSHEET · 简历 —— 静下心来，写好一份简历。
          </p>
          {/* QQ 群入口：整体左对齐，块内图与文字同轴居中 */}
          <div className="mt-5 flex">
            <div className="flex flex-col items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}QR-Code.png`}
              alt="QQ群二维码"
              className={`w-24 rounded-xl border-[3px] ${tone.qrBorder} bg-white p-0.5`}
              loading="lazy"
            />
            <p className={`text-[13px] leading-none ${tone.qrLabel}`}>QQ群</p>
            </div>
          </div>
        </div>
      </div>
      <div className={`border-t ${tone.divider}`}>
        {/* 底栏：品牌 + 署名（沿用原首页页脚内容） */}
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className={`font-mono text-sm tracking-[0.18em] ${tone.brand}`}>
            ZENSHEET · 简历
          </p>
          <p className={`text-sm ${tone.credit}`}>
            在线 Markdown 简历编辑器 · 模板 · AI · PDF · 由{' '}
            <a
              href={AUTHOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-medium underline decoration-1 underline-offset-4 transition-colors ${tone.creditLink}`}
            >
              STYLAN
            </a>{' '}
            &amp; GLM-5.3-flash 打造
          </p>
        </div>
      </div>
    </footer>
  );
}
