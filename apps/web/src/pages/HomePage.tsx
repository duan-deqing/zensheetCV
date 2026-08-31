import { Link } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import type { CSSProperties } from 'react';
import { useAuth } from '@/store/AuthContext';
import { getTemplateById, getTemplateCss } from '@/templates';
import { RESUME_ICON_TAG, getIconMap, remarkResumeIcons } from '@/preview/resumeIcons';
import {
  CONTENT_PADDING_MM,
  FONT_SCALE,
  MARGIN_MM,
  SPACING_SCALE,
  resumeIconsCss,
} from '@/preview/previewShared';
import { defaultTheme } from '@stylan/shared-types';

/* Hero 右侧与模板展示区渲染的是项目真实的 Markdown 渲染管线
   （react-markdown + 各模板真实 CSS），非静态截图 */
const SAMPLE_MARKDOWN = `# 林晚舟

icon:info 产品经理 · 5 年经验 · 上海

icon:phone 138-0000-0000 · icon:email lin@mail.com · icon:github linwanzhou

## 技能

\`Axure\` \`Figma\` \`SQL\` \`数据分析\` \`A/B 测试\`

## 工作经历

### 云帆科技 · 高级产品经理

2021.03 - 至今

- 主导协作平台从 0 到 1，两年内服务 1200+ 企业客户
- 建立需求评审与灰度发布流程，线上事故率下降 38%

### 星图网络 · 产品经理

2018.07 - 2021.02

- 负责内容分发中台，DAU 增长 2.4 倍
- 搭建数据看板，需求交付周期缩短至 9 天

## 教育背景

### 浙江大学 · 信息管理与信息系统

2014.09 - 2018.06`;

