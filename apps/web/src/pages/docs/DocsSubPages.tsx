import { createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import { DocBlock, DocSectionHeader, DocsLayout } from './DocsLayout';
import { MdDemo } from './MdDemo';
import { BUILTIN_ICONS } from '@/preview/resumeIcons';
import { useLang, useTr, type Bi } from '@/i18n/LangContext';

/* ============ 跨文档跳转：文档页内为路由链接，编辑器抽屉内为切换 Tab ============ */

/** 抽屉内容器：提供时，文档间链接切换抽屉 Tab 而非路由跳转 */
export const DrawerNavContext = createContext<((to: string) => void) | null>(null);

/** 文档间跳转链接：在编辑器抽屉中渲染时切换抽屉 Tab，否则按路由跳转 */
function DocPageLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  const nav = useContext(DrawerNavContext);
  if (nav) {
    return (
      <button type="button" onClick={() => nav(to)} className={className}>
        {children}
      </button>
    );
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

/* ============ 01 使用指南 ============ */

const QUICK_STEPS: { no: string; title: Bi; desc: Bi }[] = [
  { no: 'STEP 1', title: { zh: '打开即用', en: 'Open and Use' }, desc: { zh: '免注册登录，打开网站即可使用，默认用户名为 ZENSHEET；简历与配置仅保存在当前浏览器本地。点击导航栏用户名打开设置，可自定义用户名。', en: 'No sign-up required — open the site and start working. Your default username is ZENSHEET; resumes and settings are stored only in your current browser. Click your username in the navbar to open Settings and customize it.' } },
  { no: 'STEP 2', title: { zh: '创建简历', en: 'Create a Resume' }, desc: { zh: '进入「我的简历」页面，点击新建简历，会得到一份示例内容，随后在编辑器中替换为自己的经历。', en: 'Go to "My Resumes" and click New Resume. A sample resume is created for you — replace it with your own experience in the editor.' } },
  { no: 'STEP 3', title: { zh: '编辑内容', en: 'Edit Content' }, desc: { zh: '左侧为 Markdown 编辑器，右侧实时预览。使用标题、列表、分栏等语法组织内容，详见《Markdown 简历教程》。', en: 'Write Markdown on the left and preview live on the right. Organize content with headings, lists, columns and more — see the Markdown Resume Tutorial.' } },
  { no: 'STEP 4', title: { zh: '调样式并导出', en: 'Style & Export' }, desc: { zh: '通过「主题」面板选择模板与视觉风格；完成后点击右上角「导出 PDF」，在浏览器打印窗口中「另存为 PDF」即可，效果与预览逐页一致。', en: 'Pick a template and visual style in the Theme panel. When done, click "Export PDF" at the top right and choose "Save as PDF" in the browser print dialog — every page matches the preview exactly.' } },
];

const GUIDE_LINKS: { to: string; no: string; title: Bi; desc: Bi }[] = [
  { to: '/docs/markdown', no: '02', title: { zh: 'Markdown 简历教程', en: 'Markdown Resume Tutorial' }, desc: { zh: '标题、强调、列表、引用、分栏等常用语法与效果预览', en: 'Common syntax — headings, emphasis, lists, quotes, columns — with live previews' } },
  { to: '/docs/theme', no: '03', title: { zh: '主题配置', en: 'Theme Settings' }, desc: { zh: '模板切换、视觉风格与页面布局的各项设置与注意事项', en: 'Template switching, visual style and page layout options & notes' } },
  { to: '/docs/icons', no: '04', title: { zh: '图标库', en: 'Icon Library' }, desc: { zh: 'icon:语法、图标库的使用方式与常用图标一览', en: 'The icon: syntax, how to use the library, and all built-in icons' } },
  { to: '/docs/ai', no: '05', title: { zh: 'AI 助手', en: 'AI Assistant' }, desc: { zh: '润色、关键词分析、要点成段，以及 API KEY 的获取与配置', en: 'Polishing, keyword analysis, bullet expansion, and API KEY setup' } },
];

/** 使用指南正文（文档页与编辑器抽屉共用） */
export function GuideContent() {
  const tr = useTr();
  return (
    <>
      <DocBlock title={tr({ zh: '快速开始', en: 'Quick Start' })} desc={tr({ zh: '四步完成第一份简历：', en: 'Create your first resume in four steps:' })}>
        <ol className="flex flex-col gap-4">
          {QUICK_STEPS.map((s) => (
            <li key={s.no} className="flex gap-4 rounded-xl border border-gray-200 p-4">
              <span className="font-mono text-[11px] uppercase tracking-widest text-primary-600 shrink-0 pt-0.5">
                {s.no}
              </span>
              <div>
                <p className="font-medium text-gray-900">{tr(s.title)}</p>
                <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(s.desc)}</p>
              </div>
            </li>
          ))}
        </ol>
      </DocBlock>

      <DocBlock title={tr({ zh: '编辑器布局', en: 'Editor Layout' })} desc={tr({ zh: '编辑页面自左向右分为四个区域，均可拖拽中间的分隔手柄调整宽度：', en: 'The editor page has four areas from left to right; drag the divider handles to resize them:' })}>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { t: { zh: '编辑器', en: 'Editor' }, d: { zh: 'Markdown 源码编辑区，工具栏提供模板库、照片、图标、文档等快捷入口', en: 'Markdown source editor with a toolbar for quick access to templates, photos, icons and docs' } },
            { t: { zh: '实时预览', en: 'Live Preview' }, d: { zh: 'A4 纸张逐页渲染，与导出 PDF 效果一致；顶栏可缩放与全屏', en: 'Page-by-page A4 rendering identical to the exported PDF; zoom and fullscreen on the toolbar' } },
            { t: { zh: '主题面板', en: 'Theme Panel' }, d: { zh: '点击预览顶栏「主题」打开，切换模板、配色、字体与页边距', en: 'Open via "Theme" on the preview toolbar — switch templates, colors, fonts and margins' } },
            { t: { zh: 'AI 聊天窗', en: 'AI Chat' }, d: { zh: '点击顶栏「AI 助手」在预览右侧展开，支持流式回复与历史记录', en: 'Click "AI Assistant" on the toolbar to open beside the preview; streaming replies and history supported' } },
          ].map((item) => (
            <div key={tr(item.t)} className="rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900 text-sm">{tr(item.t)}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(item.d)}</p>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '数据保存与隐私', en: 'Data & Privacy' })} desc={tr({ zh: '免登录版不设账号体系，你的数据只属于你：', en: 'The login-free edition has no account system — your data belongs to you alone:' })}>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { t: { zh: '本地存储', en: 'Local Storage' }, d: { zh: '简历与 AI 对话历史保存在浏览器的 IndexedDB 中，不经过任何服务器；模型密钥同样仅保存在本地。', en: 'Resumes and AI chat history live in your browser\'s IndexedDB — never on a server. Model API keys are also stored locally only.' } },
            { t: { zh: '隐私模式', en: 'Private Mode' }, d: { zh: '无痕 / 隐私模式下数据仅暂存在内存，关闭窗口后即清空，请注意提前导出 PDF 备份。', en: 'In incognito / private mode, data lives in memory only and is wiped when the window closes — export PDF backups in advance.' } },
            { t: { zh: '数量上限', en: 'Limit' }, d: { zh: '每个浏览器最多保存 15 份简历，超出后可删除不需要的简历再新建。', en: 'Each browser keeps up to 15 resumes; delete ones you no longer need to create new ones.' } },
            { t: { zh: '换设备提醒', en: 'Across Devices' }, d: { zh: '数据绑定当前浏览器，更换设备或浏览器后不会自动同步；建议养成定期导出 PDF 的习惯。', en: 'Data is bound to the current browser and won\'t sync across devices or browsers. Make a habit of exporting PDFs regularly.' } },
          ].map((item) => (
            <div key={tr(item.t)} className="rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900 text-sm">{tr(item.t)}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(item.d)}</p>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '进阶教程', en: 'Advanced Tutorials' })} desc={tr({ zh: '完成基础流程后，按需阅读以下教程：', en: 'After the basics, read these as needed:' })}>
        <div className="grid sm:grid-cols-2 gap-3">
          {GUIDE_LINKS.map((l) => (
            <DocPageLink
              key={l.to}
              to={l.to}
              className="group text-left rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:bg-primary-50/40 transition-all"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
                {l.no}
              </p>
              <p className="font-medium text-gray-900 text-sm mt-1 group-hover:text-primary-700 transition-colors">
                {tr(l.title)} →
              </p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(l.desc)}</p>
            </DocPageLink>
          ))}
        </div>
      </DocBlock>
    </>
  );
}

