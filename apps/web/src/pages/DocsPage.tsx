import { useEffect, useState } from 'react';

/** 文档章节：id 用于滚动定位（HashRouter 下不能用 hash 锚点，需 scrollIntoView） */
const SECTIONS = [
  { id: 'quick-start', no: '01', label: '快速开始' },
  { id: 'write', no: '02', label: '编写内容' },
  { id: 'icons-photos', no: '03', label: '图标与照片' },
  { id: 'theme', no: '04', label: '模板与主题' },
  { id: 'ai', no: '05', label: 'AI 助手' },
  { id: 'export', no: '06', label: '导出 PDF' },
] as const;

/** 行内代码样式 */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[12px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 whitespace-nowrap">
      {children}
    </code>
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

export function DocsPage() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  // 滚动时高亮当前章节（取视口上方最近的章节）
  useEffect(() => {
    const onScroll = () => {
      let current: string = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 140) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-white text-gray-900">
      {/* 页头 */}
      <header className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary-600 mb-4">
          &lt; DOCS /&gt;
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">使用文档</h1>
        <p className="text-gray-600 mt-3 max-w-[36em] leading-relaxed">
          从注册到导出 PDF 的完整指南。左侧目录可快速跳转到对应章节。
        </p>
      </header>

      {/* 主体：左目录 + 右内容 */}
      <div className="max-w-7xl mx-auto px-6 pb-20 flex gap-10 items-start">
        {/* 左侧章节目录 */}
        <nav
          className="hidden lg:block w-44 shrink-0 sticky top-24"
          aria-label="文档目录"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2 px-3">
            目录
          </p>
          <ul className="flex flex-col gap-0.5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => jump(s.id)}
                  aria-current={active === s.id ? 'true' : undefined}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] text-left transition-colors ${
                    active === s.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-mono text-[11px] tabular-nums opacity-70">{s.no}</span>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* 右侧内容 */}
        <main className="flex-1 min-w-0 flex flex-col gap-12">
          {/* 快速开始 */}
          <section id="quick-start" className="scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight flex items-baseline gap-3">
              <span className="font-mono text-sm text-primary-500">01</span>快速开始
            </h2>
            <ol className="mt-4 flex flex-col gap-4">
              <Step no="1" title="注册与登录">
                首页右上角「注册」创建账号（邮箱 + 密码），已有账号直接「登录」。
              </Step>
              <Step no="2" title="创建简历">
                登录后进入「我的简历」页面，新建一份简历，自动进入编辑器。
              </Step>
              <Step no="3" title="认识编辑器">
                左侧为 Markdown 编辑区，右侧为实时预览；顶部工具栏提供模板、主题、图标、AI 与导出入口。
              </Step>
            </ol>
          </section>

          {/* 编写内容 */}
          <section id="write" className="scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight flex items-baseline gap-3">
              <span className="font-mono text-sm text-primary-500">02</span>编写内容
            </h2>
            <p className="text-[13px] text-gray-600 leading-relaxed mt-3">
              使用标准 Markdown 语法书写，预览区实时渲染。编辑区上方工具栏可快速插入常用语法：
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-[13px] text-gray-600 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
                <span>标题：<Kbd># 一级标题</Kbd> ~ <Kbd>#### 四级标题</Kbd>，常用作「姓名 / 工作经历 / 教育背景」等章节</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
                <span>强调：<Kbd>**粗体**</Kbd>、<Kbd>*斜体*</Kbd>；列表：<Kbd>- 无序列表</Kbd>、<Kbd>1. 有序列表</Kbd></span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
                <span>分割线：<Kbd>---</Kbd>；引用：<Kbd>&gt; 引用文字</Kbd>，适合写自我评价</span>
              </li>
            </ul>
          </section>

          {/* 图标与照片 */}
          <section id="icons-photos" className="scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight flex items-baseline gap-3">
              <span className="font-mono text-sm text-primary-500">03</span>图标与照片
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13px] text-gray-600 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
                <span>
                  <strong className="text-gray-900">图标</strong>：工具栏「图标」打开图标库，点击图标复制语法
                  <Kbd>icon:名称</Kbd>，粘贴到联系方式等任意文字位置即可渲染为矢量图标
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
                <span>
                  <strong className="text-gray-900">照片</strong>：工具栏「照片」上传本地照片，插入简历后在预览中即时可见
                </span>
              </li>
            </ul>
          </section>

          {/* 模板与主题 */}
          <section id="theme" className="scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight flex items-baseline gap-3">
              <span className="font-mono text-sm text-primary-500">04</span>模板与主题
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13px] text-gray-600 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
                <span>
                  <strong className="text-gray-900">模板库</strong>：8 套内置模板，每张卡片均为真实内容渲染的预览，
                  点击即可切换，简历内容一个字都不用改
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
                <span>
                  <strong className="text-gray-900">主题面板</strong>：为当前模板调整主色、字号与间距，
                  与模板的默认主题叠加生效
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-500 shrink-0" aria-hidden="true">·</span>
                <span>
                  <strong className="text-gray-900">全屏预览</strong>：预览右上角进入全屏专注查看，
                  再点一次或按 <Kbd>Esc</Kbd> 退出
                </span>
              </li>
            </ul>
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
            <p className="text-[13px] text-gray-600 leading-relaxed mt-3">
              使用前需配置模型：点击导航栏用户名打开「设置 → AI」，选择供应商（DeepSeek / 智谱 GLM / LongCat
              / OpenAI 或任意 OpenAI 兼容端点），填写对应的 API KEY，「获取模型」后选择模型保存。
              每个供应商的 KEY 独立保存，仅存于本浏览器。
            </p>
          </section>

          {/* 导出 PDF */}
          <section id="export" className="scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight flex items-baseline gap-3">
              <span className="font-mono text-sm text-primary-500">06</span>导出 PDF
            </h2>
            <p className="text-[13px] text-gray-600 leading-relaxed mt-3">
              点击顶栏「导出 PDF」，服务端按当前模板与主题渲染，字距、配色与分页和预览完全一致，
              生成后自动下载，可直接投递。
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
