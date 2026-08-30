import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEditor } from '@/store/EditorContext';
import { usePreview } from '@/store/PreviewContext';
import { getTemplateCss } from '@/templates';
import { normalizeColMarkers, remarkResumeCols } from './remarkResumeCols';
import { FONT_SCALE, SPACING_SCALE, resumeColsCss } from './previewShared';
import { ThemeConfigPanel } from '@/components/ThemeConfigPanel';
import { PreviewToolbar } from './PreviewToolbar';

export function ResumePreview() {
  const { markdown } = useEditor();
  const { currentTemplate, themeConfig, themeReady, scale } = usePreview();

  const templateId = currentTemplate?.id || 'classic';
  const css = getTemplateCss(templateId);
  const fs = FONT_SCALE[themeConfig.fontSize] ?? 1;
  const sp = SPACING_SCALE[themeConfig.spacing] ?? 1;
  const normalizedMarkdown = useMemo(() => normalizeColMarkers(markdown), [markdown]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <PreviewToolbar />
      <div className="flex flex-1 min-h-0">
        {themeReady ? (
          <>
            <div className="flex-1 min-w-0 overflow-auto p-4 bg-gray-50">
              <div
                className="resume-preview mx-auto bg-white shadow-lg rounded-lg"
                style={{
                  transform: `scale(${scale / 100})`,
                  transformOrigin: 'top center',
                  width: '210mm',
                  minHeight: '297mm',
                }}
              >
                <style>{css}</style>
                <style>{`
                  .resume-preview {
                    --resume-primary: ${themeConfig.primaryColor};
                    font-family: ${themeConfig.fontFamily};
                    --resume-fs: ${fs};
                    --resume-sp: ${sp};
                  }
                  ${resumeColsCss()}
                `}</style>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkResumeCols]}>
                  {normalizedMarkdown}
                </ReactMarkdown>
              </div>
            </div>
            {/* 主题设置侧边栏：打开时占据预览窗口右侧 */}
            <ThemeConfigPanel />
          </>
        ) : (
          <PreviewSkeleton />
        )}
      </div>
    </div>
  );
}

/** 预览加载骨架屏：A4 纸形态的脉冲占位 */
function PreviewSkeleton() {
  return (
    <div
      className="flex-1 min-w-0 overflow-auto p-4 bg-gray-50 flex justify-center"
      aria-hidden="true"
    >
      <div className="w-[210mm] max-w-full h-fit min-h-[297mm] bg-white shadow-lg rounded-lg p-10 animate-pulse">
        <div className="h-9 w-2/5 rounded bg-gray-200 mb-3" />
        <div className="h-3.5 w-1/4 rounded bg-gray-100 mb-9" />
        <div className="h-4 w-1/3 rounded bg-gray-200 mb-3" />
        <div className="space-y-2.5 mb-9">
          {[96, 88, 92, 70].map((w, i) => (
            <div key={i} className="h-3 rounded bg-gray-100" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="h-4 w-1/3 rounded bg-gray-200 mb-3" />
        <div className="space-y-2.5 mb-9">
          {[90, 94, 62].map((w, i) => (
            <div key={i} className="h-3 rounded bg-gray-100" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="h-4 w-1/4 rounded bg-gray-200 mb-3" />
        <div className="space-y-2.5">
          {[92, 85, 76].map((w, i) => (
            <div key={i} className="h-3 rounded bg-gray-100" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
