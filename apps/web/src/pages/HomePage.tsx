import { Link } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import { lazy, Suspense, type CSSProperties } from 'react';
import { getTemplateById, getTemplateCss } from '@/templates';
import { RESUME_ICON_TAG, getIconMap, remarkResumeIcons } from '@/preview/resumeIcons';
import {
  CONTENT_PADDING_MM,
  fontScale,
  MARGIN_MM,
  rehypeWrapH2Text,
  spacingScale,
  resumeColsCss,
  resumeFontSizeCss,
  resumeIconsCss,
} from '@/preview/previewShared';
import { defaultTheme } from '@stylan/shared-types';
import { sampleMarkdown } from '@/sampleResume';
import { normalizeColMarkers, remarkResumeCols } from '@/preview/remarkResumeCols';
import { DocsFooter } from '@/pages/docs/DocsFooter';
import { useLang, useTr } from '@/i18n/LangContext';
import ShapeGrid from '@/pages/home/ShapeGrid';
import {
  AI_CAPABILITIES,
  AI_CHAT_FEATURES,
  AI_PROVIDERS,
  DOC_CARDS,
  HOME_ICONS,
  SPECS,
  STEPS,
  TEMPLATE_SHOWCASE,
  THEME_FEATURES,
  WORKSPACE_FEATURES,
} from './home/content';

/* 工作台展示：编辑器页面真实三窗口（编辑器/预览/AI 聊天窗），懒加载避免 CodeMirror 进入首屏 */
const WorkspaceShowcase = lazy(() =>
  import('./home/WorkspaceShowcase').then((m) => ({ default: m.WorkspaceShowcase })),
);

/* Hero 右侧与模板展示区渲染的是项目真实的 Markdown 渲染管线
   （react-markdown + 各模板真实 CSS），非静态截图，内容见 @/sampleResume */

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
  // 按界面语言选择示例简历内容（中/英文版同人设同结构）
  const { lang } = useLang();
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
      <style>{resumeColsCss(`.rp-${templateId}`)}</style>
      <style>{resumeFontSizeCss(`.rp-${templateId}`)}</style>
      <div
        className={`rp-${templateId}`}
        style={
          {
            '--resume-primary': theme.primaryColor,
            fontFamily: theme.fontFamily,
            '--resume-fs': fontScale(theme),
            '--resume-sp': spacingScale(theme),
          } as CSSProperties
        }
      >
        <div style={{ padding: `${padYMM}mm ${padXMM}mm` }}>
          <ReactMarkdown
            remarkPlugins={[remarkResumeCols, remarkResumeIcons(iconMap)]}
            rehypePlugins={[rehypeWrapH2Text]}
            components={components}
          >
            {normalizeColMarkers(sampleMarkdown(lang))}
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

