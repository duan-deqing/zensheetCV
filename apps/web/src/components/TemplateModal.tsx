import { useEffect } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import type { CSSProperties } from 'react';
import { useUI } from '@/store/UIContext';
import { usePreview } from '@/store/PreviewContext';
import { builtinTemplates, getTemplateCss } from '@/templates';
import { RESUME_ICON_TAG, getIconMap, remarkResumeIcons } from '@/preview/resumeIcons';
import { CONTENT_PADDING_MM, MARGIN_MM, resumeIconsCss } from '@/preview/previewShared';
import { defaultTheme } from '@stylan/shared-types';

/** 卡片预览用示例内容：走真实渲染管线（react-markdown + 模板 CSS + 图标插件） */
const PREVIEW_MARKDOWN = `# 林晚舟

产品经理 · 5 年经验

icon:phone 138-0000-0000 · icon:email lin@mail.com

## 工作经历

### 云帆科技 · 高级产品经理

- 主导协作平台从 0 到 1，服务 1200+ 企业客户
- 建立需求评审流程，线上事故率下降 38%

### 星图网络 · 产品经理

- 负责内容分发中台，DAU 增长 2.4 倍`;

/** 模板卡片预览：与首页/编辑页同一套作用域替换方案，A4 宽 794px 等比缩放 */
function TemplatePreview({ templateId }: { templateId: string }) {
  const scoped = getTemplateCss(templateId).replace(
    /\.resume-preview/g,
    `.tpl-${templateId}`,
  );
  const iconMap = getIconMap();
  const components = {
    [RESUME_ICON_TAG]: ({ name }: { name?: string }) => {
      const svg = name ? iconMap[name] : undefined;
      if (!svg) return null;
      return <span className="resume-icon" dangerouslySetInnerHTML={{ __html: svg }} />;
    },
  } as Components; // 自定义元素名不在 JSX.IntrinsicElements 中，需断言
  // 与预览/导出一致的每页留白 = 页边距 + 内容边距
  const padXMM =
    (MARGIN_MM[defaultTheme.marginX] ?? 0) + (CONTENT_PADDING_MM[defaultTheme.contentPadding] ?? 0);
  return (
    <div className="relative h-52 overflow-hidden border-b border-gray-100 bg-gray-50">
      <style>{scoped}</style>
      <style>{resumeIconsCss(`.tpl-${templateId}`)}</style>
      <div
        className={`tpl-${templateId} absolute left-0 top-0 origin-top-left bg-white`}
        style={{ transform: 'scale(0.42)', width: 794 } as CSSProperties}
      >
        <div style={{ padding: `${padXMM}mm ${padXMM}mm` }}>
          <ReactMarkdown
            remarkPlugins={[remarkResumeIcons(iconMap)]}
            components={components}
          >
            {PREVIEW_MARKDOWN}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

/** 模板库弹窗：以卡片展示全部内置模板（实时预览 + 名称 + 标签 + 添加按钮）。
 *  「添加」后该模板进入主题面板的模板下拉菜单可供切换 */
export function TemplateModal() {
  const { templateModalOpen, toggleTemplateModal, addedTemplates, addTemplate, addToast } = useUI();
  const { currentTemplate } = usePreview();

  // Esc 关闭
  useEffect(() => {
    if (!templateModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleTemplateModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [templateModalOpen, toggleTemplateModal]);

  if (!templateModalOpen) return null;
  const currentId = currentTemplate?.id || 'classic';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="模板库"
    >
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .tpl-modal-in { animation: modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .tpl-modal-in { animation: none; }
        }
      `}</style>
      {/* 遮罩：点击关闭 */}
      <div className="absolute inset-0 bg-gray-900/40" onClick={toggleTemplateModal} aria-hidden="true" />
      <div className="tpl-modal-in relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-xl">
        {/* 头部：mono 眉标 + 关闭按钮，与主题面板同构 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 mb-0.5">
              {'// TEMPLATES'}
            </p>
            <h3 className="text-sm font-semibold text-gray-900">模板库</h3>
          </div>
          <button
            onClick={toggleTemplateModal}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
            aria-label="关闭模板库"
            title="关闭"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
          {builtinTemplates.map((t) => {
            const isCurrent = t.id === currentId;
            const isAdded = addedTemplates.includes(t.id);
            return (
              <div
                key={t.id}
                className={`rounded-xl border overflow-hidden flex flex-col ${
                  isCurrent ? 'border-primary-400 ring-1 ring-primary-200' : 'border-gray-200'
                }`}
              >
                <TemplatePreview templateId={t.id} />
                <div className="p-3 flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{t.name}</h4>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 shrink-0">
                      {t.id}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 flex-1">{t.description}</p>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full h-8 rounded-md bg-primary-50 text-primary-600 text-[13px] font-medium cursor-default"
                    >
                      使用中
                    </button>
                  ) : isAdded ? (
                    <button
                      disabled
                      className="w-full h-8 rounded-md bg-gray-100 text-gray-400 text-[13px] font-medium cursor-default"
                    >
                      已添加 · 可在主题面板切换
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        addTemplate(t.id);
                        addToast(`已添加「${t.name}」，可在主题面板切换`, 'success');
                      }}
                      className="w-full h-8 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-medium transition-colors"
                      aria-label={`添加 ${t.name}`}
                    >
                      添加
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