export function GuidePage() {
  const tr = useTr();
  return (
    <DocsLayout>
      <DocSectionHeader
        no="01 · GUIDE"
        title={tr({ zh: '使用指南', en: 'Guide' })}
        desc={tr({ zh: '本页介绍从创建简历到导出 PDF 的完整使用流程，并汇总其余教程文档的入口。', en: 'The complete workflow from creating a resume to exporting PDF, plus links to all other tutorials.' })}
      />
      <GuideContent />
    </DocsLayout>
  );
}

/* ============ 02 Markdown 简历教程 ============ */

/** Markdown 简历教程正文（文档页与编辑器抽屉共用） */
export function MarkdownDocContent() {
  const tr = useTr();
  const { lang } = useLang();
  return (
    <>
      <DocBlock title={tr({ zh: '标题', en: 'Headings' })} desc={tr({ zh: '使用 # 号表示标题层级：# 一级标题（姓名）、## 二级标题（章节）、### 三级标题（条目）：', en: 'Use # for heading levels: # level 1 (name), ## level 2 (sections), ### level 3 (items):' })}>
        <MdDemo
          title={tr({ zh: '标题示例', en: 'Heading example' })}
          code={lang === 'en'
            ? '# Shen Yinan\n\n## Education\n\n### XYZ University · Computer Science\n\n#### 2021.09 – 2025.06'
            : '# 沈亦南\n\n## 教育背景\n\n### 某某大学 · 计算机科学与技术\n\n#### 2021.09 – 2025.06'}
        />
      </DocBlock>

      <DocBlock title={tr({ zh: '强调', en: 'Emphasis' })} desc={tr({ zh: '粗体突出关键成果，斜体用于补充说明，行内代码适合技术名词：', en: 'Bold for key achievements, italic for asides, inline code for tech terms:' })}>
        <MdDemo
          title={tr({ zh: '强调示例', en: 'Emphasis example' })}
          code={lang === 'en'
            ? '**Led the core module rewrite**, QPS improved *3x*, distilled into `go-zero` microservice practices'
            : '**主导核心模块重构**，QPS 提升 *3 倍*，沉淀了 `go-zero` 微服务框架实践'}
        />
      </DocBlock>

      <DocBlock title={tr({ zh: '列表', en: 'Lists' })} desc={tr({ zh: '无序列表罗列职责要点，有序列表强调步骤或时间顺序：', en: 'Unordered lists for responsibilities; ordered lists for steps or chronology:' })}>
        <MdDemo
          title={tr({ zh: '列表示例', en: 'List example' })}
          code={lang === 'en'
            ? '- Owned reliability of the order service\n- Drove CI/CD adoption\n\n1. Requirements review\n2. Solution design\n3. Launch retrospective'
            : '- 负责订单服务的稳定性建设\n- 推动 CI/CD 流程落地\n\n1. 需求评审\n2. 方案设计\n3. 上线复盘'}
        />
      </DocBlock>

      <DocBlock title={tr({ zh: '引用', en: 'Quote' })} desc={tr({ zh: '引用块适合放自我评价或一句话总结，预览中渲染为左侧竖线 + 缩进样式：', en: 'Quote blocks suit a self-summary or one-liner; rendered with a left bar + indent:' })}>
        <MdDemo
          title={tr({ zh: '引用示例', en: 'Quote example' })}
          code={lang === 'en'
            ? '> Backend engineer with three years of experience in high-concurrency systems and reliability, leading architecture evolution of order systems handling tens of millions of orders daily.'
            : '> 三年后端开发经验，专注高并发与稳定性，主导过日千万级订单系统的架构演进。'}
        />
      </DocBlock>

      <DocBlock title={tr({ zh: '分割线', en: 'Divider' })} desc={tr({ zh: '三个短横线渲染为水平分割线，用于章节之间留白分隔：', en: 'Three dashes render a horizontal rule for spacing between sections:' })}>
        <MdDemo
          title={tr({ zh: '分割线示例', en: 'Divider example' })}
          code={lang === 'en'
            ? '## Work Experience\n\n---\n\n## Projects'
            : '## 工作经历\n\n---\n\n## 项目经验'}
        />
      </DocBlock>

      <DocBlock
        title={tr({ zh: '左中右分栏', en: 'Left / Mid / Right Columns' })}
        desc={tr({ zh: ':::left / :::mid / :::right 三种容器连续书写时并排渲染，适合页眉的姓名 + 职位 + 联系方式排版；两栏同样有效：', en: ':::left / :::mid / :::right containers render side by side when written consecutively — ideal for a header with name + role + contact; two columns work too:' })}
      >
        <MdDemo
          title={tr({ zh: '三栏分款示例', en: 'Three-column example' })}
          code={lang === 'en'
            ? ':::left\n**Shen Yinan**\n:::\n\n:::mid\nBackend Engineer\n:::\n\n:::right\nicon:phone 138-0000-0000\n:::'
            : ':::left\n**沈亦南**\n:::\n\n:::mid\n后端工程师\n:::\n\n:::right\nicon:phone 138-0000-0000\n:::'}
        />
        <MdDemo
          title={tr({ zh: '两栏分款示例', en: 'Two-column example' })}
          code={':::left\nicon:email shen@example.com\n:::\n\n:::right\nicon:github github.com/shen\n:::'}
        />
      </DocBlock>

      <DocBlock title={tr({ zh: '图标', en: 'Icons' })} desc={tr({ zh: '正文中使用 icon:名称 即可插入简历图标，详见《图标库》：', en: 'Type icon:name anywhere in the text to insert a resume icon — see the Icon Library:' })}>
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <p>
            {tr({ zh: '写法：', en: 'Syntax: ' })}
            <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs">icon:github</code>
            {tr({ zh: '，渲染为 ', en: ', rendered as an ' })}
            <span className="text-primary-600">{tr({ zh: '内置 SVG 图标', en: 'built-in SVG icon' })}</span>
            {tr({ zh: '，颜色跟随文字、尺寸跟随字号。', en: ' that follows the text color and font size.' })}
          </p>
          <DocPageLink
            to="/docs/icons"
            className="inline-block mt-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            {tr({ zh: '查看图标库教程 →', en: 'Icon Library tutorial →' })}
          </DocPageLink>
        </div>
      </DocBlock>
    </>
  );
}