export function HomePage() {
  const tr = useTr();
  return (
    // -mt-20：抵消 Navbar 的全局 h-20 占位，让 Hero 从视口顶部开始严格占满一屏
    <div className="bg-white text-gray-900 -mt-20">
      {/* Hero：严格一屏（h 锁定 100dvh，随视口自动伸缩；极矮视口 560px 兜底改页面滚动），
          文案区在上 + 全宽可操作三窗口工作台（flex-1 吃掉剩余高度）。
          背景：ShapeGrid 网格动效（canvas，absolute 铺满，hover 高亮 + 拖尾），
          置于 DOM 首位，内容自然绘制其上 */}
      <section className="relative h-[100dvh] min-h-[560px] flex flex-col overflow-hidden">
        <ShapeGrid
          className="absolute inset-0"
          speed={0.3}
          squareSize={40}
          direction="diagonal"
          borderColor="#e5e7eb"
          hoverFillColor="#dbeafe"
          shape="square"
          hoverTrailAmount={5}
        />
        <div className="w-full max-w-7xl mx-auto px-6 pt-24 lg:pt-28 text-center">
          <p className="fade-up font-mono text-xs tracking-[0.18em] text-primary-600 mb-5">
            &lt; ZENSHEET{tr({ zh: ' · 简历', en: ' · Resume' })} /&gt;
          </p>
          <h1
            className="fade-up text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] mb-5"
            style={{ animationDelay: '0.08s' }}
          >
            {tr({ zh: '用', en: 'Write a great resume in' })}
            <span className="text-primary-600"> Markdown</span>
            {tr({ zh: '写一份好简历', en: '' })}
          </h1>
          <p
            className="fade-up text-lg text-gray-600 leading-relaxed max-w-[36em] mx-auto"
            style={{ animationDelay: '0.16s' }}
          >
            {tr({
              zh: '无需注册登录，打开即用；简历数据保存在你自己的浏览器里。内置多套模板实时预览，图标与照片自由排版，AI 润色与关键词优化，一键导出高质量 PDF。',
              en: 'No sign-in required, ready to use; your resume data stays in your own browser. Multiple built-in templates with live preview, free icon and photo layout, AI polishing and keyword optimization, one-click export to high-quality PDF.',
            })}
          </p>
          {/* 进入编辑器按钮：文案下方、三窗口上方，胶囊造型 */}
          <div
            className="fade-up flex justify-center pt-5"
            style={{ animationDelay: '0.24s' }}
          >
            <Link
              to="/editor"
              className="btn-primary rounded-full text-base px-8 py-2.5 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 hover:-translate-y-0.5"
            >
              {tr({ zh: '进入编辑器', en: 'Open Editor' })}
            </Link>
          </div>
        </div>

        {/* 可操作的三窗口工作台（编辑器/预览/AI 聊天窗）：全宽展示，flex-1 吃掉 Hero 剩余
            高度（父级 h 已锁定，百分比链有效）；<1024px 堆叠由 WorkspaceShowcase 断点接管 */}
        <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-6 pt-6 pb-6">
          <div className="h-full">
            <Suspense fallback={<div className="h-full rounded-2xl bg-gray-50 border border-gray-200 animate-pulse" />}>
              <WorkspaceShowcase />
            </Suspense>
          </div>
        </div>

        {/* 规格条：Hero 底部通栏收尾（shrink-0，数字指标紧凑化） */}
        <div className="shrink-0 w-full border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
            {SPECS.map((s, i) => (
              <div
                key={s.unit}
                className={`py-4 px-4 text-left ${i > 0 ? 'md:border-l md:border-gray-200' : ''} ${
                  i % 2 === 1 ? 'border-l border-gray-200 md:border-l' : ''
                }`}
              >
                <p className="font-mono text-2xl md:text-3xl font-semibold tabular-nums text-gray-900">
                  {s.value}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-600 mt-0.5">
                  {s.unit}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{tr(s.label)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 三步成稿 */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-gray-400 mb-3">
          {tr({ zh: '▰ 三步成稿 ▰', en: '▰ Three Steps ▰' })}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-12">
          {tr({ zh: '从初稿到投递，只做三件事', en: 'From first draft to application, in three steps' })}
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
              <h3 className="text-lg font-semibold mt-2 mb-2">{tr(step.title)}</h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-[30em]">{tr(step.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 编辑器工作台：特性一行 + 三栏工作台示意独占一行 */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-gray-400 mb-3">
          {tr({ zh: '▰ 工作台 ▰', en: '▰ Workspace ▰' })}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-10">
          {tr({ zh: '一个页面，完成从写作到投递', en: 'One page, from writing to applying' })}
        </h2>

        {/* 特性列表：一行四项（三窗口实景演示见首屏 Hero） */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-6">
          {WORKSPACE_FEATURES.map((f) => (
            <div key={f.title.zh}>
              <h3 className="font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                {tr(f.title)}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mt-1 pl-3.5">{tr(f.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 模板展示：不对称网格，8 套模板全部真实渲染 */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          {tr({ zh: '多套模板，同一份内容', en: 'Many templates, one source of content' })}
        </h2>
        <p className="text-gray-600 mb-10">
          {tr({ zh: '换模板不用改一个字。以下全部为编辑器内的真实渲染效果。', en: 'Switch templates without changing a word. Everything below is rendered live by the editor.' })}
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
                  <h3 className="font-semibold">{tr(t.name)}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{tr(t.desc)}</p>
                </div>
                {/* 彩色胶囊标签：取模板默认主色着色 */}
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border shrink-0"
                  style={{
                    color: getTemplateById(t.id).defaultTheme.primaryColor,
                    borderColor: `color-mix(in srgb, ${getTemplateById(t.id).defaultTheme.primaryColor} 35%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${getTemplateById(t.id).defaultTheme.primaryColor} 10%, transparent)`,
                  }}
                >
                  {t.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 主题与排版：主题面板特性 + 真实图标渲染 */}
      <section className="border-y border-gray-200 bg-gray-50/60">
        <style>{resumeIconsCss('.home-icons')}</style>
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-gray-400 mb-3">
              {tr({ zh: '▰ 主题与排版 ▰', en: '▰ Theme & Typography ▰' })}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              {tr({ zh: '细节可调，风格自定', en: 'Adjustable details, your own style' })}
            </h2>
            <p className="text-gray-600 mb-8 max-w-[30em]">
              {tr({ zh: '悬浮主题面板不遮挡内容，所有改动实时生效，导出 PDF 与预览严格一致。', en: 'The floating theme panel never covers your content; every change applies in real time, and the exported PDF matches the preview exactly.' })}
            </p>
            <div className="divide-y divide-gray-100">
              {THEME_FEATURES.map((f) => (
                <div key={f.title.zh} className="py-3.5 first:pt-0 last:pb-0">
                  <h3 className="font-semibold text-[15px]">{tr(f.title)}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{tr(f.desc)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* 主题面板示意：主色圆点 + 档位条 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" aria-hidden="true">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">
                THEME PANEL
              </p>
              <div className="flex items-center gap-2.5 mb-4">
                {['#1a1a1a', '#2563eb', '#9f1239', '#166534', '#b45309', '#4338ca'].map((c) => (
                  <span
                    key={c}
                    className="w-7 h-7 rounded-full border-2 border-white shadow ring-1 ring-gray-200"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              {[
                { label: { zh: '字号', en: 'Font size' }, value: { zh: '14 px', en: '14 px' } },
                { label: { zh: '行距', en: 'Line height' }, value: { zh: '1.6 倍', en: '1.6×' } },
                { label: { zh: '页边距', en: 'Margins' }, value: { zh: '常规', en: 'Normal' } },
              ].map((row) => (
                <div key={row.label.zh} className="flex items-center justify-between mb-3 last:mb-0">
                  <span className="text-xs text-gray-500">{tr(row.label)}</span>
                  <span className="flex items-center gap-6 rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-700">
                    {tr(row.value)}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3 text-gray-400"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </div>
              ))}
            </div>

            {/* 图标库示意：真实渲染的内置图标 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-baseline justify-between mb-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
                  ICON LIBRARY
                </p>
                <code className="font-mono text-[11px] text-primary-600">icon:github</code>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {HOME_ICONS.map((name) => {
                  const svg = getIconMap()[name];
                  if (!svg) return null;
                  return (
                    <div
                      key={name}
                      className="rounded-xl border border-gray-100 py-3 flex flex-col items-center gap-1.5"
                    >
                      <span
                        className="home-icons resume-icon w-5 h-5 text-gray-700 [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: svg }}
                      />
                      <span className="font-mono text-[10px] text-gray-400">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI 能力：全页唯一的深色区块 */}
      <section className="bg-zinc-950 text-zinc-50">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              {tr({ zh: '卡在措辞上的时候，交给 AI', en: 'When the words get stuck, hand it to AI' })}
            </h2>
            <p className="text-zinc-400 mb-8 max-w-[30em]">
              {tr({ zh: '不替你编造经历，只把你做过的事，写到招聘方看得懂、愿意看。', en: 'It never invents experience — it rewrites what you have done into words recruiters understand and want to read.' })}
            </p>
            <ul className="flex flex-col gap-2.5 mb-8">
              {AI_CHAT_FEATURES.map((f) => (
                <li key={f.zh} className="flex items-start gap-2.5 text-sm text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0 mt-[7px]" />
                  {tr(f)}
                </li>
              ))}
            </ul>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2.5">
                SUPPORTED PROVIDERS
              </p>
              <div className="flex flex-wrap gap-2">
                {AI_PROVIDERS.map((p) => (
                  <span
                    key={p.en}
                    className="text-xs text-zinc-300 border border-zinc-700 rounded-full px-3 py-1"
                  >
                    {tr(p)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="divide-y divide-zinc-800">
            {AI_CAPABILITIES.map((c) => (
              <div key={c.no} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                <p className="font-mono text-sm text-primary-400 tabular-nums shrink-0 pt-0.5">
                  {c.no}
                </p>
                <div>
                  <h3 className="font-semibold">{tr(c.title)}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{tr(c.desc)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 文档导航：与编辑器内文档抽屉同一套内容（页脚自带 border-t，此处不再加底线） */}
      <section className="bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-gray-400 mb-3">
                {tr({ zh: '▰ 文档 ▰', en: '▰ Docs ▰' })}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {tr({ zh: '边写边学，文档就在手边', en: 'Learn as you write — docs at hand' })}
              </h2>
            </div>
            <Link
              to="/docs"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              {tr({ zh: '进入文档中心 →', en: 'Open Docs Center →' })}
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOC_CARDS.map((d) => (
              <Link
                key={d.to}
                to={d.to}
                className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
                  {d.no}
                </p>
                <p className="font-semibold mt-1.5 group-hover:text-primary-700 transition-colors">
                  {tr(d.title)} →
                </p>
                <p className="text-sm text-gray-500 mt-1">{tr(d.desc)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer：与文档页同一套三栏页脚（相关资源 / 文档 / 联系 + QQ 群二维码） */}
      <DocsFooter />
    </div>
  );
}
