import { Link } from 'react-router-dom';
import { DocsLayout } from './docs/DocsLayout';

/** 模板一览（与首页模板橱窗一致） */
const TEMPLATES = [
  { id: 'classic', tag: 'CLASSIC', name: '经典简洁', desc: '黑白正式，适合大多数求职场景' },
  { id: 'modern', tag: 'MODERN', name: '现代蓝调', desc: '互联网与产品岗位首选' },
  { id: 'elegant', tag: 'ELEGANT', name: '优雅酒红', desc: '咨询、金融与品牌岗位' },
  { id: 'tech', tag: 'TECH', name: '科技墨绿', desc: '研发与技术岗位' },
  { id: 'muji', tag: 'MUJI', name: '墨纸极简', desc: '深色题头，沉稳耐看' },
  { id: 'azure', tag: 'AZURE', name: '青线极简', desc: '细线标题，素净轻盈' },
  { id: 'sunrise', tag: 'SUNRISE', name: '朝阳暖橙', desc: '渐变题头，明快有活力' },
  { id: 'carbon', tag: 'CARBON', name: '碳黑章标', desc: '灰底章节条 + 竖标，正式商务风' },
] as const;

const FEATURES = [
  { title: 'Markdown 编辑', desc: '左侧书写、右侧 A4 逐页实时预览，支持分栏、图标等简历专用语法' },
  { title: '8 套模板', desc: '经典、现代、极简等风格，预览卡片一键切换，内容始终保留' },
  { title: '主题微调', desc: '主色、字体、字号间距、页边距独立可调，与导出 PDF 严格一致' },
  { title: 'AI 助手', desc: '润色全文、关键词分析、要点成段，自带 API KEY 直连模型供应商，密钥仅存本地' },
  { title: '照片与图标', desc: '证件照自由拖放缩放，19 个内置矢量图标随文字变色' },
  { title: 'PDF 导出', desc: '浏览器打印直出，所见即所得，逐页排版与预览完全相同' },
];

const SUB_DOCS = [
  { to: '/docs/guide', no: '01', title: '使用指南', desc: '从创建简历到导出 PDF 的基础流程，以及其余教程的索引' },
  { to: '/docs/markdown', no: '02', title: 'Markdown 简历教程', desc: '标题、强调、列表、引用、分栏等语法示例与效果预览' },
  { to: '/docs/theme', no: '03', title: '主题配置', desc: '模板切换、视觉风格、页面布局的详细说明与注意事项' },
  { to: '/docs/icons', no: '04', title: '图标库', desc: 'icon: 语法、图标库使用方式与全部内置图标一览' },
  { to: '/docs/ai', no: '05', title: 'AI 助手', desc: '聊天窗使用方式与各供应商 API KEY 的获取配置教程' },
] as const;

/** 文档主页：站点介绍 + 模板介绍 + 使用方式 + 子文档导航 */
export function DocsPage() {
  return (
    <DocsLayout>
      {/* 网站总体介绍 */}
      <section data-docs-reveal className="mb-14">
        <h2 className="text-2xl font-bold tracking-tight">ZENSHEET · 简历 是什么？</h2>
        <p className="text-gray-600 mt-3 max-w-[46em] leading-relaxed">
          一款在线 Markdown 简历编辑器：用 Markdown 书写内容，实时预览 A4 分页效果，
          在 8 套模板与主题微调之间自由切换，最后一键导出与预览完全一致的 PDF。
          内置 AI 助手帮你润色表达、分析岗位关键词；所有数据与你的模型密钥都由你掌控。
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900 text-sm">{f.title}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 模板介绍 */}
      <section data-docs-reveal className="mb-14">
        <h2 className="text-2xl font-bold tracking-tight">模板一览</h2>
        <p className="text-gray-600 mt-3 max-w-[46em] leading-relaxed">
          内置 8 套精心调校的模板。在编辑器中打开模板库或主题面板即可实时预览并一键切换，
          切换不会改动简历内容。
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:bg-primary-50/40 transition-all"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">{t.tag}</p>
              <p className="font-medium text-gray-900 text-sm mt-1.5">{t.name}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 使用方式 */}
      <section data-docs-reveal className="mb-14">
        <h2 className="text-2xl font-bold tracking-tight">如何使用？</h2>
        <p className="text-gray-600 mt-3 max-w-[46em] leading-relaxed">
          新建简历 → 在编辑器中用 Markdown 替换示例内容 →
          通过主题面板挑选模板与样式 → 导出 PDF。
          详细流程见
          <Link to="/docs/guide" className="text-primary-600 hover:text-primary-700 font-medium mx-1">
            使用指南
          </Link>
          ；编辑器顶栏的「文档」按钮也会打开文档抽屉，随时速查语法。
        </p>
      </section>

      {/* 子文档导航 */}
      <section data-docs-reveal className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">分篇教程</h2>
        <p className="text-gray-600 mt-3 max-w-[46em] leading-relaxed">
          文档按主题拆分为五个子篇，右侧目录可在各篇之间切换。
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
                {d.title} →
              </p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1.5">{d.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </DocsLayout>
  );
}