export function MarkdownDocPage() {
  const tr = useTr();
  return (
    <DocsLayout>
      <DocSectionHeader
        no="02 · MARKDOWN"
        title={tr({ zh: 'Markdown 简历教程', en: 'Markdown Resume Tutorial' })}
        desc={tr({ zh: '编辑器支持的常用语法速查，每个语法均附使用示例与实时渲染的效果预览。', en: 'A quick reference of supported syntax, each with an example and a live-rendered preview.' })}
      />
      <MarkdownDocContent />
    </DocsLayout>
  );
}

/* ============ 03 主题配置 ============ */

/** 主题配置正文（文档页与编辑器抽屉共用） */
export function ThemeDocContent() {
  const tr = useTr();
  return (
    <>
      <DocBlock title={tr({ zh: '模板', en: 'Templates' })} desc={tr({ zh: '内置 8 套模板，以真实内容的预览卡片呈现，最多同屏 4 张，超出可滚动查看（带吸附）：', en: 'Eight built-in templates shown as preview cards with real content; up to 4 visible at once, scroll (with snap) for more:' })}>
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: '切换模板只改变排版与配色，', en: 'Switching templates only changes layout and colors — ' })}<b>{tr({ zh: '简历内容始终保留', en: 'your resume content is always preserved' })}</b>{tr({ zh: '，可放心试遍所有模板。', en: ', so feel free to try every template.' })}</li>
            <li>{tr({ zh: '当前模板以主题色描边标识，点击卡片即完成切换。', en: 'The current template is highlighted with a themed border; click a card to switch.' })}</li>
          </ul>
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '视觉风格', en: 'Visual Style' })} desc={tr({ zh: '六种主色调与五种正文字体，奠定简历的第一印象：', en: 'Six primary colors and five body fonts set the first impression of your resume:' })}>
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: '主色影响标题、分隔线、图标等强调元素的配色。', en: 'The primary color drives accents — headings, dividers, icons and more.' })}</li>
          </ul>
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '字号与行距', en: 'Font Size & Line Height' })} desc={tr({ zh: '独立分组精调排版：H1~H5、段落与列表字号分别可调，行距自由选择：', en: 'Fine-tuned typography in a dedicated group: H1–H5, paragraph and list sizes adjust separately, with free line-height choice:' })}>
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: '字号按 H1 ~ H5、段落、列表分别设置（10 ~ 30 px，H1 可调至 40 px）：未调整的类别按默认字号渲染（H1 30 px、H2 20 px，其余 14 px），下拉中带「默认」标识；行距在 1.2 ~ 2.5 倍间选择，同时影响段落与条目的垂直留白，建议先选模板再微调。', en: 'Font sizes set separately for H1–H5, paragraphs and lists (10–30 px, H1 up to 40 px): untouched categories render at defaults (H1 30 px, H2 20 px, others 14 px) and are marked "Default" in the dropdowns. Line height ranges 1.2–2.5x and affects vertical spacing of paragraphs and items. Pick a template first, then fine-tune.' })}</li>
          </ul>
        </div>
      </DocBlock>

      <DocBlock
        title={tr({ zh: '页面布局', en: 'Page Layout' })}
        desc={tr({ zh: '左右与上下页边距独立可调（含「无」档位），另有内容边距控制正文与页面边缘的距离：', en: 'Horizontal and vertical page margins adjust independently (including "None"), plus a content padding controlling the gap between text and page edge:' })}
      >
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: '页面留白 = 页边距 + 内容边距，两者叠加生效，导出 PDF 与预览严格一致。', en: 'Page whitespace = page margin + content padding; they stack, and the exported PDF matches the preview exactly.' })}</li>
            <li>{tr({ zh: '选择「无」页边距可获得整页出血式的排版自由度。', en: 'Choose "None" margins for full-bleed layout freedom.' })}</li>
          </ul>
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '注意事项', en: 'Notes' })}>
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-[13px] text-amber-800 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: '切换模板后，视觉风格与页面布局会重置为新模板的默认值，建议确定模板后再做微调。', en: 'Switching templates resets visual style and page layout to the new template\'s defaults — settle on a template before fine-tuning.' })}</li>
            <li>{tr({ zh: '主题面板为悬浮卡片，不影响预览内容的滚动；再次点击「主题」或按 Esc 可关闭。', en: 'The theme panel floats and never blocks preview scrolling; click "Theme" again or press Esc to close.' })}</li>
            <li>{tr({ zh: '所有改动实时保存到草稿，无需手动确认。', en: 'All changes save to the draft in real time — no manual confirmation needed.' })}</li>
          </ul>
        </div>
      </DocBlock>
    </>
  );
}

export function ThemeDocPage() {
  const tr = useTr();
  return (
    <DocsLayout>
      <DocSectionHeader
        no="03 · THEME"
        title={tr({ zh: '主题配置', en: 'Theme Settings' })}
        desc={tr({ zh: '点击预览窗口顶栏的「主题」按钮打开主题面板，分三组设置：模板、视觉风格与页面布局。', en: 'Click "Theme" on the preview toolbar to open the theme panel, organized into three groups: templates, visual style and page layout.' })}
      />
      <ThemeDocContent />
    </DocsLayout>
  );
}

