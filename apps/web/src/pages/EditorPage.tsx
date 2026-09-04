import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MarkdownEditor } from '@/editor/MarkdownEditor';
import { ResumePreview } from '@/preview/ResumePreview';
import { TopBar } from '@/components/TopBar';
import { HoverTip } from '@/components/HoverTip';
import { AIWindow } from '@/components/AIWindow';
import { TemplateModal } from '@/components/TemplateModal';
import { PhotoModal } from '@/components/PhotoModal';
import { IconModal } from '@/components/IconModal';
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
/* 手柄几何：横向手柄 w-1.5 mx-2.5，中心相对相邻列边缘偏移 10+3=13px */
const H_HANDLE_OFFSET = 13;
/* AI 聊天窗宽度拖拽限制 */
const MIN_AI_WIDTH = 280;
const MAX_AI_WIDTH_PCT = 0.45; // 占容器内容宽度上限

/** 编辑器加载骨架屏：与编辑器卡片同构的脉冲占位 */
function EditorSkeleton() {
  return (
    <div
      className="h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden"
      aria-hidden="true"
    >
      <div className="flex h-11 items-center px-3 border-b border-gray-200">
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
  const { setCurrentTemplate, setThemeConfig, themeReady, setThemeReady, isFullscreen, toggleFullscreen } = usePreview();
  const { aiWindowOpen } = useUI();

  // 全屏预览时按 Esc 退出
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleFullscreen();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isFullscreen, toggleFullscreen]);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isAIDragging = useRef(false);
  const [editorWidth, setEditorWidth] = useState(100 / 3); // 编辑器:预览 默认 1:2
  const [aiWidth, setAiWidth] = useState(320); // AI 聊天窗宽度（px）

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
              // 旧数据行距存于 spacing 档位字段，优先取新字段 lineHeight
              lineHeight: theme.lineHeight ?? (theme as { spacing?: unknown }).spacing ?? template.defaultTheme.lineHeight,
              // 旧数据只有 pageMargin（单值），左右/上下均回退到它；缺省为 0 边距
              marginX: theme.marginX ?? theme.pageMargin ?? 'none',
              marginY: theme.marginY ?? theme.pageMargin ?? 'none',
              contentPadding: theme.contentPadding ?? DEFAULT_CONTENT_PADDING,
              // 自定义图标与照片（含位置信息）随 theme_config 整体落库，原样恢复
              customIcons: theme.customIcons,
              photos: theme.photos,
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

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // 拖拽调节 AI 聊天窗宽度：手柄在 AI 窗口左侧，鼠标向左移动窗口变宽
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isAIDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const PAD = 12; // 与容器 p-3 对应
      const contentRight = rect.right - PAD;
      // AI 窗口左缘 = 手柄中心 + 13px 偏移
      const width = contentRight - e.clientX - H_HANDLE_OFFSET;
      setAiWidth(Math.min(rect.width * MAX_AI_WIDTH_PCT, Math.max(MIN_AI_WIDTH, width)));
    };
    const handleUp = () => {
      isAIDragging.current = false;
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

  const startAIDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    isAIDragging.current = true;
    document.body.style.cursor = 'col-resize';
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
      {/* 全屏预览：隐藏顶栏与编辑器列，仅保留预览 */}
      {!isFullscreen && <TopBar />}
      <div className="flex flex-1 overflow-hidden">
        {isFullscreen ? (
          <div className="flex flex-1 min-w-0 p-3">
            <div className="flex-1 min-w-0">
              <ResumePreview />
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="flex flex-1 min-w-0 p-3">
          {/* 左列：编辑器 */}
          <div
            className="editor-fade-up flex flex-col min-w-0 min-h-0"
            style={{ width: editorWidth + '%' }}
          >
            <div className="flex-1 min-h-0">
              {themeReady ? <MarkdownEditor /> : <EditorSkeleton />}
            </div>
          </div>
          <HoverTip text="拖拽调整编辑器宽度">
            <div
              className="w-1.5 my-1 mx-2.5 cursor-col-resize bg-gray-200 hover:bg-primary-400 active:bg-primary-500 transition-colors rounded-full shrink-0"
              onMouseDown={startDrag}
            />
          </HoverTip>
          <div className="editor-fade-up flex-1 min-w-0" style={{ animationDelay: '0.08s' }}>
            <ResumePreview />
          </div>
          {/* AI 助手聊天窗口：与预览窗口同层级，打开时占据页面右侧 */}
          {aiWindowOpen && (
            <>
              <HoverTip text="拖拽调整 AI 助手宽度">
                <div
                  className="w-1.5 my-1 mx-2.5 cursor-col-resize bg-gray-200 hover:bg-primary-400 active:bg-primary-500 transition-colors rounded-full shrink-0"
                  onMouseDown={startAIDrag}
                />
              </HoverTip>
              <AIWindow width={aiWidth} resumeId={id} />
            </>
          )}
          </div>
        )}
      </div>
      {/* 弹窗常驻渲染：全屏时顶栏被卸载，弹窗放在这里保证照片/模板/图标窗口在全屏下仍可打开 */}
      <TemplateModal />
      <PhotoModal />
      <IconModal />
      <Toast />
    </div>
  );
}
