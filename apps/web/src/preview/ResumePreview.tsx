import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEditor } from '@/store/EditorContext';
import { usePreview } from '@/store/PreviewContext';
import { getTemplateCss, getTemplateById } from '@/templates';
import { PreviewToolbar } from './PreviewToolbar';

export function ResumePreview() {
  const { markdown } = useEditor();
  const { currentTemplate, themeConfig, scale } = usePreview();

  const templateId = currentTemplate?.id || 'classic';
  const css = getTemplateCss(templateId);

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden">
      <PreviewToolbar />
      <div className="flex-1 overflow-auto p-4">
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
            }
          `}</style>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
