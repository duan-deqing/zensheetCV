import { Link } from 'react-router-dom';
import { DocsLayout } from './docs/DocsLayout';
import { useTr, type Bi } from '@/i18n/LangContext';

/** 模板一览（与首页模板橱窗一致） */
const TEMPLATES: { id: string; tag: string; name: Bi; desc: Bi }[] = [
  { id: 'classic', tag: 'CLASSIC', name: { zh: '经典简洁', en: 'Classic' }, desc: { zh: '黑白正式，适合大多数求职场景', en: 'Formal black & white for most job hunting' } },
  { id: 'modern', tag: 'MODERN', name: { zh: '现代蓝调', en: 'Modern Blue' }, desc: { zh: '互联网与产品岗位首选', en: 'A favorite for tech & product roles' } },
  { id: 'elegant', tag: 'ELEGANT', name: { zh: '优雅酒红', en: 'Elegant Wine' }, desc: { zh: '咨询、金融与品牌岗位', en: 'For consulting, finance & branding roles' } },
  { id: 'tech', tag: 'TECH', name: { zh: '科技墨绿', en: 'Tech Green' }, desc: { zh: '研发与技术岗位', en: 'For engineering & technical roles' } },
  { id: 'muji', tag: 'MUJI', name: { zh: '墨纸极简', en: 'Ink & Paper' }, desc: { zh: '深色题头，沉稳耐看', en: 'Dark headers, calm and enduring' } },
  { id: 'azure', tag: 'AZURE', name: { zh: '青线极简', en: 'Azure Lines' }, desc: { zh: '细线标题，素净轻盈', en: 'Hairline titles, clean and light' } },
  { id: 'sunrise', tag: 'SUNRISE', name: { zh: '朝阳暖橙', en: 'Sunrise Glow' }, desc: { zh: '渐变题头，明快有活力', en: 'Gradient headers, bright and energetic' } },
  { id: 'carbon', tag: 'CARBON', name: { zh: '碳黑章标', en: 'Carbon' }, desc: { zh: '灰底章节条 + 竖标，正式商务风', en: 'Gray section bars + vertical marks, formal business' } },
];

const FEATURES: { title: Bi; desc: Bi }[] = [
  { title: { zh: 'Markdown 编辑', en: 'Markdown Editing' }, desc: { zh: '左侧书写、右侧 A4 逐页实时预览，支持分栏、图标等简历专用语法', en: 'Write on the left with live page-by-page A4 preview; columns, icons and other resume-specific syntax supported' } },
  { title: { zh: '8 套模板', en: '8 Templates' }, desc: { zh: '经典、现代、极简等风格，预览卡片一键切换，内容始终保留', en: 'Classic, modern, minimal and more — switch instantly from preview cards, content always preserved' } },
  { title: { zh: '主题微调', en: 'Theme Tuning' }, desc: { zh: '主色、字体、字号间距、页边距独立可调，与导出 PDF 严格一致', en: 'Color, font, size/spacing and margins adjust independently, matching the exported PDF exactly' } },
  { title: { zh: 'AI 助手', en: 'AI Assistant' }, desc: { zh: '润色全文、关键词分析、要点成段，支持自定义 OpenAI 兼容模型', en: 'Polish, keyword analysis and bullet expansion with any OpenAI-compatible model' } },
  { title: { zh: '照片与图标', en: 'Photos & Icons' }, desc: { zh: '证件照自由拖放缩放，19 个内置矢量图标随文字变色', en: 'Freely drag & scale ID photos; 19 built-in vector icons follow text color' } },
  { title: { zh: 'PDF 导出', en: 'PDF Export' }, desc: { zh: '支持打印的环境浏览器直出，所见即所得；微信等手机环境自动改为本机生成 PDF', en: 'Printed straight from your browser where supported; on WeChat and other mobile browsers the PDF is generated on-device' } },
];

const SUB_DOCS: { to: string; no: string; title: Bi; desc: Bi }[] = [
  { to: '/docs/guide', no: '01', title: { zh: '使用指南', en: 'Guide' }, desc: { zh: '从创建简历到导出 PDF 的基础流程，以及其余教程的索引', en: 'The basics from creating a resume to exporting PDF, plus an index of other tutorials' } },
  { to: '/docs/markdown', no: '02', title: { zh: 'Markdown 简历教程', en: 'Markdown Tutorial' }, desc: { zh: '标题、强调、列表、引用、分栏等语法示例与效果预览', en: 'Syntax examples and previews: headings, emphasis, lists, quotes, columns' } },
  { to: '/docs/theme', no: '03', title: { zh: '主题配置', en: 'Theme Settings' }, desc: { zh: '模板切换、视觉风格、页面布局的详细说明与注意事项', en: 'Templates, visual style and page layout explained, with notes' } },
  { to: '/docs/icons', no: '04', title: { zh: '图标库', en: 'Icon Library' }, desc: { zh: 'icon: 语法、图标库使用方式与全部内置图标一览', en: 'The icon: syntax, library usage and all built-in icons' } },
  { to: '/docs/ai', no: '05', title: { zh: 'AI 助手', en: 'AI Assistant' }, desc: { zh: '聊天窗使用方式与各供应商 API KEY 的获取配置教程', en: 'How to use the chat window and set up API KEYs from each provider' } },
];

