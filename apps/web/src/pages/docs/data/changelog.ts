import type { Bi } from '@/i18n/LangContext';

/** 版本更新日志数据：CHANGELOG 为全栈版（master），STATIC_CHANGELOG 为免登录在线版（static，版本号独立计数） */
/* ============ 更新日志 ============ */

export type ChangelogEntry = {
  version: string;
  date: string;
  title: Bi;
  /** 分支标识徽章（如：免登录版），无则为普通全栈版条目 */
  tag?: Bi;
  items: Bi[];
};

export const CHANGELOG: ChangelogEntry[] = [
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
export const STATIC_CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v0.5.0',
    date: '2026-09-05',
    title: { zh: '渲染性能与代码质量优化', en: 'Rendering Performance & Code Quality' },
    tag: { zh: '免登录版', en: 'Login-free' },
    items: [
      { zh: '编辑器渲染性能优化：弹窗开关状态合并管理、操作提示独立更新，不再因提示弹出而重渲染全部界面；简历数据上下文不再随键入重建，长文档输入更跟手', en: 'Editor rendering performance: modal states merged and toasts isolated so popups no longer re-render the whole UI; the resume context no longer rebuilds on every keystroke, keeping long documents smooth' },
      { zh: '全站弹窗关闭行为统一为共享逻辑：外部点击、Esc 关闭与关闭动画走同一套 Hook，各弹窗表现更一致', en: 'Unified modal dismissal site-wide: outside clicks, Esc and close animations now share one hook for consistent behavior' },
      { zh: '全站动画定义收敛到统一样式文件，单一入口维护；偏好减弱动效的用户继续自动跳过', en: 'All animation definitions consolidated into a single stylesheet for one-place maintenance; reduced-motion users are still skipped automatically' },
      { zh: '界面组件模块化重构：顶栏、文档子页与首页拆分为独立模块与数据文件，不改变任何界面与功能', en: 'Modular refactoring of UI code: top bar, docs sub-pages and home page split into standalone modules and data files — with no visual or functional changes' },
    ],
  },
  {
    version: 'v0.4.1',
    date: '2026-09-05',
    title: { zh: '手机端 PDF 导出', en: 'Mobile PDF Export' },
    tag: { zh: '免登录版', en: 'Login-free' },
    items: [
      { zh: '修复手机端导出无反应：微信 / QQ 等内置浏览器与 iOS 第三方浏览器不再依赖打印窗口，自动改为本机逐页截图生成 PDF', en: 'Fixed mobile export doing nothing: in-app browsers (WeChat / QQ, etc.) and third-party iOS browsers now generate the PDF on-device page by page instead of relying on the print dialog' },
      { zh: '生成的 PDF 按 A4 逐页组装，2 倍采样保证清晰度，完成后直接下载或唤起系统分享（可存到「文件」）', en: 'The PDF is assembled page by page at A4 size with 2x sampling for clarity, then downloaded or shared via the system sheet (savable to Files)' },
      { zh: '桌面与支持打印的移动浏览器保持打印导出（矢量文字、体积更小）；截图与 PDF 组件按需加载，不影响首屏', en: 'Desktop and print-capable mobile browsers keep the print export (vector text, smaller files); the capture & PDF libraries load on demand without affecting first paint' },
      { zh: '新增 README 英文版与免登录版 / 全栈版对比介绍', en: 'Added an English README with a login-free vs full-stack edition comparison' },
    ],
  },
  {
    version: 'v0.4.0',
    date: '2026-09-05',
    title: { zh: '手机端全面适配', en: 'Full Mobile Support' },
    tag: { zh: '免登录版', en: 'Login-free' },
    items: [
      { zh: '编辑器手机单列布局：编辑 / 预览分段切换（切换不丢失输入），AI 助手改为全屏覆盖，保存 / 导出 / 模板等功能收进汉堡折叠菜单，Coffee 快捷入口置于汉堡左侧', en: 'Single-column editor on mobile: Edit / Preview segmented toggle (typing is kept on switch), fullscreen AI assistant, all actions folded into a hamburger menu with a Coffee shortcut beside it' },
      { zh: '首页与编辑器导航栏窄屏折叠：汉堡按钮展开下拉菜单收纳全部入口，当前页高亮，点击外部 / Esc 关闭', en: 'Collapsing navbars on narrow screens: a hamburger button expands a dropdown holding every entry, with the current page highlighted, closing on outside click or Esc' },
      { zh: '弹窗全面适配小屏：用户信息、模板库、图标库与 AI 助手窗口手机端不再溢出，模板卡片保证预览与按钮完整展示，列表可滚动', en: 'Modals fully adapted for small screens: user settings, template library, icon library and AI assistant no longer overflow on mobile, with template cards fully visible and scrollable lists' },
      { zh: '预览滚动体验：滚动条按缩放后的视觉宽度自适应——窗口更宽时无水平滚动条且纸张居中，更窄时出滚动条并初始定位到页面中部', en: 'Preview scrolling: scrollbars adapt to the visually scaled width — no horizontal bar and a centered sheet on wide windows, with the scroll position centered on narrower ones' },
      { zh: '简历名称行内编辑加入进入 / 退出过渡动画，输入框宽度随内容平滑变化', en: 'Inline resume renaming gained enter / exit transitions, with the input width easing as you type' },
      { zh: '中英文切换按钮悬浮提示与编辑器统一为气泡样式', en: 'The language toggle now shares the editor\'s bubble-style hover tip' },
      { zh: '修复：手机端折叠菜单项无法点击、模板库手机端显示不完全等问题', en: 'Fixed: folded menu items not clickable on mobile and the template library being cut off on small screens' },
    ],
  },
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

