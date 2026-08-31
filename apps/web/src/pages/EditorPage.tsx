import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MarkdownEditor } from '@/editor/MarkdownEditor';
import { ResumePreview } from '@/preview/ResumePreview';
import { TopBar } from '@/components/TopBar';
import { AIPanel } from '@/components/AIPanel';
import { Toast } from '@/components/Toast';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useResume } from '@/hooks/useResume';
import { useEditorDispatch } from '@/store/EditorContext';
import { usePreview } from '@/store/PreviewContext';
import { useUI } from '@/store/UIContext';
import { getTemplateById, toApiTemplate } from '@/templates';
import type { MarginOption, ThemeConfig } from '@stylan/shared-types';
import { DEFAULT_CONTENT_PADDING } from '@/preview/previewShared';

const MIN_EDITOR_PCT = 25;
const MAX_EDITOR_PCT = 70;
const MIN_AI_HEIGHT = 140;
/* 手柄几何：横向手柄 w-1.5 mx-2.5，中心相对左列右缘偏移 10+3=13px；
   纵向手柄 h-1.5 my-1.5 在面板上方，中心相对面板顶缘偏移 6+3=9px */
const H_HANDLE_OFFSET = 13;
const V_HANDLE_OFFSET = 9;

/** 编辑器加载骨架屏：与编辑器卡片同构的脉冲占位 */
function EditorSkeleton() {
  return (
    <div
      className="h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden"
      aria-hidden="true"
    >
      <div className="flex items-center px-4 py-2.5 border-b border-gray-200">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-300">
          {'// MARKDOWN'}
        </span>
      </div>
      <div className="flex-1 p-4 space-y-3.5">
        {[45, 92, 78, 85, 60, 0, 88, 70].map((w, i) =>
          w === 0 ? (
            <div key={i} className="h-3" />
          ) : (
            <div
              key={i}
              className="h-3 rounded bg-gray-100 animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 0.06}s` }}
            />
          )
        )}
      </div>
    </div>
  );
}

export function EditorPage() {
  useAutoSave();
  useKeyboardShortcut();

  const { id } = useParams();
  const { fetchResume } = useResume();
  const editorDispatch = useEditorDispatch();
  const { setCurrentTemplate, setThemeConfig, themeReady, setThemeReady } = usePreview();
  const { aiPanelOpen, toggleAIPanel } = useUI();

  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isVDragging = useRef(false);
  const [editorWidth, setEditorWidth] = useState(100 / 3); // 编辑器:预览 默认 1:2
  const [aiPanelHeight, setAiPanelHeight] = useState(260);

  // 按路由参数加载对应简历；数据就绪前编辑器/预览显示骨架屏，避免默认主题闪变
  useEffect(() => {
    setThemeReady(false);
    if (id) {
      fetchResume(id)
        .then((resume) => {
          if (resume) {
            editorDispatch({ type: 'RESET', payload: resume.markdown });
            // 将简历已保存的模板/主题同步到预览
            const template = getTemplateById(resume.template_id || 'classic');
            setCurrentTemplate(toApiTemplate(template));
            // 兼容旧数据：pageMargin 为单值边距字段，现已拆分为 marginX/marginY
            const theme = (resume.theme_config || {}) as ThemeConfig & {
              pageMargin?: MarginOption;
            };
            setThemeConfig({
              primaryColor: theme.primaryColor ?? template.defaultTheme.primaryColor,
              fontFamily: theme.fontFamily ?? template.defaultTheme.fontFamily,
              fontSize: theme.fontSize ?? template.defaultTheme.fontSize,
              spacing: theme.spacing ?? template.defaultTheme.spacing,
              // 旧数据只有 pageMargin（单值），左右/上下均回退到它；缺省为 0 边距
              marginX: theme.marginX ?? theme.pageMargin ?? 'none',
              marginY: theme.marginY ?? theme.pageMargin ?? 'none',
              contentPadding: theme.contentPadding ?? DEFAULT_CONTENT_PADDING,
            });
          }
        })
        .finally(() => setThemeReady(true));
    } else {
      setThemeReady(true);
    }
  }, [id, fetchResume, editorDispatch, setCurrentTemplate, setThemeConfig, setThemeReady]);

  // 拖拽调节编辑器与预览宽度
  // 百分比宽度相对父容器内容盒，因此以外层 p-3 容器为基准，
  // 并补偿手柄中心偏移（w-1.5 mx-2.5 → 中心在左列右缘右侧 13px）
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const PAD = 12; // 与容器 p-3 对应
      const contentLeft = rect.left + PAD;
      const contentWidth = rect.width - PAD * 2;
      if (contentWidth <= 0) return;
      const pct = ((e.clientX - H_HANDLE_OFFSET - contentLeft) / contentWidth) * 100;
      setEditorWidth(Math.min(MAX_EDITOR_PCT, Math.max(MIN_EDITOR_PCT, pct)));
    };
    const handleUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  // 拖拽调节底部 AI 面板高度（补偿手柄中心偏移，使手柄中心跟随鼠标）
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isVDragging.current || !leftColRef.current) return;
      const rect = leftColRef.current.getBoundingClientRect();
      // 编辑器至少保留 200px
      const max = Math.max(MIN_AI_HEIGHT + 20, rect.height - 200);
      // 面板顶缘应为 clientY + 9px（手柄中心在面板顶缘上方 9px 处）
      setAiPanelHeight(
        Math.min(max, Math.max(MIN_AI_HEIGHT, rect.bottom - e.clientY - V_HANDLE_OFFSET)),
      );
    };
    const handleUp = () => {
      isVDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const startVerticalDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    isVDragging.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <style>{`
        @keyframes editorFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .editor-fade-up { animation: editorFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .editor-fade-up { animation: none; }
        }
      `}</style>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <div ref={containerRef} className="flex flex-1 min-w-0 p-3">
          {/* 左列：编辑器 + 底部 AI 面板 */}
          <div
            ref={leftColRef}
            className="editor-fade-up flex flex-col min-w-0 min-h-0"
            style={{ width: editorWidth + '%' }}
          >
            <div className="flex-1 min-h-0">
              {themeReady ? <MarkdownEditor /> : <EditorSkeleton />}
            </div>
            {aiPanelOpen ? (
              <>
                <div
                  className="h-1.5 my-1.5 cursor-row-resize bg-gray-200 hover:bg-primary-400 active:bg-primary-500 transition-colors rounded-full shrink-0"
                  onMouseDown={startVerticalDrag}
                  title="拖拽调整 AI 助手高度"
                />
                <div className="min-h-0 shrink-0" style={{ height: aiPanelHeight }}>
                  <AIPanel />
                </div>
              </>
            ) : (
              <button
                onClick={toggleAIPanel}
                className="mt-1.5 h-9 shrink-0 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-500">
                  {'// AI'}
                </span>
                <span>AI 助手</span>
              </button>
            )}
          </div>
          <div
            className="w-1.5 my-1 mx-2.5 cursor-col-resize bg-gray-200 hover:bg-primary-400 active:bg-primary-500 transition-colors rounded-full shrink-0"
            onMouseDown={startDrag}
            title="拖拽调整编辑器宽度"
          />
          <div className="editor-fade-up flex-1 min-w-0" style={{ animationDelay: '0.08s' }}>
            <ResumePreview />
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}
