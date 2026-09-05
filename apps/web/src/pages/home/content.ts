import type { Bi } from '@/i18n/LangContext';

/** 首页文案与展示数据：与 HomePage 的 section JSX 分离，便于统一维护 */

/* ============ 模板展示区 ============ */

/** 模板展示区数据：span 为 3 列网格中的占位格数（每行合计 3），name/desc 为双语文案 */
export const TEMPLATE_SHOWCASE = [
  { id: 'classic', tag: 'CLASSIC', name: { zh: '经典简洁', en: 'Classic' }, desc: { zh: '黑白正式，适合大多数求职场景', en: 'Black-and-white formality for most job hunts' }, span: 2 },
  { id: 'modern', tag: 'MODERN', name: { zh: '现代蓝调', en: 'Modern Blue' }, desc: { zh: '互联网与产品岗位首选', en: 'A favorite for tech and product roles' }, span: 1 },
  { id: 'elegant', tag: 'ELEGANT', name: { zh: '优雅酒红', en: 'Elegant Wine' }, desc: { zh: '咨询、金融与品牌岗位', en: 'For consulting, finance and brand roles' }, span: 1 },
  { id: 'tech', tag: 'TECH', name: { zh: '科技墨绿', en: 'Tech Green' }, desc: { zh: '研发与技术岗位', en: 'For R&D and engineering roles' }, span: 1 },
  { id: 'muji', tag: 'MUJI', name: { zh: '墨纸极简', en: 'Muji Minimal' }, desc: { zh: '深色题头，沉稳耐看', en: 'Dark header, calm and enduring' }, span: 1 },
  { id: 'azure', tag: 'AZURE', name: { zh: '青线极简', en: 'Azure Line' }, desc: { zh: '细线标题，素净轻盈', en: 'Thin-line headings, clean and light' }, span: 1 },
  { id: 'sunrise', tag: 'SUNRISE', name: { zh: '朝阳暖橙', en: 'Sunrise Orange' }, desc: { zh: '渐变题头，明快有活力', en: 'Gradient header, bright and energetic' }, span: 1 },
  { id: 'carbon', tag: 'CARBON', name: { zh: '碳黑章标', en: 'Carbon Seal' }, desc: { zh: '灰底章节条 + 竖标，正式商务风', en: 'Gray section bars + vertical marks, formal business style' }, span: 1 },
] as const;

/* ============ 规格条 ============ */

export const SPECS: { value: string; unit: string; label: Bi }[] = [
  { value: 'A4', unit: 'REAL-TIME PREVIEW', label: { zh: '逐页实时预览，所见即所得', en: 'Page-by-page live preview, WYSIWYG' } },
  { value: 'MD', unit: 'MARKDOWN FIRST', label: { zh: '专注内容，排版交给模板', en: 'Focus on content, templates handle the layout' } },
  { value: 'AI', unit: 'BYOK ASSISTANT', label: { zh: '自带密钥，多供应商接入', en: 'Bring your own key, multiple providers' } },
  { value: 'PDF', unit: 'PRINT READY', label: { zh: '导出与预览完全一致', en: 'Export matches the preview exactly' } },
];

/* ============ 三步成稿 ============ */

export const STEPS: { no: string; tag: string; title: Bi; desc: Bi }[] = [
  {
    no: '01',
    tag: 'WRITE',
    title: { zh: '用 Markdown 写内容', en: 'Write content in Markdown' },
    desc: { zh: '左侧书写，右侧实时预览。专注文字本身，排版交给模板。', en: 'Write on the left, live preview on the right. Focus on the words; templates handle the layout.' },
  },
  {
    no: '02',
    tag: 'REFINE',
    title: { zh: '让 AI 打磨表达', en: 'Let AI polish your wording' },
    desc: { zh: '聊天窗内逐段润色经历，对照职位描述匹配关键词，补齐缺失亮点。', en: 'Polish experiences paragraph by paragraph in the chat, match keywords against the job description and fill in missing highlights.' },
  },
  {
    no: '03',
    tag: 'EXPORT',
    title: { zh: '一键导出 PDF', en: 'Export PDF in one click' },
    desc: { zh: '桌面端浏览器打印直出，字距分页与预览一致；微信等手机环境自动改为本机生成 PDF，随时下载分享。', en: 'Printed straight from your browser on desktop; on WeChat and other mobile browsers the PDF is generated on-device, ready to download or share.' },
  },
];

/* ============ 编辑器工作台 ============ */

/** 编辑器工作台：特性文案（双语） */
export const WORKSPACE_FEATURES: { title: Bi; desc: Bi }[] = [
  { title: { zh: '三栏工作台', en: 'Three-pane workspace' }, desc: { zh: '编辑器、预览、AI 聊天窗一字排开，拖拽手柄自由分配宽度', en: 'Editor, preview and AI chat side by side, with drag handles to resize freely' } },
  { title: { zh: '全屏预览', en: 'Fullscreen preview' }, desc: { zh: '一键隐藏其余面板并复位缩放，逐页检查每一处细节', en: 'Hide the other panels and reset zoom in one click, checking every detail page by page' } },
  { title: { zh: '悬浮主题面板', en: 'Floating theme panel' }, desc: { zh: '主色、字体、间距随手可调，不遮挡预览内容', en: 'Adjust primary color, font and spacing anytime without covering the preview' } },
  { title: { zh: '文档抽屉', en: 'Docs drawer' }, desc: { zh: '写作中随时唤出使用文档，跨文档内容一键跳转', en: 'Open the docs anytime while writing and jump across documents in one click' } },
];

