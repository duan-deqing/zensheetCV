/** 文档章节：id 用于滚动定位（文档页用窗口滚动，抽屉用容器滚动） */
export const SECTIONS = [
  { id: 'quick-start', no: '01', label: '快速开始' },
  { id: 'write', no: '02', label: 'Markdown 语法' },
  { id: 'icons-photos', no: '03', label: '图标与照片' },
  { id: 'theme', no: '04', label: '模板与主题' },
  { id: 'ai', no: '05', label: 'AI 助手' },
  { id: 'export', no: '06', label: '导出 PDF' },
] as const;

/** 行内代码样式 */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[12px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 whitespace-nowrap">
      {children}
    </code>
  );
}

/** 语法示例代码块 */
function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="font-mono text-[12px] leading-relaxed bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-3 text-gray-700 overflow-x-auto">
      {children}
    </pre>
  );
}

function Step({ no, title, children }: { no: string; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="font-mono text-sm text-primary-500 tabular-nums shrink-0 pt-0.5">{no}</span>
      <div>
        <h4 className="text-[14px] font-semibold text-gray-900">{title}</h4>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-0.5">{children}</p>
      </div>
    </li>
  );
}

/** 小节标题（章节内部） */
function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[14px] font-semibold text-gray-900 mt-5 first:mt-3">{children}</h3>;
}