/** 文档主页：站点介绍 + 模板介绍 + 使用方式 + 子文档导航 */
export function DocsPage() {
  const tr = useTr();
  return (
    <DocsLayout>
      {/* 网站总体介绍 */}
      <section data-docs-reveal className="mb-14">
        <h2 className="text-2xl font-bold tracking-tight">{tr({ zh: 'ZENSHEET · 简历 是什么？', en: 'What is ZENSHEET · Resume?' })}</h2>
        <p className="text-gray-600 mt-3 max-w-[46em] leading-relaxed">
          {tr({ zh: '一款在线 Markdown 简历编辑器：用 Markdown 书写内容，实时预览 A4 分页效果，在 8 套模板与主题微调之间自由切换，最后一键导出与预览完全一致的 PDF。内置 AI 助手帮你润色表达、分析岗位关键词；所有数据与你的模型密钥都由你掌控。', en: 'An online Markdown resume editor: write in Markdown, preview A4 pagination live, switch freely among eight templates and theme fine-tuning, then export a PDF that matches the preview page for page. A built-in AI assistant polishes wording and analyzes job keywords — your data and model keys stay under your control.' })}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          {FEATURES.map((f) => (
            <div key={tr(f.title)} className="rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900 text-sm">{tr(f.title)}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(f.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 模板介绍 */}
      <section data-docs-reveal className="mb-14">
        <h2 className="text-2xl font-bold tracking-tight">{tr({ zh: '模板一览', en: 'Templates' })}</h2>
        <p className="text-gray-600 mt-3 max-w-[46em] leading-relaxed">
          {tr({ zh: '内置 8 套精心调校的模板。在编辑器中打开模板库或主题面板即可实时预览并一键切换，切换不会改动简历内容。', en: 'Eight carefully tuned built-in templates. Open the template library or theme panel in the editor to preview live and switch in one click — switching never alters your content.' })}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:bg-primary-50/40 transition-all"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">{t.tag}</p>
              <p className="font-medium text-gray-900 text-sm mt-1.5">{tr(t.name)}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(t.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 使用方式 */}
      <section data-docs-reveal className="mb-14">
        <h2 className="text-2xl font-bold tracking-tight">{tr({ zh: '如何使用？', en: 'How to Use' })}</h2>
        <p className="text-gray-600 mt-3 max-w-[46em] leading-relaxed">
          {tr({ zh: '新建简历 → 在编辑器中用 Markdown 替换示例内容 → 通过主题面板挑选模板与样式 → 导出 PDF。详细流程见', en: 'New resume → replace the sample content with your own Markdown in the editor → pick a template and style in the theme panel → export PDF. For details, see the ' })}
          <Link to="/docs/guide" className="text-primary-600 hover:text-primary-700 font-medium mx-1">
            {tr({ zh: '使用指南', en: 'Guide' })}
          </Link>
          {tr({ zh: '；编辑器顶栏的「文档」按钮也会打开文档抽屉，随时速查语法。', en: '; the "Docs" button on the editor toolbar also opens the docs drawer for quick syntax lookup anytime.' })}
        </p>
      </section>

      {/* 子文档导航 */}
      <section data-docs-reveal className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">{tr({ zh: '分篇教程', en: 'Tutorials' })}</h2>
        <p className="text-gray-600 mt-3 max-w-[46em] leading-relaxed">
          {tr({ zh: '文档按主题拆分为五个子篇，右侧目录可在各篇之间切换。', en: 'Docs are split into five subpages by topic; the catalog on the right switches between them.' })}
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          {SUB_DOCS.map((d) => (
            <Link
              key={d.to}
              to={d.to}
              className="group rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:bg-primary-50/40 transition-all"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">{d.no}</p>
              <p className="font-semibold text-gray-900 mt-1.5 group-hover:text-primary-700 transition-colors">
                {tr(d.title)} →
              </p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1.5">{tr(d.desc)}</p>
            </Link>
          ))}
        </div>
      </section>
    </DocsLayout>
  );
}