/* ============ AI 能力区 ============ */

/** AI 聊天窗卖点（双语） */
export const AI_CHAT_FEATURES: Bi[] = [
  { zh: '独立聊天窗 · 流式回复 · Markdown 渲染', en: 'Standalone chat window · streaming replies · Markdown rendering' },
  { zh: '对话历史保存在本地浏览器，随时继续上次话题', en: 'Chat history is saved in your local browser, so you can pick up where you left off anytime' },
  { zh: '自带 API KEY（BYOK），密钥仅保存在本地浏览器', en: 'Bring your own API key (BYOK); keys are stored only in your local browser' },
];

/** AI 供应商（API KEY 由用户自备，展示名双语） */
export const AI_PROVIDERS: Bi[] = [
  { zh: 'OpenAI', en: 'OpenAI' },
  { zh: 'DeepSeek', en: 'DeepSeek' },
  { zh: 'GLM（智谱）', en: 'GLM (Zhipu)' },
  { zh: 'Qwen（通义千问）', en: 'Qwen' },
  { zh: 'LongCat', en: 'LongCat' },
  { zh: 'MiMo（小米）', en: 'Xiaomi MiMo' },
];

export const AI_CAPABILITIES: { no: string; title: Bi; desc: Bi }[] = [
  {
    no: '01',
    title: { zh: '经历润色', en: 'Experience polishing' },
    desc: { zh: '把「负责xx工作」改写成有结果、有数字的表述', en: 'Turn "responsible for X" into results-driven statements with numbers' },
  },
  {
    no: '02',
    title: { zh: '关键词匹配', en: 'Keyword matching' },
    desc: { zh: '粘贴职位描述，找出简历中缺失的能力词', en: 'Paste a job description and find the skill keywords missing from your resume' },
  },
  {
    no: '03',
    title: { zh: '要点成段', en: 'Bullets into paragraphs' },
    desc: { zh: '输入几个要点，生成结构完整的项目描述', en: 'Enter a few bullet points and get a well-structured project description' },
  },
];

/* ============ 主题与排版区 ============ */

/** 主题配置卖点（双语） */
export const THEME_FEATURES: { title: Bi; desc: Bi }[] = [
  { title: { zh: '主色调 × 正文字体', en: 'Primary color × body font' }, desc: { zh: '多种主色与正文字体自由组合，风格一键切换', en: 'Freely combine primary colors and body fonts, switching styles in one click' } },
  { title: { zh: '字号与行距微调', en: 'Font size & line-height tuning' }, desc: { zh: '字号 10~30px、行距 1.2~2.5 倍自由选择，密度随心', en: 'Choose any font size from 10–30px and line height from 1.2–2.5×, density as you like' } },
  { title: { zh: '页边距独立可调', en: 'Independent margin control' }, desc: { zh: '页边距与内容边距叠加生效，导出与预览严格一致', en: 'Page margins stack with content padding; export matches the preview exactly' } },
  { title: { zh: '照片自由排版', en: 'Flexible photo layout' }, desc: { zh: '上传照片圆形裁剪，放在页眉或正文任意位置', en: 'Upload photos with circular cropping, placed anywhere in the header or body' } },
];

/** 首页图标展示区：真实渲染的内置图标 */
export const HOME_ICONS = ['email', 'phone', 'github', 'blog', 'location', 'weixin', 'zhihu', 'juejin'];

/* ============ 文档导航 ============ */

/** 文档导航卡（标题/描述双语） */
export const DOC_CARDS: { no: string; title: Bi; desc: Bi; to: string }[] = [
  { no: '01', title: { zh: '使用指南', en: 'Guide' }, desc: { zh: '从创建简历到导出的完整流程', en: 'The full flow from creating a resume to export' }, to: '/docs/guide' },
  { no: '02', title: { zh: 'Markdown 教程', en: 'Markdown Tutorial' }, desc: { zh: '常用语法与效果预览', en: 'Common syntax with rendered previews' }, to: '/docs/markdown' },
  { no: '03', title: { zh: '主题配置', en: 'Theme Configuration' }, desc: { zh: '模板与排版设置详解', en: 'Templates and typography settings explained' }, to: '/docs/theme' },
  { no: '04', title: { zh: '图标库', en: 'Icon Library' }, desc: { zh: 'icon: 语法与内置图标', en: 'The icon: syntax and built-in icons' }, to: '/docs/icons' },
  { no: '05', title: { zh: 'AI 助手', en: 'AI Assistant' }, desc: { zh: '用法与 API KEY 配置', en: 'Usage and API key setup' }, to: '/docs/ai' },
  { no: '06', title: { zh: '更新日志', en: 'Changelog' }, desc: { zh: '版本演进记录', en: 'Release history over time' }, to: '/docs/changelog' },
];