/* ============ 04 图标库 ============ */

const ICON_LABELS: Record<string, Bi> = {
  info: { zh: '用户', en: 'Profile' }, location: { zh: '地址', en: 'Location' }, github: { zh: 'GitHub', en: 'GitHub' }, email: { zh: '邮箱', en: 'Email' }, phone: { zh: '电话', en: 'Phone' },
  blog: { zh: '博客', en: 'Blog' }, juejin: { zh: '掘金', en: 'Juejin' }, weixin: { zh: '微信', en: 'WeChat' }, zhihu: { zh: '知乎', en: 'Zhihu' }, csdn: { zh: 'CSDN', en: 'CSDN' },
  school: { zh: '学历', en: 'Degree' }, work: { zh: '工作', en: 'Work' }, award: { zh: '奖项', en: 'Award' }, calendar: { zh: '日期', en: 'Date' }, cake: { zh: '生日', en: 'Birthday' },
  link: { zh: '链接', en: 'Link' }, globe: { zh: '网站', en: 'Website' }, idcard: { zh: '证件', en: 'ID' }, star: { zh: '亮点', en: 'Highlight' },
};

/** 图标库正文（文档页与编辑器抽屉共用） */
export function IconsDocContent() {
  const tr = useTr();
  return (
    <>
      <DocBlock title={tr({ zh: '使用方式', en: 'Usage' })} desc={tr({ zh: '三种方式，任选其一：', en: 'Three ways, pick any:' })}>
        <ol className="flex flex-col gap-3">
          {[
            { t: { zh: '直接书写语法', en: 'Type the syntax' }, d: { zh: '在编辑器任意位置输入 icon:名称（如 icon:phone），预览立即渲染为图标。', en: 'Type icon:name anywhere in the editor (e.g. icon:phone) and the preview renders it instantly.' } },
            { t: { zh: '图标库复制', en: 'Copy from the library' }, d: { zh: '点击编辑器顶栏「图标」打开图标库，点击图标即复制语法，粘贴到编辑器即可；窗口底部有复制反馈。', en: 'Click "Icons" on the editor toolbar to open the library; clicking an icon copies the syntax for pasting, with feedback at the bottom of the window.' } },
            { t: { zh: '自定义图标', en: 'Custom icons' }, d: { zh: '在图标库底部输入框粘贴任意 SVG 代码并命名，即可通过 icon:你的名称 使用。', en: 'Paste any SVG code into the input at the bottom of the library, name it, and use it via icon:yourname.' } },
          ].map((item, i) => (
            <li key={tr(item.t)} className="flex gap-3 rounded-xl border border-gray-200 p-4">
              <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-gray-900 text-sm">{tr(item.t)}</p>
                <p className="text-[13px] text-gray-500 leading-relaxed mt-0.5">{tr(item.d)}</p>
              </div>
            </li>
          ))}
        </ol>
      </DocBlock>

      <DocBlock title={tr({ zh: '常用图标', en: 'Built-in Icons' })} desc={tr({ zh: `共 ${Object.keys(BUILTIN_ICONS).length} 个内置图标，鼠标悬停可查看对应的 icon: 名称：`, en: `${Object.keys(BUILTIN_ICONS).length} built-in icons in total; hover any icon to see its icon: name:` })}>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {Object.entries(BUILTIN_ICONS).map(([name, svg]) => (
            <div
              key={name}
              className="group rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:border-primary-300 hover:bg-primary-50/40 transition-all"
              title={`icon:${name}`}
            >
              <span
                className="w-6 h-6 text-gray-700 group-hover:text-primary-600 transition-colors inline-flex [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <span className="text-[11px] text-gray-400 font-mono truncate max-w-full">{name}</span>
              <span className="text-[11px] text-gray-500">{ICON_LABELS[name] ? tr(ICON_LABELS[name]) : ''}</span>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '注意事项', en: 'Notes' })}>
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-[13px] text-amber-800 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: '名称支持字母数字下划线与连字符，须以字母开头，例如 icon:my_icon_2。', en: 'Names support letters, digits, underscores and hyphens, and must start with a letter, e.g. icon:my_icon_2.' })}</li>
            <li>{tr({ zh: '图标继承所在文字的颜色与字号，放在粗体标题中会随标题加粗放大。', en: 'Icons inherit the surrounding text color and size — inside a bold heading they grow and bolden with it.' })}</li>
            <li>{tr({ zh: '分栏容器中使用图标可排出页眉联系方式行，参考《Markdown 简历教程》。', en: 'Use icons inside column containers to build a header contact line — see the Markdown Resume Tutorial.' })}</li>
          </ul>
        </div>
      </DocBlock>
    </>
  );
}

export function IconsDocPage() {
  const tr = useTr();
  return (
    <DocsLayout>
      <DocSectionHeader
        no="04 · ICONS"
        title={tr({ zh: '图标库', en: 'Icon Library' })}
        desc={tr({ zh: '在简历中插入矢量图标：颜色跟随文字、尺寸跟随字号，导出 PDF 同样清晰。', en: 'Insert vector icons into your resume: they follow text color and font size, and stay crisp in the exported PDF.' })}
      />
      <IconsDocContent />
    </DocsLayout>
  );
}

/* ============ 05 AI 助手 ============ */

const AI_PROVIDERS: { name: string; url: string; key: Bi }[] = [
  { name: 'OpenAI', url: 'https://platform.openai.com', key: { zh: 'API Keys 页面创建 Secret Key', en: 'Create a Secret Key on the API Keys page' } },
  { name: 'DeepSeek', url: 'https://platform.deepseek.com', key: { zh: 'API Keys 页面创建', en: 'Create on the API Keys page' } },
  { name: 'GLM（智谱）', url: 'https://open.bigmodel.cn', key: { zh: '开放平台 → API Keys', en: 'Open Platform → API Keys' } },
  { name: 'Qwen（通义千问）', url: 'https://qwen.ai/home', key: { zh: '官网 → API Key 控制台创建', en: 'Website → API Key console' } },
  { name: 'LongCat', url: 'https://longcat.chat', key: { zh: '官网 → 开放平台获取并注意模型名', en: 'Website → Open Platform (mind the model name)' } },
  { name: 'Xiaomi MiMo', url: 'https://mimo.mi.com/', key: { zh: '开放平台 → API Keys 创建', en: 'Open Platform → API Keys' } },
];

