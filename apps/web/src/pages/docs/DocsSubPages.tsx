import { createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import { DocBlock, DocSectionHeader, DocsLayout } from './DocsLayout';
import { MdDemo } from './MdDemo';
import { BUILTIN_ICONS } from '@/preview/resumeIcons';

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

const QUICK_STEPS = [
  { no: 'STEP 1', title: '打开即用', desc: '免注册登录，打开网站即可使用；简历与配置仅保存在当前浏览器本地。可在导航栏点击用户名打开设置。' },
  { no: 'STEP 2', title: '创建简历', desc: '进入「我的简历」页面，点击新建简历，会得到一份示例内容，随后在编辑器中替换为自己的经历。' },
  { no: 'STEP 3', title: '编辑内容', desc: '左侧为 Markdown 编辑器，右侧实时预览。使用标题、列表、分栏等语法组织内容，详见《Markdown 简历教程》。' },
  { no: 'STEP 4', title: '调样式并导出', desc: '通过「主题」面板选择模板与视觉风格；完成后点击右上角「导出 PDF」即可下载，效果与预览逐页一致。' },
];

const GUIDE_LINKS = [
  { to: '/docs/markdown', no: '02', title: 'Markdown 简历教程', desc: '标题、强调、列表、引用、分栏等常用语法与效果预览' },
  { to: '/docs/theme', no: '03', title: '主题配置', desc: '模板切换、视觉风格与页面布局的各项设置与注意事项' },
  { to: '/docs/icons', no: '04', title: '图标库', desc: 'icon:语法、图标库的使用方式与常用图标一览' },
  { to: '/docs/ai', no: '05', title: 'AI 助手', desc: '润色、关键词分析、要点成段，以及 API KEY 的获取与配置' },
];

/** 使用指南正文（文档页与编辑器抽屉共用） */
export function GuideContent() {
  return (
    <>
      <DocBlock title="快速开始" desc="四步完成第一份简历：">
        <ol className="flex flex-col gap-4">
          {QUICK_STEPS.map((s) => (
            <li key={s.no} className="flex gap-4 rounded-xl border border-gray-200 p-4">
              <span className="font-mono text-[11px] uppercase tracking-widest text-primary-600 shrink-0 pt-0.5">
                {s.no}
              </span>
              <div>
                <p className="font-medium text-gray-900">{s.title}</p>
                <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </DocBlock>

      <DocBlock title="编辑器布局" desc="编辑页面自左向右分为四个区域，均可拖拽中间的分隔手柄调整宽度：">
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ['编辑器', 'Markdown 源码编辑区，工具栏提供模板库、照片、图标、文档等快捷入口'],
            ['实时预览', 'A4 纸张逐页渲染，与导出 PDF 效果一致；顶栏可缩放与全屏'],
            ['主题面板', '点击预览顶栏「主题」打开，切换模板、配色、字体与页边距'],
            ['AI 聊天窗', '点击顶栏「AI 助手」在预览右侧展开，支持流式回复与历史记录'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900 text-sm">{t}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{d}</p>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock title="进阶教程" desc="完成基础流程后，按需阅读以下教程：">
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
                {l.title} →
              </p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{l.desc}</p>
            </DocPageLink>
          ))}
        </div>
      </DocBlock>
    </>
  );
}

export function GuidePage() {
  return (
    <DocsLayout>
      <DocSectionHeader
        no="01 · GUIDE"
        title="使用指南"
        desc="本页介绍从创建简历到导出 PDF 的完整使用流程，并汇总其余教程文档的入口。"
      />
      <GuideContent />
    </DocsLayout>
  );
}

/* ============ 02 Markdown 简历教程 ============ */

/** Markdown 简历教程正文（文档页与编辑器抽屉共用） */
export function MarkdownDocContent() {
  return (
    <>
      <DocBlock title="标题" desc="使用 # 号表示标题层级：# 一级标题（姓名）、## 二级标题（章节）、### 三级标题（条目）：">
        <MdDemo
          title="标题示例"
          code={'# 沈亦南\n\n## 教育背景\n\n### 某某大学 · 计算机科学与技术\n\n#### 2021.09 – 2025.06'}
        />
      </DocBlock>

      <DocBlock title="强调" desc="粗体突出关键成果，斜体用于补充说明，行内代码适合技术名词：">
        <MdDemo
          title="强调示例"
          code={'**主导核心模块重构**，QPS 提升 *3 倍*，沉淀了 `go-zero` 微服务框架实践'}
        />
      </DocBlock>

      <DocBlock title="列表" desc="无序列表罗列职责要点，有序列表强调步骤或时间顺序：">
        <MdDemo
          title="列表示例"
          code={'- 负责订单服务的稳定性建设\n- 推动 CI/CD 流程落地\n\n1. 需求评审\n2. 方案设计\n3. 上线复盘'}
        />
      </DocBlock>

      <DocBlock title="引用" desc="引用块适合放自我评价或一句话总结，预览中渲染为左侧竖线 + 缩进样式：">
        <MdDemo title="引用示例" code={'> 三年后端开发经验，专注高并发与稳定性，主导过日千万级订单系统的架构演进。'} />
      </DocBlock>

      <DocBlock title="分割线" desc="三个短横线渲染为水平分割线，用于章节之间留白分隔：">
        <MdDemo title="分割线示例" code={'## 工作经历\n\n---\n\n## 项目经验'} />
      </DocBlock>

      <DocBlock
        title="左中右分栏"
        desc=":::left / :::mid / :::right 三种容器连续书写时并排渲染，适合页眉的姓名 + 职位 + 联系方式排版；两栏同样有效："
      >
        <MdDemo
          title="三栏分款示例"
          code={':::left\n**沈亦南**\n:::\n\n:::mid\n后端工程师\n:::\n\n:::right\nicon:phone 138-0000-0000\n:::'}
        />
        <MdDemo
          title="两栏分款示例"
          code={':::left\nicon:email shen@example.com\n:::\n\n:::right\nicon:github github.com/shen\n:::'}
        />
      </DocBlock>

      <DocBlock title="图标" desc="正文中使用 icon:名称 即可插入简历图标，详见《图标库》：">
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <p>
            写法：<code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs">icon:github</code>
            ，渲染为 <span className="text-primary-600">内置 SVG 图标</span>
            ，颜色跟随文字、尺寸跟随字号。
          </p>
          <DocPageLink
            to="/docs/icons"
            className="inline-block mt-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            查看图标库教程 →
          </DocPageLink>
        </div>
      </DocBlock>
    </>
  );
}

export function MarkdownDocPage() {
  return (
    <DocsLayout>
      <DocSectionHeader
        no="02 · MARKDOWN"
        title="Markdown 简历教程"
        desc="编辑器支持的常用语法速查，每个语法均附使用示例与实时渲染的效果预览。"
      />
      <MarkdownDocContent />
    </DocsLayout>
  );
}

/* ============ 03 主题配置 ============ */

/** 主题配置正文（文档页与编辑器抽屉共用） */
export function ThemeDocContent() {
  return (
    <>
      <DocBlock title="模板" desc="内置 8 套模板，以真实内容的预览卡片呈现，最多同屏 4 张，超出可滚动查看（带吸附）：">
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>切换模板只改变排版与配色，<b>简历内容始终保留</b>，可放心试遍所有模板。</li>
            <li>当前模板以主题色描边标识，点击卡片即完成切换。</li>
          </ul>
        </div>
      </DocBlock>

      <DocBlock title="视觉风格" desc="六种主色调与五种正文字体，奠定简历的第一印象：">
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>主色影响标题、分隔线、图标等强调元素的配色。</li>
          </ul>
        </div>
      </DocBlock>

      <DocBlock title="字号与行距" desc="独立分组精调排版：H1~H5、段落与列表字号分别可调，行距自由选择：">
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>字号按 H1 ~ H5、段落、列表分别设置（10 ~ 30 px，H1 可调至 40 px）：未调整的类别按默认字号渲染（H1 30 px、H2 20 px，其余 14 px），下拉中带「默认」标识；行距在 1.2 ~ 2.5 倍间选择，同时影响段落与条目的垂直留白，建议先选模板再微调。</li>
          </ul>
        </div>
      </DocBlock>

      <DocBlock
        title="页面布局"
        desc="左右与上下页边距独立可调（含「无」档位），另有内容边距控制正文与页面边缘的距离："
      >
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>页面留白 = 页边距 + 内容边距，两者叠加生效，导出 PDF 与预览严格一致。</li>
            <li>选择「无」页边距可获得整页出血式的排版自由度。</li>
          </ul>
        </div>
      </DocBlock>

      <DocBlock title="注意事项">
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-[13px] text-amber-800 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>切换模板后，视觉风格与页面布局会重置为新模板的默认值，建议确定模板后再做微调。</li>
            <li>主题面板为悬浮卡片，不影响预览内容的滚动；再次点击「主题」或按 Esc 可关闭。</li>
            <li>所有改动实时保存到草稿，无需手动确认。</li>
          </ul>
        </div>
      </DocBlock>
    </>
  );
}

export function ThemeDocPage() {
  return (
    <DocsLayout>
      <DocSectionHeader
        no="03 · THEME"
        title="主题配置"
        desc="点击预览窗口顶栏的「主题」按钮打开主题面板，分三组设置：模板、视觉风格与页面布局。"
      />
      <ThemeDocContent />
    </DocsLayout>
  );
}

/* ============ 04 图标库 ============ */

const ICON_LABELS: Record<string, string> = {
  info: '用户', location: '地址', github: 'GitHub', email: '邮箱', phone: '电话',
  blog: '博客', juejin: '掘金', weixin: '微信', zhihu: '知乎', csdn: 'CSDN',
  school: '学历', work: '工作', award: '奖项', calendar: '日期', cake: '生日',
  link: '链接', globe: '网站', idcard: '证件', star: '亮点',
};

/** 图标库正文（文档页与编辑器抽屉共用） */
export function IconsDocContent() {
  return (
    <>
      <DocBlock title="使用方式" desc="三种方式，任选其一：">
        <ol className="flex flex-col gap-3">
          {[
            ['直接书写语法', '在编辑器任意位置输入 icon:名称（如 icon:phone），预览立即渲染为图标。'],
            ['图标库复制', '点击编辑器顶栏「图标」打开图标库，点击图标即复制语法，粘贴到编辑器即可；窗口底部有复制反馈。'],
            ['自定义图标', '在图标库底部输入框粘贴任意 SVG 代码并命名，即可通过 icon:你的名称 使用。'],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3 rounded-xl border border-gray-200 p-4">
              <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-gray-900 text-sm">{t}</p>
                <p className="text-[13px] text-gray-500 leading-relaxed mt-0.5">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </DocBlock>

      <DocBlock title="常用图标" desc={`共 ${Object.keys(BUILTIN_ICONS).length} 个内置图标，鼠标悬停可查看对应的 icon: 名称：`}>
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
              <span className="text-[11px] text-gray-500">{ICON_LABELS[name] ?? ''}</span>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock title="注意事项">
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-[13px] text-amber-800 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>名称支持字母数字下划线与连字符，须以字母开头，例如 icon:my_icon_2。</li>
            <li>图标继承所在文字的颜色与字号，放在粗体标题中会随标题加粗放大。</li>
            <li>分栏容器中使用图标可排出页眉联系方式行，参考《Markdown 简历教程》。</li>
          </ul>
        </div>
      </DocBlock>
    </>
  );
}

export function IconsDocPage() {
  return (
    <DocsLayout>
      <DocSectionHeader
        no="04 · ICONS"
        title="图标库"
        desc="在简历中插入矢量图标：颜色跟随文字、尺寸跟随字号，导出 PDF 同样清晰。"
      />
      <IconsDocContent />
    </DocsLayout>
  );
}

/* ============ 05 AI 助手 ============ */

const AI_PROVIDERS = [
  { name: 'OpenAI', url: 'https://platform.openai.com', key: 'API Keys 页面创建 Secret Key' },
  { name: 'DeepSeek', url: 'https://platform.deepseek.com', key: 'API Keys 页面创建' },
  { name: 'GLM（智谱）', url: 'https://open.bigmodel.cn', key: '开放平台 → API Keys' },
  { name: 'Qwen（通义千问）', url: 'https://qwen.ai/home', key: '官网 → API Key 控制台创建' },
  { name: 'LongCat', url: 'https://longcat.chat', key: '官网 → 开放平台获取并注意模型名' },
  { name: 'Xiaomi MiMo', url: 'https://mimo.mi.com/', key: '开放平台 → API Keys 创建' },
];

/** AI 助手正文（文档页与编辑器抽屉共用） */
export function AIDocContent() {
  return (
    <>
      <DocBlock title="三种能力" desc="窗口空状态提供快捷指令，也可自由提问：">
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            ['润色全文', '优化表达与排版结构，让内容更专业、更有说服力'],
            ['关键词分析', '对照目标岗位提炼简历关键词覆盖情况与改进建议'],
            ['要点成段', '把零散的经历要点扩写为完整、有细节的段落'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900 text-sm">{t}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{d}</p>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock
        title="配置 API KEY"
        desc="AI 助手使用你自己的模型密钥（BYOK），点击导航栏用户名 → 设置 → AI 完成配置："
      >
        <ol className="flex flex-col gap-3">
          {[
            '打开设置：点击导航栏头像 / 用户名，进入「设置」窗口的「AI」分类。',
            '选择供应商：内置 OpenAI、DeepSeek、GLM、Qwen、LongCat、MiMo，也支持自定义 OpenAI 兼容协议地址。',
            '填写 API KEY：不同供应商的 KEY 独立保存，互不影响；模型列表点击「获取模型」自动拉取，失败时可手动输入模型名。',
            '保存并测试：回到 AI 聊天窗发送消息即可；消息上方的「AI 执行」可展开查看执行步骤与错误详情。',
          ].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-gray-200 p-4">
              <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-[13px] text-gray-600 leading-relaxed">{s}</p>
            </li>
          ))}
        </ol>
      </DocBlock>

      <DocBlock title="供应商入口" desc="各供应商 API KEY 的申请入口：">
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                <th className="px-4 py-2.5 font-medium">供应商</th>
                <th className="px-4 py-2.5 font-medium">官网 / 控制台</th>
                <th className="px-4 py-2.5 font-medium">KEY 获取</th>
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
                  <td className="px-4 py-2.5 text-gray-500">{p.key}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocBlock>

      <DocBlock title="注意事项">
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-[13px] text-amber-800 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>API KEY 仅保存在你自己的浏览器中，对话请求由浏览器直连你选择的供应商，本站不经手、不存储任何数据。</li>
            <li>对话记录按简历维度保存在本地浏览器，切换简历互不串扰，关闭窗口后重新打开可继续。</li>
            <li>部分供应商未开放浏览器跨域访问时「获取模型」会失败，此时可手动输入模型名称；对话请求不受影响。</li>
            <li>生成中可点击「停止」中断；未配置模型时会给出明确提示。</li>
          </ul>
        </div>
      </DocBlock>
    </>
  );
}

export function AIDocPage() {
  return (
    <DocsLayout>
      <DocSectionHeader
        no="05 · AI ASSISTANT"
        title="AI 助手"
        desc="点击编辑器顶栏「AI 助手」按钮，在预览右侧展开聊天窗口，对当前简历进行润色与分析。"
      />
      <AIDocContent />
    </DocsLayout>
  );
}

/* ============ 更新日志 ============ */

type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  /** 分支标识徽章（如：免登录版），无则为普通全栈版条目 */
  tag?: string;
  items: string[];
};

const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v0.12.0',
    date: '2026-09-04',
    title: '自定义主色与全站统一页脚',
    items: [
      '主色调新增「自定义颜色」：圆角矩形调色盘（饱和度 / 明度二维取色、色相滑杆、HEX 输入），选色实时生效',
      '主色色板扩充至 11 色：新增孟菲斯色系代表色（亮黄 / 珊瑚红 / 玫粉 / 青蓝 / 湖水绿），与原 6 色无相近重复',
      '编辑器新增选中文字悬浮工具栏：鼠标释放后浮现于选区上方（空间不足自动翻转），工具与顶栏一致，滚动实时跟随',
      '新增全站统一三栏页脚（相关资源 / 文档 / 联系），联系栏含 QQ 群二维码入口；首页与文档页共用，文档页为深色变体、首页保持浅色',
      '简历创建份数上限 15 份：达上限后「新建 / 复制」入口禁用并提示引导，后端同步强制校验',
      '项目文档规范化：README 重写为专业开源项目格式（徽章 / 目录 / 分组功能列表 / 贡献指南），补齐 MIT LICENSE 文件',
    ],
  },
  {
    version: 'v0.11.0',
    date: '2026-09-04',
    title: '字号分类设置与模板主题联动',
    items: [
      '主题配置新增独立「字号与行距」分组，H1 ~ H5、段落、列表字号分别设置（10 ~ 30 px，H1 可调至 40 px），默认字号以「默认」徽章标识，支持一键重置',
      '分类字号默认值：H1 30 px、H2 20 px、H3/H4/H5 与段落列表 14 px，预览、模板卡片与 PDF 导出三端一致',
      '主题面板精修：顶栏固定不随滚动、重置按钮胶囊化并优化配色、模板预览放大适应卡片',
      '全站下拉菜单方向自适应：下方空间不足时自动向上展开',
      '多模板主色调联动增强：碳黑章标章节条底色与文字、朝阳暖橙列表圆点 / H2 侧线 / H1 渐变、优雅复古 H2 下划线均随主题色变化',
      '模板细节修复：青线极简 / 朝阳暖橙 / 技术极简列表符号缺失，技术极简列表符号改为圆点并修正对齐，墨纸极简 H2 改浅灰胶囊并去除姓名白线，优雅复古 H1 去斜体',
    ],
  },
  {
    version: 'v0.10.0',
    date: '2026-09-04',
    title: '排版体系数值化与模板精修',
    items: [
      '主题配置数值化：字号（10~30px）与行距（1.2~2.5 倍）改为下拉精调，旧档位数据自动兼容',
      '字体选项调整：新增苹方、阿里惠普体、Times New Roman，优雅复古与技术极简默认字体同步更新',
      '「现代蓝调」模板重做：蓝色双斜线章节标题、方块列表符、胶囊技术栈标签',
      '全部模板正文两端对齐，列表符号与小节标题严格对齐',
      '首页改版：新增工作台、主题与排版、文档导航板块，示例简历展示三栏分栏语法',
      '修复首页与模板卡片分栏插件注册方式导致的崩溃',
      '更新日志增加日期与最新版本 NEW 标识，下拉菜单支持滚动',
    ],
  },
  {
    version: 'v0.9.0',
    date: '2026-09-02',
    title: 'AI 聊天窗与文档系统重构',
    items: [
      'AI 助手重构为独立聊天窗：流式回复、Telegram 风格气泡、Markdown 渲染与执行状态展示',
      '对话记录按「用户 + 简历」双维度持久化到数据库，重新打开可加载历史',
      '文档系统重构为多子页面（使用指南 / Markdown 教程 / 主题配置 / 图标库 / AI 助手）+ 更新日志',
      '编辑器文档改为右侧多 Tab 抽屉，与文档子页面共用内容',
      '编辑器 UI 全面打磨：全屏预览、主题面板悬浮圆角样式、统一胶囊按钮与线性图标',
      '简历列表新增一键复制（副本）与固定底部页脚（随机哲理句）',
      '修复 Markdown 引用渲染缺失与教程演示样式互相污染的问题',
    ],
  },
  {
    version: 'v0.8.0',
    date: '2026-09-01',
    title: '文档系统与 AI 聊天窗',
    items: [
      '编辑器新增右侧文档抽屉，文档内容全面重写',
      'AI 助手重构为独立聊天窗：流式回复、Markdown 渲染、执行状态展示',
      '对话记录按用户 + 简历持久化到数据库',
      '品牌标识统一为 ZENSHEET · 简历，新增网站图标',
    ],
  },
  {
    version: 'v0.7.0',
    date: '2026-09-01',
    title: '设置中心与账号体系完善',
    items: [
      '新增设置窗口：账号信息、AI 供应商配置、安全（改用户名 / 邮箱 / 密码）、关于',
      '头像上传与圆形裁剪，同步显示于编辑页与首页导航',
      '新增文档页面与首页导航入口',
    ],
  },
  {
    version: 'v0.6.0',
    date: '2026-09-01',
    title: '主题面板模板卡片',
    items: [
      '主题面板模板切换改为预览卡片形式，直观对比各模板效果',
      '统一模板卡片渲染管线，首页展示、模板库与主题面板渲染一致',
    ],
  },
  {
    version: 'v0.5.0',
    date: '2026-09-01',
    title: '照片排版与图标库',
    items: [
      '新增简历照片上传与自由摆放：圆形裁剪，放置于页眉或正文任意位置',
      '模板库支持移除不使用的模板',
      '新增图标库弹窗，内置图标一目了然',
      '全站统一悬停提示组件，重构编辑器工具栏',
    ],
  },
  {
    version: 'v0.4.0',
    date: '2026-08-31',
    title: '模板库与四套新模板',
    items: [
      '新增模板库弹窗，模板切换与预览集中管理',
      '新增青线极简、朝阳暖橙、碳黑章标、墨纸极简四套模板（共 8 套）',
      '优化编辑器 UI 细节',
    ],
  },
  {
    version: 'v0.3.0',
    date: '2026-08-31',
    title: '分页预览与图标系统',
    items: [
      '预览重构为 A4 逐页实时分页，所见即所得',
      '新增简历图标系统，Markdown 中以 icon: 语法引用',
      'PDF 导出新增页边距设置，与预览一致',
    ],
  },
  {
    version: 'v0.2.0',
    date: '2026-08-30',
    title: '编辑器打磨与我的简历',
    items: [
      '编辑器与预览界面全面打磨',
      '新增「我的简历」页面，集中管理简历列表',
      '修复保存、AI 助手与 PDF 导出流程的问题',
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-08-19',
    title: '首个公开版本',
    items: [
      'Markdown 编辑器 + A4 实时分页预览',
      '8 套内置模板与主题配置面板',
      '简历图标系统与照片排版',
      'AI 润色、关键词分析、要点成段',
      '服务端渲染导出 PDF',
    ],
  },
];

/** 免登录在线版（static 分支）：版本号独立计数，与全栈版互不影响 */
const STATIC_CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v0.1.0',
    date: '2026-09-05',
    title: '免登录在线版首发',
    tag: '免登录版',
    items: [
      '纯前端版本首发：无需注册登录，打开即用，作为全栈版之外的免登录在线版入口',
      '数据本地化：简历与 AI 对话历史保存在浏览器 IndexedDB，隐私模式自动降级为内存存储',
      'PDF 导出改为浏览器打印直出：逐页排版与预览完全一致，不再依赖服务端渲染',
      'AI 助手浏览器直连 OpenAI 兼容供应商：API KEY 自持、保存在本地，对话请求不经服务器',
      '纯静态托管：无后端依赖，可部署于任意静态平台',
      '保留全栈版核心能力：8 套模板、主题微调、Markdown 简历语法、图标库与照片排版',
      '单个浏览器最多保存 15 份简历',
    ],
  },
];

