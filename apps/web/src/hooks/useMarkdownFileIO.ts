import { useCallback } from 'react';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useToastValue } from '@/store/ToastContext';
import { useTr } from '@/i18n/LangContext';

/** Markdown 导入 / 导出：桌面 FileMenu 与手机折叠菜单共用同一套行为与提示文案。
 *  结果提示统一走全局顶部中央胶囊（Toast），与添加模板等操作提示同位置同款式 */
export function useMarkdownFileIO() {
  const { markdown } = useEditor();
  const { currentResume } = useResumeStore();
  const dispatch = useEditorDispatch();
  const { addToast } = useToastValue();
  const tr = useTr();

  /** 导入 Markdown：载入编辑器并标记未保存，由自动保存持久化 */
  const importFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // 允许重复导入同一文件
      if (!file) return;
      try {
        const text = await file.text();
        if (!text.trim()) {
          addToast(tr({ zh: '文件内容为空', en: 'File is empty' }), 'error');
          return;
        }
        dispatch({ type: 'SET_MARKDOWN', payload: text });
        addToast(tr({ zh: '导入成功', en: 'Imported successfully' }), 'success');
      } catch {
        addToast(tr({ zh: '文件读取失败', en: 'Failed to read file' }), 'error');
      }
    },
    [dispatch, addToast, tr],
  );

  /** 导出当前 Markdown 为 .md 文件下载 */
  const exportMd = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentResume?.title || tr({ zh: '简历', en: 'Resume' })).replace(/[\\/:*?"<>|]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(tr({ zh: 'Markdown 导出成功', en: 'Markdown exported' }), 'success');
  }, [markdown, currentResume, addToast, tr]);

  return { importFile, exportMd };
}
