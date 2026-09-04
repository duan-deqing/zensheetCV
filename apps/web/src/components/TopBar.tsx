import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HoverTip } from '@/components/HoverTip';
import { useAuth } from '@/store/AuthContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import { useResume } from '@/hooks/useResume';
import { SaveButton } from '@/components/SaveButton';
import { ButtonStatus, useButtonStatus } from '@/components/ButtonStatus';

import { DocsDrawer } from '@/components/DocsDrawer';
import { CoffeeModal, CoffeeIcon } from '@/components/CoffeeModal';
import { useUI } from '@/store/UIContext';
import { usePDFExport } from '@/hooks/usePDFExport';
import { useTr } from '@/i18n/LangContext';

/** 文档图标，颜色跟随 currentColor */
function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      aria-hidden="true"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

/** 书本图标（使用文档入口），颜色跟随 currentColor */
function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      aria-hidden="true"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

/** 星芒图标（AI 助手入口），颜色跟随 currentColor */
function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      aria-hidden="true"
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

/** 导出线性图标（文件 + 下箭头），颜色跟随 currentColor */
function ExportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}


/** 文件菜单：导入 / 导出 Markdown，弹层与全站下拉风格一致，结果气泡显示在按钮上方 */
function FileMenu() {
  const { markdown } = useEditor();
  const { currentResume } = useResumeStore();
  const dispatch = useEditorDispatch();
  const { status, exiting, show } = useButtonStatus();
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 点击外部 / Escape 关闭
  useEffect(() => {
    if (!open) return;
    const handleDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 允许重复导入同一文件
    if (!file) return;
    try {
      const text = await file.text();
      if (!text.trim()) {
        show('error', tr({ zh: '文件内容为空', en: 'File is empty' }));
        return;
      }
      // 载入编辑器并标记未保存，由自动保存持久化
      dispatch({ type: 'SET_MARKDOWN', payload: text });
      show('success', tr({ zh: '导入成功', en: 'Imported successfully' }));
    } catch {
      show('error', tr({ zh: '文件读取失败', en: 'Failed to read file' }));
    }
  };

  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentResume?.title || tr({ zh: '简历', en: 'Resume' })).replace(/[\\/:*?"<>|]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    show('success', tr({ zh: 'Markdown 导出成功', en: 'Markdown exported' }));
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="px-2.5 h-8 inline-flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <FileIcon />
        {tr({ zh: '文件', en: 'File' })}
      </button>
      <ButtonStatus status={status} exiting={exiting} />
      {open && (
        <div
          role="menu"
          className="dropdown-pop absolute left-0 top-full mt-1.5 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30"
        >
          <style>{`
            @keyframes dropdownIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .dropdown-pop { animation: dropdownIn 0.15s ease-out both; }
            @media (prefers-reduced-motion: reduce) {
              .dropdown-pop { animation: none; }
            }
          `}</style>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              inputRef.current?.click();
            }}
            className="w-full text-left text-[13px] px-3 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          >
            {tr({ zh: '导入 Markdown', en: 'Import Markdown' })}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              handleExport();
            }}
            className="w-full text-left text-[13px] px-3 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          >
            {tr({ zh: '导出 Markdown', en: 'Export Markdown' })}
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".md,.markdown,.txt"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  );
}

/** 铅笔图标，颜色跟随 currentColor */
function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3"
      aria-hidden="true"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

/** 四宫格图标，颜色跟随 currentColor */
function LayoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

/** 笑脸图标，颜色跟随 currentColor */
function SmileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

/** 估算文本显示宽度：中文等全角字符约 1em，英文/数字约 0.55em */
function textWidth(s: string) {
  return [...s].reduce((w, c) => w + (c.charCodeAt(0) > 0x2e80 ? 1 : 0.55), 0);
}

/** 可编辑简历标题：点击进入行内编辑，Enter/失焦保存，Esc 取消 */
function EditableTitle({ onNotify }: { onNotify: (kind: 'success' | 'error', text: string) => void }) {
  const { currentResume } = useResumeStore();
  const { updateResume } = useResume();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const tr = useTr();

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (!currentResume) {
    return <h1 className="text-sm font-semibold text-gray-900 truncate">{tr({ zh: '编辑简历', en: 'Edit Resume' })}</h1>;
  }

  const commit = async () => {
    setEditing(false);
    const next = draft.trim();
    if (!next || next === currentResume.title) {
      if (!next) onNotify('error', tr({ zh: '名称不能为空', en: 'Name cannot be empty' }));
      return;
    }
    const result = await updateResume(currentResume.id, { title: next });
    onNotify(
      result ? 'success' : 'error',
      result ? tr({ zh: '重命名成功', en: 'Renamed' }) : tr({ zh: '重命名失败', en: 'Rename failed' }),
    );
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        className="text-sm font-semibold text-gray-900 bg-white border-b border-primary-400 outline-none px-0.5 py-0"
        style={{ width: `${Math.min(Math.max(textWidth(draft) + 0.5, 10), 20)}em` }}
        maxLength={60}
        aria-label={tr({ zh: '简历名称', en: 'Resume name' })}
      />
    );
  }

  return (
    <HoverTip text={tr({ zh: '点击修改名称', en: 'Click to rename' })}>
      <button
        type="button"
        onClick={() => {
          setDraft(currentResume.title);
          setEditing(true);
        }}
        className="group flex items-center gap-1.5 min-w-0 text-sm font-semibold text-gray-900 hover:text-primary-700 transition-colors"
      >
        <span className="truncate">{currentResume.title}</span>
        <PencilIcon />
      </button>
    </HoverTip>
  );
}

