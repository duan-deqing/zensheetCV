import { Link } from 'react-router-dom';
import { useTr, type Bi } from '@/i18n/LangContext';

const AUTHOR_URL = 'https://duan-deqing.github.io/';

/** 相关资源外链 */
const RESOURCES: { label: Bi; href: string }[] = [
  { label: { zh: 'Markdown 中文教程', en: 'Markdown Tutorial (Chinese)' }, href: 'https://markdown.com.cn' },
  { label: { zh: 'OpenAI', en: 'OpenAI' }, href: 'https://openai.com' },
  { label: { zh: 'DeepSeek', en: 'DeepSeek' }, href: 'https://deepseek.com' },
  { label: { zh: 'Qwen（通义千问）', en: 'Qwen' }, href: 'https://qwen.ai/home' },
  { label: { zh: 'GLM（智谱开放平台）', en: 'GLM (Zhipu Open Platform)' }, href: 'https://bigmodel.cn' },
  { label: { zh: 'Xiaomi MiMo', en: 'Xiaomi MiMo' }, href: 'https://mimo.mi.com/' },
];

/** 文档站内导航 */
const DOC_LINKS: { label: Bi; to: string }[] = [
  { label: { zh: '文档主页', en: 'Docs Home' }, to: '/docs' },
  { label: { zh: 'Markdown 简历教程', en: 'Markdown Resume Tutorial' }, to: '/docs/markdown' },
  { label: { zh: '更新日志', en: 'Changelog' }, to: '/docs/changelog' },
];

/** 三栏页脚：相关资源 / 文档 / 联系 + QQ 群二维码。
 *  dark 为文档页深色变体，缺省浅色（首页） */
export function DocsFooter({ dark = false }: { dark?: boolean }) {
  const tr = useTr();
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
            {tr({ zh: '相关资源', en: 'Resources' })}
          </p>
          <ul className="flex flex-col gap-2.5">
            {RESOURCES.map((r) => (
              <li key={r.href}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[13px] transition-colors ${tone.link}`}
                >
                  {tr(r.label)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 文档 */}
        <div>
          <p className={`font-mono text-sm font-bold tracking-[0.18em] ${tone.title} mb-4`}>
            {tr({ zh: '文档', en: 'Docs' })}
          </p>
          <ul className="flex flex-col gap-2.5">
            {DOC_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`text-[13px] transition-colors ${tone.link}`}
                >
                  {tr(l.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 联系 */}
        <div>
          <p className={`font-mono text-sm font-bold tracking-[0.18em] ${tone.title} mb-4`}>
            {tr({ zh: '联系', en: 'Contact' })}
          </p>
          <a
            href={AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[13px] transition-colors ${tone.link}`}
          >
            {tr({ zh: 'STYLAN —— 作者主页', en: "STYLAN — Author's homepage" })}
          </a>
          <p className={`text-[13px] ${tone.muted} mt-3 leading-relaxed`}>
            {tr({ zh: 'ZENSHEET · 简历 —— 静下心来，写好一份简历。', en: 'ZENSHEET · Resume — Slow down and craft a great resume.' })}
          </p>
          {/* QQ 群入口：整体左对齐，块内图与文字同轴居中 */}
          <div className="mt-5 flex">
            <div className="flex flex-col items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}QR-Code.png`}
              alt={tr({ zh: 'QQ群二维码', en: 'QQ group QR code' })}
              className={`w-24 rounded-xl border-[3px] ${tone.qrBorder} bg-white p-0.5`}
              loading="lazy"
            />
            <p className={`text-[13px] leading-none ${tone.qrLabel}`}>{tr({ zh: 'QQ群', en: 'QQ Group' })}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={`border-t ${tone.divider}`}>
        {/* 底栏：品牌 + 署名（沿用原首页页脚内容） */}
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className={`font-mono text-sm tracking-[0.18em] ${tone.brand}`}>
            ZENSHEET{tr({ zh: ' · 简历', en: ' · Resume' })}
          </p>
          <p className={`text-sm ${tone.credit}`}>
            {tr({ zh: '由', en: 'Built by' })}{' '}
            <a
              href={AUTHOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-medium underline decoration-1 underline-offset-4 transition-colors ${tone.creditLink}`}
            >
              STYLAN
            </a>{' '}
            {tr({ zh: '& GLM-5.3-flash 打造', en: '& GLM-5.3-flash' })}
          </p>
        </div>
      </div>
    </footer>
  );
}