/** AI 助手正文（文档页与编辑器抽屉共用） */
export function AIDocContent() {
  const tr = useTr();
  return (
    <>
      <DocBlock title={tr({ zh: '三种能力', en: 'Three Capabilities' })} desc={tr({ zh: '窗口空状态提供快捷指令，也可自由提问：', en: 'The empty state offers quick prompts — or ask freely:' })}>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { t: { zh: '润色全文', en: 'Polish All' }, d: { zh: '优化表达与排版结构，让内容更专业、更有说服力', en: 'Refines wording and structure to make your content more professional and persuasive' } },
            { t: { zh: '关键词分析', en: 'Keyword Analysis' }, d: { zh: '对照目标岗位提炼简历关键词覆盖情况与改进建议', en: 'Checks keyword coverage against a target role and suggests improvements' } },
            { t: { zh: '要点成段', en: 'Expand Bullets' }, d: { zh: '把零散的经历要点扩写为完整、有细节的段落', en: 'Turns scattered bullet points into complete, detailed paragraphs' } },
          ].map((item) => (
            <div key={tr(item.t)} className="rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900 text-sm">{tr(item.t)}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(item.d)}</p>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock
        title={tr({ zh: '配置 API KEY', en: 'Configure an API KEY' })}
        desc={tr({ zh: 'AI 助手使用你自己的模型密钥（BYOK），点击导航栏用户名 → 设置 → AI 完成配置：', en: 'The AI assistant uses your own model key (BYOK). Click your username in the navbar → Settings → AI to configure:' })}
      >
        <ol className="flex flex-col gap-3">
          {[
            { zh: '打开设置：点击导航栏头像 / 用户名，进入「设置」窗口的「AI」分类。', en: 'Open Settings: click your avatar / username in the navbar and go to the AI category in the Settings window.' },
            { zh: '选择供应商：内置 OpenAI、DeepSeek、GLM、Qwen、LongCat、MiMo，也支持自定义 OpenAI 兼容协议地址。', en: 'Pick a provider: OpenAI, DeepSeek, GLM, Qwen, LongCat and MiMo are built in; custom OpenAI-compatible endpoints are supported too.' },
            { zh: '填写 API KEY：不同供应商的 KEY 独立保存，互不影响；模型列表点击「获取模型」自动拉取，失败时可手动输入模型名。', en: 'Enter your API KEY: keys are stored independently per provider. Click "Fetch Models" to auto-load the model list, or type a model name manually if it fails.' },
            { zh: '保存并测试：回到 AI 聊天窗发送消息即可；消息上方的「AI 执行」可展开查看执行步骤与错误详情。', en: 'Save and test: send a message in the AI chat window. Expand "AI Trace" above a message to see execution steps and error details.' },
          ].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-gray-200 p-4">
              <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-[13px] text-gray-600 leading-relaxed">{tr(s)}</p>
            </li>
          ))}
        </ol>
      </DocBlock>

      <DocBlock title={tr({ zh: '供应商入口', en: 'Provider Links' })} desc={tr({ zh: '各供应商 API KEY 的申请入口：', en: 'Where to apply for each provider\'s API KEY:' })}>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                <th className="px-4 py-2.5 font-medium">{tr({ zh: '供应商', en: 'Provider' })}</th>
                <th className="px-4 py-2.5 font-medium">{tr({ zh: '官网 / 控制台', en: 'Website / Console' })}</th>
                <th className="px-4 py-2.5 font-medium">{tr({ zh: 'KEY 获取', en: 'Getting a KEY' })}</th>
              </tr>
            </thead>
            <tbody>
              {AI_PROVIDERS.map((p) => (
                <tr key={p.name} className="border-t border-gray-100">
                  <td className="px-4 py-2.5 text-gray-900 font-medium whitespace-nowrap">{p.name}</td>
                  <td className="px-4 py-2.5">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 break-all"
                    >
                      {p.url}
                    </a>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{tr(p.key)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '注意事项', en: 'Notes' })}>
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-[13px] text-amber-800 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: 'API KEY 仅保存在你自己的浏览器中，对话请求由浏览器直连你选择的供应商，本站不经手、不存储任何数据。', en: 'Your API KEY is stored only in your own browser; chat requests go directly from your browser to the provider — this site never touches or stores any data.' })}</li>
            <li>{tr({ zh: '对话记录按简历维度保存在本地浏览器，切换简历互不串扰，关闭窗口后重新打开可继续。', en: 'Chat history is saved locally per resume — switching resumes never mixes conversations, and reopening the window continues where you left off.' })}</li>
            <li>{tr({ zh: '部分供应商未开放浏览器跨域访问时「获取模型」会失败，此时可手动输入模型名称；对话请求不受影响。', en: 'If a provider doesn\'t allow browser cross-origin access, "Fetch Models" may fail — type the model name manually; chat requests are unaffected.' })}</li>
            <li>{tr({ zh: '生成中可点击「停止」中断；未配置模型时会给出明确提示。', en: 'Click "Stop" to interrupt while generating; a clear prompt appears if no model is configured.' })}</li>
          </ul>
        </div>
      </DocBlock>
    </>
  );
}

export function AIDocPage() {
  const tr = useTr();
  return (
    <DocsLayout>
      <DocSectionHeader
        no="05 · AI ASSISTANT"
        title={tr({ zh: 'AI 助手', en: 'AI Assistant' })}
        desc={tr({ zh: '点击编辑器顶栏「AI 助手」按钮，在预览右侧展开聊天窗口，对当前简历进行润色与分析。', en: 'Click "AI Assistant" on the editor toolbar to open the chat beside the preview and polish or analyze the current resume.' })}
      />
      <AIDocContent />
    </DocsLayout>
  );
}

/* ============ 更新日志 ============ */

type ChangelogEntry = {
  version: string;
  date: string;
  title: Bi;
  /** 分支标识徽章（如：免登录版），无则为普通全栈版条目 */
  tag?: Bi;
  items: Bi[];
};

