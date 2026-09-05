import { DocBlock, DocSectionHeader, DocsLayout } from '../DocsLayout';
import { BUILTIN_ICONS } from '@/preview/resumeIcons';
import { useTr, type Bi } from '@/i18n/LangContext';

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
