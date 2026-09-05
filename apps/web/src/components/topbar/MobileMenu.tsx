import { useRef, useState } from 'react';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useResume } from '@/hooks/useResume';
import { useUI } from '@/store/UIContext';
import { useTr } from '@/i18n/LangContext';
import { isChromeOrEdge } from '@/hooks/usePDFExport';
import { useMarkdownFileIO } from '@/hooks/useMarkdownFileIO';
import { MenuPanel, MenuDivider, MenuButton, MenuUserItem } from '@/components/MenuPanel';
import type { TopBarStatus } from '@/components/topbar/DesktopActions';
import { FileIcon, LayoutIcon, SmileIcon, BookIcon, SparkleIcon, SaveIconMenu, ExportIcon } from '@/components/topbar/icons';

interface MobileMenuProps {
  /** 关闭菜单（菜单项点击后先收起再执行动作） */
  onClose: () => void;
  /** 顶栏共享提示状态：结果气泡渲染在桌面保存按钮旁 */
  buttonStatus: TopBarStatus;
  onExportPDF: () => Promise<void>;
  isExporting: boolean;
}

/** 手机端折叠菜单：收纳文件 / 功能 / 保存导出 / 用户全部入口（md 起隐藏）。
 *  行为与桌面按钮组一致：导入导出走共享 useMarkdownFileIO，保存与 SaveButton 同构 */
export function MobileMenu({ onClose, buttonStatus, onExportPDF, isExporting }: MobileMenuProps) {
  const { show } = buttonStatus;
  const tr = useTr();
  const {
    toggleTemplateModal,
    toggleIconModal,
    toggleUserModal,
    toggleDocsDrawer,
    toggleAIWindow,
    aiWindowOpen,
    pulseSaved,
    toggleBrowserHint,
  } = useUI();
  const { markdown, isDirty } = useEditor();
  const dispatch = useEditorDispatch();
  const { currentResume } = useResumeStore();
  const { updateResume } = useResume();
  const { importFile, exportMd } = useMarkdownFileIO(show);
  const [saving, setSaving] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  /** 保存（与 SaveButton 桌面行为一致：提交 markdown + 模板 + 主题） */
  const handleSave = async () => {
    if (!currentResume) {
      show('error', tr({ zh: '请先创建简历', en: 'Create a resume first' }));
      return;
    }
    setSaving(true);
    const result = await updateResume(currentResume.id, {
      markdown,
      template_id: currentResume.template_id,
      theme_config: currentResume.theme_config,
    });
    if (result) {
      dispatch({ type: 'MARK_CLEAN' });
      show('success', tr({ zh: '保存成功', en: 'Saved successfully' }));
      pulseSaved();
    } else {
      show('error', tr({ zh: '保存失败', en: 'Save failed' }));
    }
    setSaving(false);
  };

  return (
    <MenuPanel>
      {/* 隐藏的文件选择框：导入 Markdown */}
      <input ref={importInputRef} type="file" accept=".md,.markdown,.txt" className="hidden" onChange={importFile} />
      <MenuButton
        icon={<FileIcon />}
        onClick={() => {
          onClose();
          importInputRef.current?.click();
        }}
      >
        {tr({ zh: '导入 Markdown', en: 'Import Markdown' })}
      </MenuButton>
      <MenuButton
        icon={<FileIcon />}
        onClick={() => {
          onClose();
          exportMd();
        }}
      >
        {tr({ zh: '导出 Markdown', en: 'Export Markdown' })}
      </MenuButton>
      <MenuDivider />
      <MenuButton
        icon={<LayoutIcon />}
        onClick={() => {
          onClose();
          toggleTemplateModal();
        }}
      >
        {tr({ zh: '模板库', en: 'Templates' })}
      </MenuButton>
      <MenuButton
        icon={<SmileIcon />}
        onClick={() => {
          onClose();
          toggleIconModal();
        }}
      >
        {tr({ zh: '图标库', en: 'Icons' })}
      </MenuButton>
      <MenuButton
        icon={<BookIcon />}
        onClick={() => {
          onClose();
          toggleDocsDrawer();
        }}
      >
        {tr({ zh: '使用文档', en: 'Docs' })}
      </MenuButton>
      <MenuButton
        icon={<SparkleIcon />}
        active={aiWindowOpen}
        onClick={() => {
          onClose();
          toggleAIWindow();
        }}
      >
        {tr({ zh: 'AI 助手', en: 'AI Assistant' })}
      </MenuButton>
      <MenuDivider />
      <MenuButton
        icon={<SaveIconMenu />}
        disabled={!isDirty && !saving}
        onClick={() => {
          onClose();
          void handleSave();
        }}
      >
        {saving
          ? tr({ zh: '保存中...', en: 'Saving…' })
          : isDirty
            ? tr({ zh: '保存', en: 'Save' })
            : tr({ zh: '已保存', en: 'Saved' })}
      </MenuButton>
      <MenuButton
        icon={<ExportIcon />}
        disabled={isExporting}
        onClick={() => {
          onClose();
          void onExportPDF();
        }}
      >
        {isExporting ? tr({ zh: '导出中...', en: 'Exporting...' }) : tr({ zh: '导出 PDF', en: 'Export PDF' })}
        {/* 非 Chrome / Edge 浏览器提示问号：点击打开「使用浏览器打开」弹窗（不触发导出） */}
        {!isChromeOrEdge() && (
          <span
            role="button"
            tabIndex={0}
            aria-label={tr({ zh: '导出 PDF 帮助', en: 'Export PDF help' })}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              toggleBrowserHint();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onClose();
                toggleBrowserHint();
              }
            }}
            className="ml-auto -mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 text-[11px] font-semibold text-gray-400 transition-colors hover:border-primary-300 hover:text-primary-600"
          >
            ?
          </span>
        )}
      </MenuButton>
      <MenuDivider />
      <MenuUserItem
        onSelect={() => {
          onClose();
          toggleUserModal();
        }}
      />
    </MenuPanel>
  );
}