const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v0.12.0',
    date: '2026-09-04',
    title: { zh: '自定义主色与全站统一页脚', en: 'Custom Primary Color & Site-wide Footer' },
    items: [
      { zh: '主色调新增「自定义颜色」：圆角矩形调色盘（饱和度 / 明度二维取色、色相滑杆、HEX 输入），选色实时生效', en: 'Primary color gains "Custom": a rounded color picker (2D saturation/brightness area, hue slider, HEX input) that applies live' },
      { zh: '主色色板扩充至 11 色：新增孟菲斯色系代表色（亮黄 / 珊瑚红 / 玫粉 / 青蓝 / 湖水绿），与原 6 色无相近重复', en: 'Palette expanded to 11 colors with Memphis-style additions (bright yellow / coral / rose pink / cyan blue / lake green), none too close to the original six' },
      { zh: '编辑器新增选中文字悬浮工具栏：鼠标释放后浮现于选区上方（空间不足自动翻转），工具与顶栏一致，滚动实时跟随', en: 'Editor gains a floating toolbar for selected text: appears above the selection on mouse-up (auto-flips when short on space), matching the toolbar tools and tracking scroll' },
      { zh: '新增全站统一三栏页脚（相关资源 / 文档 / 联系），联系栏含 QQ 群二维码入口；首页与文档页共用，文档页为深色变体、首页保持浅色', en: 'New site-wide three-column footer (Resources / Docs / Contact) with a QQ-group QR code; shared by home and docs pages — dark variant for docs, light for home' },
      { zh: '简历创建份数上限 15 份：达上限后「新建 / 复制」入口禁用并提示引导，后端同步强制校验', en: 'Resume limit of 15: "New / Duplicate" disables with guidance when reached, enforced by the backend as well' },
      { zh: '项目文档规范化：README 重写为专业开源项目格式（徽章 / 目录 / 分组功能列表 / 贡献指南），补齐 MIT LICENSE 文件', en: 'Docs formalized: README rewritten in professional open-source format (badges / TOC / grouped features / contributing guide) with an MIT LICENSE added' },
    ],
  },
  {
    version: 'v0.11.0',
    date: '2026-09-04',
    title: { zh: '字号分类设置与模板主题联动', en: 'Per-level Font Sizes & Template-Theme Coupling' },
    items: [
      { zh: '主题配置新增独立「字号与行距」分组，H1 ~ H5、段落、列表字号分别设置（10 ~ 30 px，H1 可调至 40 px），默认字号以「默认」徽章标识，支持一键重置', en: 'Theme settings gain a dedicated "Font Size & Line Height" group — H1–H5, paragraph and list sizes set separately (10–30 px, H1 up to 40 px), defaults badged and one-click reset supported' },
      { zh: '分类字号默认值：H1 30 px、H2 20 px、H3/H4/H5 与段落列表 14 px，预览、模板卡片与 PDF 导出三端一致', en: 'Default sizes: H1 30 px, H2 20 px, H3/H4/H5 and paragraphs/lists 14 px — consistent across preview, template cards and PDF export' },
      { zh: '主题面板精修：顶栏固定不随滚动、重置按钮胶囊化并优化配色、模板预览放大适应卡片', en: 'Theme panel polish: fixed header while scrolling, pill-shaped reset button with better colors, larger template previews fitting the cards' },
      { zh: '全站下拉菜单方向自适应：下方空间不足时自动向上展开', en: 'Dropdowns flip site-wide: they open upward automatically when space below is tight' },
      { zh: '多模板主色调联动增强：碳黑章标章节条底色与文字、朝阳暖橙列表圆点 / H2 侧线 / H1 渐变、优雅复古 H2 下划线均随主题色变化', en: 'More template-theme coupling: Carbon chapter-bar colors, Sunrise list dots / H2 rail / H1 gradient, and Elegant H2 underline all follow the theme color' },
      { zh: '模板细节修复：青线极简 / 朝阳暖橙 / 技术极简列表符号缺失，技术极简列表符号改为圆点并修正对齐，墨纸极简 H2 改浅灰胶囊并去除姓名白线，优雅复古 H1 去斜体', en: 'Template fixes: missing list markers in Azure / Sunrise / Tech, Tech markers switched to dots with fixed alignment, Muji H2 restyled as a light-gray pill (name rule removed), Elegant H1 de-italicized' },
    ],
  },
  {
    version: 'v0.10.0',
    date: '2026-09-04',
    title: { zh: '排版体系数值化与模板精修', en: 'Numeric Typography Controls & Template Refinement' },
    items: [
      { zh: '主题配置数值化：字号（10~30px）与行距（1.2~2.5 倍）改为下拉精调，旧档位数据自动兼容', en: 'Numeric theme controls: font size (10–30 px) and line height (1.2–2.5x) become precise dropdowns, auto-migrating legacy presets' },
      { zh: '字体选项调整：新增苹方、阿里惠普体、Times New Roman，优雅复古与技术极简默认字体同步更新', en: 'Font options updated: PingFang, Alibaba PuHuiTi and Times New Roman added; Elegant and Tech defaults refreshed' },
      { zh: '「现代蓝调」模板重做：蓝色双斜线章节标题、方块列表符、胶囊技术栈标签', en: '"Modern Blue" template redesigned: blue double-slash section titles, square list markers, pill-shaped tech tags' },
      { zh: '全部模板正文两端对齐，列表符号与小节标题严格对齐', en: 'All templates now justify body text with list markers strictly aligned to section titles' },
      { zh: '首页改版：新增工作台、主题与排版、文档导航板块，示例简历展示三栏分栏语法', en: 'Homepage revamp: new Workspace, Theme & Typography and Docs Navigation sections; the sample resume showcases three-column syntax' },
      { zh: '修复首页与模板卡片分栏插件注册方式导致的崩溃', en: 'Fixed a crash caused by how the column plugin was registered on the homepage and template cards' },
      { zh: '更新日志增加日期与最新版本 NEW 标识，下拉菜单支持滚动', en: 'Changelog gains dates and a NEW badge on the latest version; dropdowns become scrollable' },
    ],
  },
  {
    version: 'v0.9.0',
    date: '2026-09-02',
    title: { zh: 'AI 聊天窗与文档系统重构', en: 'AI Chat Window & Docs System Overhaul' },
    items: [
      { zh: 'AI 助手重构为独立聊天窗：流式回复、Telegram 风格气泡、Markdown 渲染与执行状态展示', en: 'AI assistant rebuilt as a standalone chat window: streaming replies, Telegram-style bubbles, Markdown rendering and execution status' },
      { zh: '对话记录按「用户 + 简历」双维度持久化到数据库，重新打开可加载历史', en: 'Chats persist per user + resume; reopening the window reloads history' },
      { zh: '文档系统重构为多子页面（使用指南 / Markdown 教程 / 主题配置 / 图标库 / AI 助手）+ 更新日志', en: 'Docs restructured into subpages (Guide / Markdown / Theme / Icons / AI) plus a changelog' },
      { zh: '编辑器文档改为右侧多 Tab 抽屉，与文档子页面共用内容', en: 'Editor docs become a multi-tab drawer on the right, sharing content with the docs subpages' },
      { zh: '编辑器 UI 全面打磨：全屏预览、主题面板悬浮圆角样式、统一胶囊按钮与线性图标', en: 'Editor UI polish: fullscreen preview, floating rounded theme panel, unified pill buttons and linear icons' },
      { zh: '简历列表新增一键复制（副本）与固定底部页脚（随机哲理句）', en: 'Resume list gains one-click duplication and a fixed footer with a random aphorism' },
      { zh: '修复 Markdown 引用渲染缺失与教程演示样式互相污染的问题', en: 'Fixed missing Markdown quote rendering and style leakage between tutorial demos' },
    ],
  },
  {
    version: 'v0.8.0',
    date: '2026-09-01',
    title: { zh: '文档系统与 AI 聊天窗', en: 'Docs System & AI Chat Window' },
    items: [
      { zh: '编辑器新增右侧文档抽屉，文档内容全面重写', en: 'Editor gains a right-side docs drawer with fully rewritten content' },
      { zh: 'AI 助手重构为独立聊天窗：流式回复、Markdown 渲染、执行状态展示', en: 'AI assistant rebuilt as a standalone chat window: streaming replies, Markdown rendering, execution status' },
      { zh: '对话记录按用户 + 简历持久化到数据库', en: 'Chats persist per user + resume in the database' },
      { zh: '品牌标识统一为 ZENSHEET · 简历，新增网站图标', en: 'Branding unified as ZENSHEET · 简历 with a new favicon' },
    ],
  },
  {
    version: 'v0.7.0',
    date: '2026-09-01',
    title: { zh: '设置中心与账号体系完善', en: 'Settings Center & Account System' },
    items: [
      { zh: '新增设置窗口：账号信息、AI 供应商配置、安全（改用户名 / 邮箱 / 密码）、关于', en: 'New settings window: account info, AI provider config, security (username / email / password) and about' },
      { zh: '头像上传与圆形裁剪，同步显示于编辑页与首页导航', en: 'Avatar upload with circular crop, shown in both editor and home navigation' },
      { zh: '新增文档页面与首页导航入口', en: 'New docs page and home navigation entry' },
    ],
  },
  {
    version: 'v0.6.0',
    date: '2026-09-01',
    title: { zh: '主题面板模板卡片', en: 'Theme Panel Template Cards' },
    items: [
      { zh: '主题面板模板切换改为预览卡片形式，直观对比各模板效果', en: 'Template switching in the theme panel becomes preview cards for easy side-by-side comparison' },
      { zh: '统一模板卡片渲染管线，首页展示、模板库与主题面板渲染一致', en: 'Unified template-card rendering pipeline — homepage, template library and theme panel all render identically' },
    ],
  },
  {
    version: 'v0.5.0',
    date: '2026-09-01',
    title: { zh: '照片排版与图标库', en: 'Photo Layout & Icon Library' },
    items: [
      { zh: '新增简历照片上传与自由摆放：圆形裁剪，放置于页眉或正文任意位置', en: 'Resume photo upload with free placement: circular crop, positionable in the header or anywhere in the body' },
      { zh: '模板库支持移除不使用的模板', en: 'Template library supports removing unused templates' },
      { zh: '新增图标库弹窗，内置图标一目了然', en: 'New icon library modal showcasing all built-in icons at a glance' },
      { zh: '全站统一悬停提示组件，重构编辑器工具栏', en: 'Site-wide unified hover tooltip component; editor toolbar rebuilt' },
    ],
  },
  {
    version: 'v0.4.0',
    date: '2026-08-31',
    title: { zh: '模板库与四套新模板', en: 'Template Library & Four New Templates' },
    items: [
      { zh: '新增模板库弹窗，模板切换与预览集中管理', en: 'New template library modal centralizing template switching and preview' },
      { zh: '新增青线极简、朝阳暖橙、碳黑章标、墨纸极简四套模板（共 8 套）', en: 'Four new templates: Azure, Sunrise, Carbon and Muji (eight in total)' },
      { zh: '优化编辑器 UI 细节', en: 'Editor UI detail improvements' },
    ],
  },
  {
    version: 'v0.3.0',
    date: '2026-08-31',
    title: { zh: '分页预览与图标系统', en: 'Paged Preview & Icon System' },
    items: [
      { zh: '预览重构为 A4 逐页实时分页，所见即所得', en: 'Preview rebuilt as live page-by-page A4 pagination — what you see is what you get' },
      { zh: '新增简历图标系统，Markdown 中以 icon: 语法引用', en: 'New resume icon system referenced via the icon: syntax in Markdown' },
      { zh: 'PDF 导出新增页边距设置，与预览一致', en: 'PDF export gains margin settings matching the preview' },
    ],
  },
  {
    version: 'v0.2.0',
    date: '2026-08-30',
    title: { zh: '编辑器打磨与我的简历', en: 'Editor Polish & My Resumes' },
    items: [
      { zh: '编辑器与预览界面全面打磨', en: 'Editor and preview UI fully polished' },
      { zh: '新增「我的简历」页面，集中管理简历列表', en: 'New "My Resumes" page centralizing resume management' },
      { zh: '修复保存、AI 助手与 PDF 导出流程的问题', en: 'Fixed issues in save, AI assistant and PDF export flows' },
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-08-19',
    title: { zh: '首个公开版本', en: 'First Public Release' },
    items: [
      { zh: 'Markdown 编辑器 + A4 实时分页预览', en: 'Markdown editor + live paginated A4 preview' },
      { zh: '8 套内置模板与主题配置面板', en: 'Eight built-in templates with a theme settings panel' },
      { zh: '简历图标系统与照片排版', en: 'Resume icon system and photo layout' },
      { zh: 'AI 润色、关键词分析、要点成段', en: 'AI polishing, keyword analysis and bullet expansion' },
      { zh: '服务端渲染导出 PDF', en: 'Server-side rendered PDF export' },
    ],
  },
];

