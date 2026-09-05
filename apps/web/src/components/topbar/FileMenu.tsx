import { useRef, useState } from 'react';
import { useButtonStatus, ButtonStatus } from '@/components/ButtonStatus';
import { useTr } from '@/i18n/LangContext';
import { useDismissable } from '@/hooks/useDismissable';
import { useMarkdownFileIO } from '@/hooks/useMarkdownFileIO';
import { FileIcon } from '@/components/topbar/icons';

/** 文件菜单（桌面端）：导入 / 导出 Markdown，弹层与全站下拉风格一致，结果气泡显示在按钮上方 */
export function FileMenu() {
  const { status, exiting, show } = useButtonStatus();
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { importFile, exportMd } = useMarkdownFileIO(show);

  // 点击外部 / Escape 关闭（公共 hook）
  useDismissable(open, rootRef, () => setOpen(false));

  const itemClass =
    'w-full text-left text-[13px] px-3 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors';

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="px-2 lg:px-2.5 h-8 inline-flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors whitespace-nowrap"
      >
        <FileIcon />
        <span className="hidden lg:inline whitespace-nowrap">{tr({ zh: '文件', en: 'File' })}</span>
      </button>
      <ButtonStatus status={status} exiting={exiting} />
      {open && (
        <div
          role="menu"
          className="dropdown-pop absolute left-0 top-full mt-1.5 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              inputRef.current?.click();
            }}
            className={itemClass}
          >
            {tr({ zh: '导入 Markdown', en: 'Import Markdown' })}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              exportMd();
            }}
            className={itemClass}
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
        onChange={importFile}
      />
    </div>
  );
}
