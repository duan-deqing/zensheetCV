import { DocBlock, DocSectionHeader, DocsLayout } from '../DocsLayout';
import { MdDemo } from '../MdDemo';
import { useLang, useTr } from '@/i18n/LangContext';
import { DocPageLink } from './shared';

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