/** 免登录在线版（static 分支）：版本号独立计数，与全栈版互不影响 */
const STATIC_CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v0.3.0',
    date: '2026-09-05',
    title: { zh: '全站英语模式', en: 'Site-wide English Mode' },
    tag: { zh: '免登录版', en: 'Login-free' },
    items: [
      { zh: '全站英语模式：导航栏用户信息左侧新增中 / EN 切换按钮，语言偏好保存在本地浏览器', en: 'Site-wide English mode: a new 中 / EN toggle to the left of the user menu in the navbar, with the preference saved locally in your browser' },
      { zh: '界面全量双语：首页、文档中心与全部子文档、更新日志、各弹窗、AI 助手、主题面板、编辑器工具栏与操作提示', en: 'Fully bilingual UI: home page, docs center and all sub-pages, changelog, modals, AI assistant, theme panel, editor toolbars and action toasts' },
      { zh: '示例简历与新建简历默认骨架随语言切换，英文模式下直接展示英文内容', en: 'Sample resume and the default new-resume skeleton switch with the language — English content shown in English mode' },
      { zh: '模板名称与描述、AI 供应商标签、工具栏插入示例随语言适配', en: 'Template names and descriptions, AI provider labels and toolbar insert examples adapt to the selected language' },
      { zh: '错误提示双语化：AI 请求、简历操作等失败信息按当前语言显示', en: 'Bilingual error messages: AI request and resume operation failures are shown in the current language' },
    ],
  },
  {
    version: 'v0.2.0',
    date: '2026-09-05',
    title: { zh: '交互打磨与请作者喝杯咖啡', en: 'Interaction Polish & Buy Me a Coffee' },
    tag: { zh: '免登录版', en: 'Login-free' },
    items: [
      { zh: '新增「请作者喝杯咖啡」入口：微信 / 支付宝收款码一键切换，支持后释放礼花并展示感谢卡片', en: 'New "Buy Me a Coffee" entry: one-tap switch between WeChat / Alipay QR codes, with confetti and a thank-you card after supporting' },
      { zh: '操作提示统一为屏幕顶部中央胶囊样式，反馈更聚焦', en: 'Action feedback unified as a centered top-of-screen pill for more focused cues' },
      { zh: '全部弹窗与侧栏统一关闭动画：模板库、图标库、照片、设置、文档抽屉、主题面板与 AI 助手', en: 'Unified close animations across all modals and side panels: template library, icon library, photo, settings, docs drawer, theme panel and AI assistant' },
      { zh: '保存按钮状态切换过渡动画：文案淡入、成功落定回弹，自动保存同样生效', en: 'Save button state transitions: text fade-in and a success settle bounce — auto-save included' },
      { zh: '全屏预览打开淡入动画，与编辑视图过渡衔接', en: 'Fullscreen preview fades in, transitioning smoothly with the editor view' },
      { zh: '默认用户名改为 ZENSHEET，支持在设置中自定义用户名', en: 'Default username changed to ZENSHEET, customizable in Settings' },
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-09-05',
    title: { zh: '免登录在线版首发', en: 'Login-free Web Edition Debut' },
    tag: { zh: '免登录版', en: 'Login-free' },
    items: [
      { zh: '纯前端版本首发：无需注册登录，打开即用，作为全栈版之外的免登录在线版入口', en: 'Pure-frontend debut: no sign-up or login, open and use — the login-free online edition alongside the full-stack version' },
      { zh: '数据本地化：简历与 AI 对话历史保存在浏览器 IndexedDB，隐私模式自动降级为内存存储', en: 'Local data: resumes and AI chat history live in browser IndexedDB, falling back to in-memory in private mode' },
      { zh: 'PDF 导出改为浏览器打印直出：逐页排版与预览完全一致，不再依赖服务端渲染', en: 'PDF export via browser print: page layout matches the preview exactly, no server rendering needed' },
      { zh: 'AI 助手浏览器直连 OpenAI 兼容供应商：API KEY 自持、保存在本地，对话请求不经服务器', en: 'AI assistant connects directly from your browser to OpenAI-compatible providers: you hold the API KEY locally and requests bypass the server' },
      { zh: '纯静态托管：无后端依赖，可部署于任意静态平台', en: 'Pure static hosting: no backend dependency, deployable to any static platform' },
      { zh: '保留全栈版核心能力：8 套模板、主题微调、Markdown 简历语法、图标库与照片排版', en: 'Keeps the full-stack edition\'s core: eight templates, theme fine-tuning, Markdown resume syntax, icon library and photo layout' },
      { zh: '单个浏览器最多保存 15 份简历', en: 'Up to 15 resumes per browser' },
    ],
  },
];