/** 单个分支的版本时间线，全栈版与免登录版共用 */
function ChangelogTimeline({ versions }: { versions: ChangelogEntry[] }) {
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
                {v.tag}
              </span>
            )}
            <span className="sm:hidden ml-2.5 text-gray-500 font-normal">{v.date}</span>
          </p>
          <p className="font-semibold text-gray-900 mt-1">{v.title}</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1 text-[13px] text-gray-500 leading-relaxed">
            {v.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function ChangelogPage() {
  return (
    <DocsLayout>
      <DocSectionHeader no="CHANGELOG" title="更新日志" desc="ZENSHEET · 简历 的版本演进记录。" />

      {/* 免登录在线版（static 分支）：版本号独立计数 */}
      <div data-docs-reveal className="mb-8">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2.5">
          免登录在线版
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 font-sans text-[10px] font-semibold tracking-widest text-white">
            免登录版
          </span>
        </h2>
        <p className="text-[13px] text-gray-500 mt-1">
          纯前端版本，无需注册登录、打开即用；版本号独立计数，不随全栈版演进。
        </p>
      </div>
      <ChangelogTimeline versions={STATIC_CHANGELOG} />

      {/* 全栈版 */}
      <div data-docs-reveal className="mt-14 mb-8">
        <h2 className="text-lg font-bold tracking-tight">全栈版</h2>
        <p className="text-[13px] text-gray-500 mt-1">
          支持注册登录与账号体系的服务端版本，功能最完整。
        </p>
      </div>
      <ChangelogTimeline versions={CHANGELOG} />
    </DocsLayout>
  );
}