/** 文档正文：文档页与编辑器右侧文档抽屉共用 */
export function DocsContent() {
  return (
    <div className="flex flex-col gap-12">
      {/* 快速开始 */}
      <section id="quick-start" className="scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight flex items-baseline gap-3">
          <span className="font-mono text-sm text-primary-500">01</span>快速开始
        </h2>
        <ol className="mt-4 flex flex-col gap-4">
          <Step no="1" title="注册与登录">
            首页右上角「注册」创建账号（邮箱 + 密码），已有账号直接「登录」。登录后右上角显示头像与用户名，
            点击可打开「设置」管理账号信息与 AI 配置。
          </Step>
          <Step no="2" title="创建简历">
            进入「我的简历」页面，新建一份简历，自动进入编辑器。之后每次从「我的简历」列表点击即可继续编辑。
          </Step>
          <Step no="3" title="认识编辑器">
            左侧为 Markdown 编辑区，右侧为实时预览，所见即所得。编辑区顶部工具栏可快速插入常用语法、
            打开图标库与照片上传；预览窗口顶栏提供照片上传、主题面板、缩放与全屏预览。
          </Step>
          <Step no="4" title="开始写作">
            直接在编辑区用 Markdown 书写内容，预览即时渲染。不熟悉语法可先浏览下方「Markdown 语法」，
            或点开工具栏「图标」查看图标用法。
          </Step>
        </ol>
      </section>

      {/* Markdown 语法 */}
      <section id="write" className="scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight flex items-baseline gap-3">
          <span className="font-mono text-sm text-primary-500">02</span>Markdown 语法
        </h2>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-3">
          使用标准 Markdown 语法书写，预览区实时渲染。编辑区上方工具栏可一键插入下列常用语法，
          无需手打标记。
        </p>

        <SubTitle>标题</SubTitle>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1.5">
          <Kbd>#</Kbd> ~ <Kbd>####</Kbd> 对应一到四级标题。常用法：一级标题写姓名，二级标题写
          「工作经历 / 项目经验 / 教育背景」等章节，三级标题写具体条目。
        </p>
        <div className="mt-2">
          <CodeBlock>{`# 沈亦南
## 工作经历
### 某公司 · 后端工程师`}</CodeBlock>
        </div>

        <SubTitle>强调</SubTitle>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1.5">
          <Kbd>**粗体**</Kbd> 用于突出关键信息（公司名、职位、量化结果），<Kbd>*斜体*</Kbd>{' '}
          用于补充说明，<Kbd>`行内代码`</Kbd> 用于技术名词。
        </p>

        <SubTitle>列表</SubTitle>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1.5">
          <Kbd>-</Kbd> 或 <Kbd>*</Kbd> 开头为无序列表，适合罗列职责与亮点；<Kbd>1. 2. 3.</Kbd>{' '}
          为有序列表，适合有先后顺序的步骤描述。
        </p>
        <div className="mt-2">
          <CodeBlock>{`- 负责订单服务的性能优化，接口平均耗时下降 40%
- 主导消息队列从自建迁移到云服务

1. 需求评审
2. 方案设计
3. 上线验收`}</CodeBlock>
        </div>

        <SubTitle>引用</SubTitle>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1.5">
          行首加 <Kbd>&gt;</Kbd> 为引用块，预览中以左侧竖线 + 缩进样式呈现，适合放置自我评价或个人简介。
        </p>
        <div className="mt-2">
          <CodeBlock>{`> 六年后端开发经验，专注高并发与稳定性建设。`}</CodeBlock>
        </div>

        <SubTitle>分割线</SubTitle>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1.5">
          单独一行书写 <Kbd>---</Kbd>，在章节之间做视觉分隔。
        </p>

        <SubTitle>左中右分栏</SubTitle>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1.5">
          这是本站的扩展语法，用于把内容排成同一行（最常见于页眉：姓名居左、职位居中、联系方式居右）。
          连续书写 <Kbd>:::left</Kbd>、<Kbd>:::mid</Kbd>、<Kbd>:::right</Kbd> 三种容器，
          中间各空一行，渲染时自动并排，且左栏靠左、中栏居中、右栏靠右对齐。只写两栏（如 left + right）
          同样有效。
        </p>
        <div className="mt-2">
          <CodeBlock>{`:::left
**沈亦南**
:::

:::mid
后端工程师
:::

:::right
icon:phone 139-0000-0000
:::`}</CodeBlock>
        </div>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-2">
          分栏内可以继续使用加粗、图标等行内语法；每一对容器之间的内容按普通段落单独渲染。
        </p>
      </section>

      {/* 图标与照片 */}
      <section id="icons-photos" className="scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight flex items-baseline gap-3">
          <span className="font-mono text-sm text-primary-500">03</span>图标与照片
        </h2>

        <SubTitle>插入图标</SubTitle>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1.5">
          在任意文字位置书写 <Kbd>icon:名称</Kbd> 即可内联渲染为矢量图标，尺寸随字号、颜色跟随文字。
          使用流程：
        </p>
        <ol className="mt-2 flex flex-col gap-2 text-[13px] text-gray-600 leading-relaxed">
          <li className="flex gap-2">
            <span className="font-mono text-primary-500 shrink-0 tabular-nums">1.</span>
            <span>点击编辑区工具栏的「图标」按钮打开图标库，窗口内展示全部内置图标</span>
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-primary-500 shrink-0 tabular-nums">2.</span>
            <span>点击需要的图标，语法 <Kbd>icon:名称</Kbd> 自动复制到剪贴板（窗口底部有复制结果反馈）</span>
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-primary-500 shrink-0 tabular-nums">3.</span>
            <span>粘贴到简历中任意位置，例如 <Kbd>icon:email shen@mail.com</Kbd>，预览即时显示</span>
          </li>
        </ol>

        <SubTitle>插入照片</SubTitle>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1.5">
          点击工具栏或预览顶栏的「照片」按钮上传本地图片，插入后预览即时可见，适合放置证件照。
          上传后照片随简历内容保存，导出 PDF 时一并渲染。
        </p>
      </section>

      {/* 模板与主题 */}
      <section id="theme" className="scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight flex items-baseline gap-3">
          <span className="font-mono text-sm text-primary-500">04</span>模板与主题
        </h2>

        <SubTitle>模板库</SubTitle>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1.5">
          点击工具栏「模板」打开模板库，共 8 套内置模板（经典、优雅、现代、科技、极简、碳黑章标等）。
          每张卡片都用你的真实简历内容实时渲染预览，点击卡片即完成切换——<strong className="text-gray-900">简历内容一个字都不会变</strong>，
          只是排版风格整体更换。
        </p>

        <SubTitle>主题面板</SubTitle>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1.5">
          点击预览窗口顶栏的主题按钮，在预览右侧滑出主题面板，分三组设置，所有调整实时反映到预览，
          并随简历持久化保存：
        </p>
        <ul className="mt-2 flex flex-col gap-2.5 text-[13px] text-gray-600 leading-relaxed">
          <li className="flex gap-2">
            <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
            <span>
              <strong className="text-gray-900">模板</strong>：2 列预览卡片网格，一屏最多 4 张，
              超出可滚动且自动吸附对齐；当前模板以主题色边框标识。切换模板后，颜色、字体等
              视觉设置会重置为该模板的默认主题，页面布局设置保留。
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
            <span>
              <strong className="text-gray-900">视觉风格</strong>：
              <em>主色调</em>提供 6 个预设色圆点一键应用；
              <em>字体</em>下拉可选 Inter、思源黑体、Georgia、思源宋体、JetBrains Mono 五种；
              <em>字号</em>与<em>间距</em>各有 5 个档位（特小 ~ 特大 / 极紧凑 ~ 宽松）微调阅读密度。
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
            <span>
              <strong className="text-gray-900">页面布局</strong>：<em>左右边距</em>与<em>上下边距</em>
              独立设置（无 / 窄 / 标准 / 宽），<em>内容边距</em>控制内容与页面边界的距离，
              叠加在页边距之上。此组设置同时作用于预览与 PDF 导出，保证所见即所得。
            </span>
          </li>
        </ul>

        <SubTitle>全屏预览</SubTitle>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1.5">
          预览窗口右上角进入全屏专注查看，再点一次或按 <Kbd>Esc</Kbd> 退出。
        </p>
      </section>

      {/* AI 助手 */}
      <section id="ai" className="scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight flex items-baseline gap-3">
          <span className="font-mono text-sm text-primary-500">05</span>AI 助手
        </h2>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-3">
          编辑器右侧提供三种 AI 能力，围绕你的真实经历打磨表达：
        </p>
        <ul className="mt-3 flex flex-col gap-2 text-[13px] text-gray-600 leading-relaxed">
          <li className="flex gap-2">
            <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
            <span><strong className="text-gray-900">经历润色</strong>：把「负责 xx 工作」改写成有结果、有数字的表述</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
            <span><strong className="text-gray-900">关键词匹配</strong>：粘贴职位描述，找出简历中缺失的能力词</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
            <span><strong className="text-gray-900">要点成段</strong>：输入几个要点，生成结构完整的项目描述</span>
          </li>
        </ul>

        <SubTitle>配置模型</SubTitle>
        <ol className="mt-2 flex flex-col gap-2 text-[13px] text-gray-600 leading-relaxed">
          <li className="flex gap-2">
            <span className="font-mono text-primary-500 shrink-0 tabular-nums">1.</span>
            <span>点击导航栏用户名打开「设置 → AI」</span>
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-primary-500 shrink-0 tabular-nums">2.</span>
            <span>选择供应商：DeepSeek / 智谱 GLM / LongCat / OpenAI，或「自定义」填入任意 OpenAI 兼容端点</span>
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-primary-500 shrink-0 tabular-nums">3.</span>
            <span>填写该供应商的 API KEY，点击「获取模型」从服务端拉取可用模型列表并选择；获取失败时也可手动输入模型名称</span>
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-primary-500 shrink-0 tabular-nums">4.</span>
            <span>保存后即可在 AI 面板使用。每个供应商的 KEY 独立保存，仅存于本浏览器</span>
          </li>
        </ol>
      </section>

      {/* 导出 PDF */}
      <section id="export" className="scroll-mt-24">
        <h2 className="text-xl font-bold tracking-tight flex items-baseline gap-3">
          <span className="font-mono text-sm text-primary-500">06</span>导出 PDF
        </h2>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-3">
          点击顶栏「导出 PDF」，服务端按当前模板与主题渲染，字距、配色、分栏与分页和预览完全一致，
          生成后自动下载，可直接投递。
        </p>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-2">
          建议导出前先全屏预览检查一遍：重点确认分栏内容的对齐、照片位置，以及主题面板中的页边距
          是否符合投递渠道的页数要求。
        </p>
      </section>
    </div>
  );
}