export function TopBar() {
  const { user } = useAuth();
  const tr = useTr();
  const { exportPDF, isExporting } = usePDFExport();
  const { status, exiting, show } = useButtonStatus();
  const { toggleTemplateModal, toggleIconModal, toggleUserModal, docsDrawerOpen, toggleDocsDrawer, aiWindowOpen, toggleAIWindow, toggleCoffeeModal } = useUI();

  const handleExportPDF = async () => {
    // 纯前端导出：调起浏览器打印（预览分页 → 另存为 PDF）
    const ok = await exportPDF();
    show(
      ok ? 'success' : 'error',
      ok
        ? tr({
            zh: '已打开打印面板，请在目标打印机中选择「另存为 PDF」',
            en: 'Print dialog opened — choose "Save as PDF" as the printer',
          })
        : tr({ zh: 'PDF 导出失败', en: 'PDF export failed' }),
    );
  };

  return (
    <header className="shrink-0 px-3 pt-3">
      {/* z-30：顶栏需要高于下方编辑器/预览面板，否则文件下拉菜单会被盖住 */}
      <div className="relative z-30 h-12 bg-white/90 backdrop-blur border border-gray-200 rounded-full shadow-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-3 min-w-0">
          <HoverTip text={tr({ zh: '返回简历列表', en: 'Back to my resumes' })}>
            <Link
              to="/resumes"
              className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-primary-600 transition-colors shrink-0"
            >
              <span className="font-mono text-primary-500" aria-hidden="true">&lt;</span>
              <span>{tr({ zh: '我的简历', en: 'My Resumes' })}</span>
            </Link>
          </HoverTip>
          <span className="w-px h-4 bg-gray-200 shrink-0" aria-hidden="true" />
          <EditableTitle onNotify={show} />
          <FileMenu />
          {/* 模板库入口：卡片式模板选择弹窗，「添加」后进入主题面板下拉 */}
          <HoverTip text={tr({ zh: '模板库', en: 'Templates' })}>
            <button
              type="button"
              onClick={toggleTemplateModal}
              className="px-2.5 h-8 inline-flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <LayoutIcon />
              {tr({ zh: '模板', en: 'Templates' })}
            </button>
          </HoverTip>
          {/* 图标库入口：点击图标复制 icon:名称 语法 */}
          <HoverTip text={tr({ zh: '图标库', en: 'Icons' })}>
            <button
              type="button"
              onClick={toggleIconModal}
              className="px-2.5 h-8 inline-flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <SmileIcon />
              {tr({ zh: '图标', en: 'Icons' })}
            </button>
          </HoverTip>
          {/* 使用文档入口：右侧抽屉展示，不跳转文档页 */}
          <HoverTip text={tr({ zh: '使用文档', en: 'Docs' })}>
            <button
              type="button"
              onClick={toggleDocsDrawer}
              className="px-2.5 h-8 inline-flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <BookIcon />
              {tr({ zh: '文档', en: 'Docs' })}
            </button>
          </HoverTip>
          {/* AI 助手入口：聊天窗口挤入预览右侧 */}
          <HoverTip text={tr({ zh: 'AI 助手', en: 'AI Assistant' })}>
            <button
              type="button"
              onClick={toggleAIWindow}
              aria-pressed={aiWindowOpen}
              className={`px-2.5 h-8 inline-flex items-center gap-1.5 text-[13px] rounded-full transition-colors ${
                aiWindowOpen
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              <SparkleIcon />
              {tr({ zh: 'AI 助手', en: 'AI Assistant' })}
            </button>
          </HoverTip>
          {/* 请作者喝杯咖啡：收款码弹窗 */}
          <HoverTip text={tr({ zh: '请作者喝杯咖啡', en: 'Buy Me a Coffee' })}>
            <button
              type="button"
              onClick={toggleCoffeeModal}
              className="px-2.5 h-8 inline-flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CoffeeIcon />
              Coffee
            </button>
          </HoverTip>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="relative inline-flex">
            <SaveButton />
            {/* 导出结果气泡与保存结果共用同一区域：保存按钮左侧 */}
            <ButtonStatus status={status} exiting={exiting} placement="left" />
          </span>
          <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="px-3.5 h-8 inline-flex items-center gap-1.5 text-[13px] font-medium rounded-full border border-primary-300 bg-white text-primary-700 hover:bg-primary-50 transition-colors disabled:opacity-50"
        >
          <ExportIcon />
          {isExporting ? tr({ zh: '导出中...', en: 'Exporting...' }) : tr({ zh: '导出 PDF', en: 'Export PDF' })}
        </button>
        <div className="flex items-center gap-2 ml-1.5 pl-3 border-l border-gray-200">
          {/* 头像 + 用户名，点击打开用户信息弹窗 */}
          <HoverTip text={tr({ zh: '用户信息', en: 'User info' })}>
            <button
              onClick={toggleUserModal}
              className="flex items-center gap-2 group"
              aria-haspopup="dialog"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={tr({ zh: `${user.name} 的头像`, en: `${user.name}'s avatar` })}
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <span
                  className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center text-[11px] font-semibold select-none"
                  aria-hidden="true"
                >
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="text-[13px] text-gray-600 group-hover:text-primary-600 transition-colors">
                {user.name}
              </span>
            </button>
          </HoverTip>
        </div>
        </div>
      </div>
      <DocsDrawer open={docsDrawerOpen} onClose={toggleDocsDrawer} />
      {/* 请作者喝杯咖啡（收款码）弹窗 */}
      <CoffeeModal />
    </header>
  );
}
