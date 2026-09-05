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
import { useModalClose } from '@/hooks/useModalClose';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getTemplateById, toApiTemplate } from '@/templates';
import type { MarginOption, ThemeConfig } from '@stylan/shared-types';
import { DEFAULT_CONTENT_PADDING } from '@/preview/previewShared';
import { useTr } from '@/i18n/LangContext';

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
  const tr = useTr();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  // 手机端「编辑 / 预览」单列切换（桌面为分栏，不使用该状态）
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  const { id } = useParams();
  const { fetchResume } = useResume();
  const editorDispatch = useEditorDispatch();
  const { setCurrentTemplate, setThemeConfig, themeReady, setThemeReady, isFullscreen, toggleFullscreen } = usePreview();
  const { aiWindowOpen, toggleAIWindow } = useUI();
  // AI 助手统一关闭流程：滑出动画结束后再卸载（wrapper 携拖拽条整体动画）
  const { closing: aiClosing, close: closeAIWindow } = useModalClose(aiWindowOpen, toggleAIWindow);

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
              // 分类字号（H1~H5/段落/列表）随 theme_config 恢复，未设置时按默认值渲染
              elementFontSizes: theme.elementFontSizes,
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
    <div className="flex flex-col h-[100dvh] bg-white">
      {/* 全屏预览：隐藏顶栏与编辑器列，仅保留预览 */}
      {!isFullscreen && <TopBar />}
      {/* 手机端视图切换（分段控件）：编辑 ↔ 预览；桌面分栏布局下隐藏 */}
      {!isFullscreen && !isDesktop && (
        <div className="shrink-0 px-3 pt-3">
          <div
            className="h-9 w-fit bg-gray-100 rounded-full p-1 flex items-center gap-1"
            role="tablist"
            aria-label={tr({ zh: '视图切换', en: 'View switch' })}
          >
            {(['edit', 'preview'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={mobileTab === t}
                onClick={() => setMobileTab(t)}
                className={`h-7 px-4 text-[13px] rounded-full transition-colors ${
                  mobileTab === t
                    ? 'bg-white text-gray-900 shadow-sm font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'edit' ? tr({ zh: '编辑', en: 'Edit' }) : tr({ zh: '预览', en: 'Preview' })}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {isFullscreen ? (
          <div className="fullscreen-in flex flex-1 min-w-0 p-3">
            <div className="flex-1 min-w-0">
              <ResumePreview />
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="flex flex-1 min-w-0 p-3">
          {/* 左列：编辑器（手机上仅 tab=edit 时占满整行，且不重新挂载以保留输入状态；
              桌面为 flex + 拖拽宽度百分比，flex-1 的 basis:0 会覆盖 width，故桌面不可加） */}
          <div
            className={`editor-fade-up flex-col min-w-0 min-h-0 ${
              isDesktop ? 'flex' : mobileTab === 'edit' ? 'flex flex-1' : 'hidden'
            }`}
            style={isDesktop ? { width: editorWidth + '%' } : undefined}
          >
            <div className="flex-1 min-h-0">
              {themeReady ? <MarkdownEditor /> : <EditorSkeleton />}
            </div>
          </div>
          {/* 拖拽手柄仅桌面渲染（触屏无 hover，直接隐藏） */}
          {isDesktop && (
            <HoverTip text={tr({ zh: '拖拽调整编辑器宽度', en: 'Drag to resize editor' })}>
              <div
                className="w-1.5 my-1 mx-2.5 cursor-col-resize bg-gray-200 hover:bg-primary-400 active:bg-primary-500 transition-colors rounded-full shrink-0"
                onMouseDown={startDrag}
              />
            </HoverTip>
          )}
          {/* 右列：预览（手机上仅 tab=preview 时显示，用 hidden 保留渲染状态） */}
          <div
            className={`editor-fade-up flex-1 min-w-0 ${isDesktop || mobileTab === 'preview' ? '' : 'hidden'}`}
            style={{ animationDelay: '0.08s' }}
          >
            <ResumePreview />
          </div>
          {/* AI 助手聊天窗口：桌面为侧栏挤入预览右侧；手机为全屏覆盖层。
              关闭时 wrapper 先播滑出动画（携拖拽条整体），结束后再卸载 */}
          {(aiWindowOpen || aiClosing) && (isDesktop ? (
            <div className={`${aiClosing ? 'ai-window-out' : 'ai-window-in'} flex items-stretch min-w-0 shrink-0`}>
              <HoverTip text={tr({ zh: '拖拽调整 AI 助手宽度', en: 'Drag to resize AI assistant' })}>
                <div
                  className="w-1.5 my-1 mx-2.5 cursor-col-resize bg-gray-200 hover:bg-primary-400 active:bg-primary-500 transition-colors rounded-full shrink-0"
                  onMouseDown={startAIDrag}
                />
              </HoverTip>
              <AIWindow width={aiWidth} resumeId={id} onClose={closeAIWindow} />
            </div>
          ) : (
            <div
              className={`fixed inset-0 z-50 p-3 flex bg-gray-900/30 backdrop-blur-[2px] ${
                aiClosing ? 'ai-window-out' : 'ai-window-in'
              }`}
            >
              <AIWindow resumeId={id} onClose={closeAIWindow} />
            </div>
          ))}
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
