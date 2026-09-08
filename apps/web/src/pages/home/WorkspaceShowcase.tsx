import { useMemo } from 'react';
import { MarkdownEditor } from '@/editor/MarkdownEditor';
import { ResumePreview } from '@/preview/ResumePreview';
import { AIWindow, buildDemoMessages } from '@/components/AIWindow';
import { EditorProvider } from '@/store/EditorContext';
import { PreviewProvider } from '@/store/PreviewContext';
import { getTemplateById, toApiTemplate } from '@/templates';
import { sampleMarkdown } from '@/sampleResume';
import { useLang, useTr } from '@/i18n/LangContext';

/** 工作台三窗口（编辑器页面真实模块），由 WorkspaceShowcase 内的独立 Provider 驱动；
 *  仅 lg+ 视口渲染（手机/平板由 HomePage 不挂载），无需处理窄屏堆叠 */
function ShowcasePanes() {
  const tr = useTr();
  const demo = useMemo(() => buildDemoMessages(tr), [tr]);

  return (
    /* 与编辑器页同构的三栏布局：编辑器 1/3 + 手柄 + 预览 + 手柄 + AI 聊天窗。
       完全可操作（输入即改预览、工具栏插入、主题面板、AI 对话）；数据仅存于
       本组件内层 Provider，卸载即丢弃、不落库。照片/全屏按钮无对应弹窗，可忽略 */
    <div className="h-full flex items-stretch">
      {/* 左列：编辑器（示例简历源码，真实 CodeMirror + 工具栏） */}
      <div className="w-1/3 min-w-0 shrink-0">
        <MarkdownEditor />
      </div>
      {/* 拖拽手柄（展示态仅视觉，不可拖） */}
      <div className="w-1.5 my-1 mx-2.5 bg-gray-200 rounded-full shrink-0" />
      {/* 中列：预览（真实分页渲染，fitHeight 让单页纸完整显示在窗口内） */}
      <div className="flex-1 min-w-0">
        <ResumePreview fitHeight />
      </div>
      {/* 拖拽手柄（展示态仅视觉，不可拖） */}
      <div className="w-1.5 my-1 mx-2.5 bg-gray-200 rounded-full shrink-0" />
      {/* 右列：AI 聊天窗（演示对话，不读写历史） */}
      <div className="shrink-0 flex items-stretch">
        <AIWindow width={300} demo={demo} />
      </div>
    </div>
  );
}

/**
 * 首页「工作台」展示：直接复用编辑器页面的三窗口真实组件
 * （MarkdownEditor / ResumePreview / AIWindow），数据用示例简历 + AI 演示对话填充。
 * 嵌套独立 Provider（内层 value 覆盖 App 层），与全局编辑器状态完全隔离，卸载即丢弃；
 * 整体懒加载，避免 CodeMirror/分页渲染进入首屏关键路径。
 */
export function WorkspaceShowcase() {
  const { lang } = useLang();
  return (
    <div key={lang} className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100/70 p-3 shadow-2xl shadow-gray-900/15">
      <EditorProvider initialMarkdown={sampleMarkdown(lang)}>
        <PreviewProvider initialTemplate={toApiTemplate(getTemplateById('carbon'))} initialThemeReady>
          <ShowcasePanes />
        </PreviewProvider>
      </EditorProvider>
    </div>
  );
}
