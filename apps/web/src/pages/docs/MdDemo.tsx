import { useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { normalizeColMarkers, remarkResumeCols } from '@/preview/remarkResumeCols';
import { BUILTIN_ICONS, getIconMap, remarkResumeIcons } from '@/preview/resumeIcons';
import { resumeColsCss, resumeIconsCss, resumeQuoteCss } from '@/preview/previewShared';
import { getTemplateCss } from '@/templates';

/** 演示预览使用「碳黑章标」模板的默认样式（主色 / 字体与其模板一致） */
const CARBON_PRIMARY = '#1A1A1A';
const CARBON_FONT = "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif";

/** 演示容器专用作用域：模板 CSS 中的 .resume-preview 替换为该 class，
 *  避免与编辑器实时预览（同样使用 .resume-preview）互相污染样式 */
const DEMO_SCOPE = '.docs-md-demo';

/** 注入碳黑章标模板样式（限定在演示容器内）：与编辑器预览同一套模板 CSS + 分栏/图标样式 */
function CarbonTemplateStyles() {
  return (
    <style>{`
      ${getTemplateCss('carbon').replace(/\.resume-preview/g, DEMO_SCOPE)}
      ${DEMO_SCOPE} {
        --resume-primary: ${CARBON_PRIMARY};
        font-family: ${CARBON_FONT};
        --resume-fs: 1;
        --resume-sp: 1;
      }
      ${resumeColsCss(DEMO_SCOPE)}
      ${resumeIconsCss(DEMO_SCOPE)}
      ${resumeQuoteCss(DEMO_SCOPE)}
    `}</style>
  );
}

/** markdown 演示渲染管线：与预览一致的插件，图标颜色跟随文字 */
function useDemoPipeline() {
  return useMemo(
    () => ({
      remarkPlugins: [remarkGfm, remarkResumeIcons(getIconMap()), remarkResumeCols],
      components: {
        'resume-icon': ({ name }: { name?: string }) => {
          const svg = name ? BUILTIN_ICONS[name] : undefined;
          if (!svg) return null;
          return (
            <span
              className="resume-icon inline-flex w-[1em] h-[1em] align-[-0.125em] [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          );
        },
      } as Components, // 自定义元素名不在 JSX.IntrinsicElements 中，需断言
    }),
    [],
  );
}

/** 代码块 + 效果预览（碳黑章标模板样式）的成对演示卡片 */
export function MdDemo({
  code,
  title,
}: {
  code: string;
  title?: string;
}) {
  const { remarkPlugins, components } = useDemoPipeline();
  const normalized = useMemo(() => normalizeColMarkers(code), [code]);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-4">
      {title && (
        <p className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
          {title}
        </p>
      )}
      <pre className="bg-gray-900 text-gray-100 font-mono text-xs leading-relaxed p-4 overflow-x-auto">
        {code}
      </pre>
      <div className="p-5 border-t border-gray-100 bg-gray-50">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-3">
          效果预览 · 碳黑章标模板
        </p>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <CarbonTemplateStyles />
          <div
            className="docs-md-demo bg-white px-6 py-5"
            style={{ width: '100%', display: 'flow-root' }}
          >
            <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
              {normalized}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