function MiniResume({
  templateId,
  className = '',
}: {
  templateId: string;
  className?: string;
}) {
  // 各模板 CSS 均以 .resume-preview 为作用域，替换前缀实现同页多模板互不干扰
  const scoped = getTemplateCss(templateId).replace(
    /\.resume-preview/g,
    `.rp-${templateId}`,
  );
  // 与编辑页/我的简历页一致：使用模板自带默认主题（主色/字体/字号/间距）
  const theme = getTemplateById(templateId).defaultTheme;
  // 每页四周总留白 = 页边距 + 内容边距，与分页预览/导出同一套默认值
  const padXMM =
    (MARGIN_MM[defaultTheme.marginX] ?? 0) + (CONTENT_PADDING_MM[defaultTheme.contentPadding] ?? 0);
  const padYMM =
    (MARGIN_MM[defaultTheme.marginY] ?? 0) + (CONTENT_PADDING_MM[defaultTheme.contentPadding] ?? 0);
  const iconMap = getIconMap();
  const components = {
    [RESUME_ICON_TAG]: ({ name }: { name?: string }) => {
      const svg = name ? iconMap[name] : undefined;
      if (!svg) return null;
      return <span className="resume-icon" dangerouslySetInnerHTML={{ __html: svg }} />;
    },
  } as Components; // 自定义元素名不在 JSX.IntrinsicElements 中，需断言
  return (
    <div className={className}>
      <style>{scoped}</style>
      <style>{resumeIconsCss(`.rp-${templateId}`)}</style>
      <div
        className={`rp-${templateId}`}
        style={
          {
            '--resume-primary': theme.primaryColor,
            fontFamily: theme.fontFamily,
            '--resume-fs': FONT_SCALE[theme.fontSize] ?? 1,
            '--resume-sp': SPACING_SCALE[theme.spacing] ?? 1,
          } as CSSProperties
        }
      >
        <div style={{ padding: `${padYMM}mm ${padXMM}mm` }}>
          <ReactMarkdown
            remarkPlugins={[remarkResumeIcons(iconMap)]}
            components={components}
          >
            {SAMPLE_MARKDOWN}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

/** 固定高度窗口 + 等比缩放，模拟 A4 纸预览 */
function ResumePaper({
  templateId,
  zoom = 0.42,
  className = '',
}: {
  templateId: string;
  zoom?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden bg-white ${className}`}>
      <div
        className="origin-top-left"
        style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }}
      >
        <MiniResume templateId={templateId} />
      </div>
    </div>
  );
}

/** 模板展示区数据：span 为 3 列网格中的占位格数（每行合计 3） */
const TEMPLATE_SHOWCASE = [
  { id: 'classic', tag: 'CLASSIC', name: '经典简洁', desc: '黑白正式，适合大多数求职场景', span: 2 },
  { id: 'modern', tag: 'MODERN', name: '现代蓝调', desc: '互联网与产品岗位首选', span: 1 },
  { id: 'elegant', tag: 'ELEGANT', name: '优雅酒红', desc: '咨询、金融与品牌岗位', span: 1 },
  { id: 'tech', tag: 'TECH', name: '科技墨绿', desc: '研发与技术岗位', span: 1 },
  { id: 'muji', tag: 'MUJI', name: '墨纸极简', desc: '深色题头，移植自 MujiCV 默认主题', span: 1 },
  { id: 'azure', tag: 'AZURE', name: '青线极简', desc: '主题色细线标题，素净克制', span: 1 },
  { id: 'sunrise', tag: 'SUNRISE', name: '朝阳暖橙', desc: '渐变题头，明快有活力', span: 1 },
  { id: 'carbon', tag: 'CARBON', name: '碳黑章标', desc: '灰底章节条 + 竖标，正式商务风', span: 1 },
] as const;

const SPECS = [
  { value: '08', unit: 'TEMPLATES', label: '内置模板' },
  { value: '03', unit: 'AI TOOLS', label: '润色 · 关键词 · 生成' },
  { value: 'A4', unit: 'PDF EXPORT', label: '服务端渲染导出' },
  { value: '00', unit: 'COST', label: '注册即可使用' },
];

const STEPS = [
  {
    no: '01',
    tag: 'WRITE',
    title: '用 Markdown 写内容',
    desc: '左侧书写，右侧实时预览。专注文字本身，排版交给模板。',
  },
  {
    no: '02',
    tag: 'REFINE',
    title: '让 AI 打磨表达',
    desc: '逐段润色工作经历，对照职位描述匹配关键词，补齐缺失亮点。',
  },
  {
    no: '03',
    tag: 'EXPORT',
    title: '一键导出 PDF',
    desc: '服务端渲染，字距与分页与预览一致，直接投递。',
  },
];

const AI_CAPABILITIES = [
  {
    no: '01',
    title: '经历润色',
    desc: '把「负责xx工作」改写成有结果、有数字的表述',
  },
  {
    no: '02',
    title: '关键词匹配',
    desc: '粘贴职位描述，找出简历中缺失的能力词',
  },
  {
    no: '03',
    title: '要点成段',
    desc: '输入几个要点，生成结构完整的项目描述',
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white text-gray-900">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up { animation: none; }
        }
      `}</style>

      {/* Hero：左文右真实简历预览 */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-16 lg:pt-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="fade-up font-mono text-xs uppercase tracking-[0.22em] text-primary-600 mb-5">
            &lt; STYLAN RESUME /&gt;
          </p>
          <h1
            className="fade-up text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] mb-5"
            style={{ animationDelay: '0.08s' }}
          >
            写好一份简历，
            <br />
            只需要<span className="text-primary-600"> Markdown</span>
          </h1>
          <p
            className="fade-up text-lg text-gray-600 leading-relaxed max-w-[32em] mb-8"
            style={{ animationDelay: '0.16s' }}
          >
            实时预览、多套模板、AI 润色与关键词优化，导出高质量 PDF。
          </p>
          <div
            className="fade-up flex flex-wrap items-center gap-3"
            style={{ animationDelay: '0.24s' }}
          >
            {isAuthenticated ? (
              <Link to="/editor" className="btn-primary text-base px-7 py-3">
                进入编辑器
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-7 py-3">
                  免费注册
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-7 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 active:scale-[0.98] transition-all"
                >
                  登录
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 真实渲染的两张模板卡，正面 / 导出 视角 */}
        <div className="relative h-[380px] hidden md:block" aria-hidden="true">
          <div className="fade-up absolute right-24 top-6 w-[300px] rotate-[3deg] rounded-xl border border-gray-200 shadow-[0_18px_50px_rgba(37,99,235,0.10)]">
            <ResumePaper templateId="modern" zoom={0.4} className="h-[320px] rounded-xl" />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 px-4 py-2 border-t border-gray-100">
              MARKDOWN / LIVE PREVIEW
            </p>
          </div>
          <div
            className="fade-up absolute right-4 top-16 w-[300px] -rotate-[2deg] rounded-xl border border-gray-200 shadow-[0_18px_50px_rgba(17,24,39,0.14)]"
            style={{ animationDelay: '0.12s' }}
          >
            <ResumePaper templateId="classic" zoom={0.4} className="h-[320px] rounded-xl" />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 px-4 py-2 border-t border-gray-100">
              PDF / SERVER RENDERED
            </p>
          </div>
        </div>
      </section>

      {/* 规格条 */}
      <section className="border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
          {SPECS.map((s, i) => (
            <div
              key={s.unit}
              className={`py-8 px-4 ${i > 0 ? 'md:border-l md:border-gray-200' : ''} ${
                i % 2 === 1 ? 'border-l border-gray-200 md:border-l' : ''
              }`}
            >
              <p className="font-mono text-3xl md:text-4xl font-semibold tabular-nums text-gray-900">
                {s.value}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-600 mt-1">
                {s.unit}
              </p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 三步成稿 */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-gray-400 mb-3">
          ▰ 三步成稿 ▰
        </p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-12">
          从初稿到投递，只做三件事
        </h2>
        <div className="grid md:grid-cols-3 gap-10 md:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.no} className={`md:px-8 ${i > 0 ? 'md:border-l md:border-gray-200' : ''} md:first:pl-0`}>
              <p className="font-mono text-5xl font-semibold text-primary-600/15 tabular-nums">
                {step.no}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-600 mt-2">
                {step.tag}
              </p>
              <h3 className="text-lg font-semibold mt-2 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-[30em]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 模板展示：不对称网格，8 套模板全部真实渲染 */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">八套模板，同一份内容</h2>
        <p className="text-gray-600 mb-10">
          换模板不用改一个字。以下全部为编辑器内的真实渲染效果。
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          {TEMPLATE_SHOWCASE.map((t) => (
            <div
              key={t.id}
              className={`${t.span === 2 ? 'md:col-span-2 ' : ''}card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
            >
              <ResumePaper templateId={t.id} zoom={0.5} className="h-[300px] border-b border-gray-100" />
              <div className="flex items-baseline justify-between px-5 py-4">
                <div>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{t.desc}</p>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">{t.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI 能力：全页唯一的深色区块 */}
      <section className="bg-zinc-950 text-zinc-50">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              卡在措辞上的时候，交给 AI
            </h2>
            <p className="text-zinc-400 mb-8 max-w-[30em]">
              不替你编造经历，只把你做过的事，写到招聘方看得懂、愿意看。
            </p>
          </div>
          <div className="divide-y divide-zinc-800">
            {AI_CAPABILITIES.map((c) => (
              <div key={c.no} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                <p className="font-mono text-sm text-primary-400 tabular-nums shrink-0 pt-0.5">
                  {c.no}
                </p>
                <div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-400">
            STYLAN RESUME
          </p>
          <p className="text-sm text-gray-500">Markdown 简历编辑器 · 模板 · AI · PDF</p>
        </div>
      </footer>
    </div>
  );
}