/** 单个分支的版本时间线，全栈版与免登录版共用 */
function ChangelogTimeline({ versions }: { versions: ChangelogEntry[] }) {
  const tr = useTr();
  return (
    <div className="flex flex-col gap-8">
      {versions.map((v, i) => (
        <section
          key={v.version}
          data-docs-reveal
          className="relative sm:ml-28 pl-6 border-l-2 border-gray-100"
        >
          {/* 时间信息：置于时间线圆点左侧（窄屏时回退到版本号右侧） */}
          <span className="hidden sm:block absolute top-0.5 -left-28 w-24 text-right font-mono text-sm text-gray-500 tabular-nums">
            {v.date}
          </span>
          <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-primary-50" />
          <p className="font-mono text-sm text-primary-600 font-medium">
            {v.version}
            {/* 最新版本标记 NEW */}
            {i === 0 && (
              <span className="ml-2 inline-block align-[1px] rounded-full bg-primary-500 px-1.5 py-px font-sans text-[10px] font-semibold tracking-widest text-white">
                NEW
              </span>
            )}
            {/* 分支标识徽章（如：免登录版） */}
            {v.tag && (
              <span className="ml-2 inline-block align-[1px] rounded-full bg-emerald-500 px-1.5 py-px font-sans text-[10px] font-semibold tracking-widest text-white">
                {tr(v.tag)}
              </span>
            )}
            <span className="sm:hidden ml-2.5 text-gray-500 font-normal">{v.date}</span>
          </p>
          <p className="font-semibold text-gray-900 mt-1">{tr(v.title)}</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1 text-[13px] text-gray-500 leading-relaxed">
            {v.items.map((it) => (
              <li key={it.zh}>{tr(it)}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function ChangelogPage() {
  const tr = useTr();
  return (
    <DocsLayout>
      <DocSectionHeader no="CHANGELOG" title={tr({ zh: '更新日志', en: 'Changelog' })} desc={tr({ zh: 'ZENSHEET · 简历 的版本演进记录。', en: 'The version history of ZENSHEET · Resume.' })} />

      {/* 免登录在线版（static 分支）：版本号独立计数 */}
      <div data-docs-reveal className="mb-8">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2.5">
          {tr({ zh: '免登录在线版', en: 'Login-free Web Edition' })}
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 font-sans text-[10px] font-semibold tracking-widest text-white">
            {tr({ zh: '免登录版', en: 'Login-free' })}
          </span>
        </h2>
        <p className="text-[13px] text-gray-500 mt-1">
          {tr({ zh: '纯前端版本，无需注册登录、打开即用；版本号独立计数，不随全栈版演进。', en: 'A pure-frontend edition — no sign-up, open and use. Version numbers are counted independently of the full-stack edition.' })}
        </p>
      </div>
      <ChangelogTimeline versions={STATIC_CHANGELOG} />

      {/* 全栈版 */}
      <div data-docs-reveal className="mt-14 mb-8">
        <h2 className="text-lg font-bold tracking-tight">{tr({ zh: '全栈版', en: 'Full-stack Edition' })}</h2>
        <p className="text-[13px] text-gray-500 mt-1">
          {tr({ zh: '支持注册登录与账号体系的服务端版本，功能最完整。', en: 'The server-side edition with accounts and sign-in — the most feature-complete.' })}
        </p>
      </div>
      <ChangelogTimeline versions={CHANGELOG} />
    </DocsLayout>
  );
}
