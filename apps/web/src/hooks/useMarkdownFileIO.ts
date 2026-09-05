import { useCallback } from 'react';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useTr } from '@/i18n/LangContext';
import type { StatusKind } from '@/components/ButtonStatus';

type Notify = (kind: StatusKind, text: string) => void;

/** Markdown 导入 / 导出：桌面 FileMenu 与手机折叠菜单共用同一套行为与提示文案。
 *  show 由调用方注入（桌面为 FileMenu 自身气泡，手机端为顶栏保存按钮旁的共享气泡） */
export function useMarkdownFileIO(show: Notify) {
  const { markdown } = useEditor();
  const { currentResume } = useResumeStore();
  const dispatch = useEditorDispatch();
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
          show('error', tr({ zh: '文件内容为空', en: 'File is empty' }));
          return;
        }
        dispatch({ type: 'SET_MARKDOWN', payload: text });
        show('success', tr({ zh: '导入成功', en: 'Imported successfully' }));
      } catch {
        show('error', tr({ zh: '文件读取失败', en: 'Failed to read file' }));
      }
    },
    [dispatch, show, tr],
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
    show('success', tr({ zh: 'Markdown 导出成功', en: 'Markdown exported' }));
  }, [markdown, currentResume, show, tr]);

  return { importFile, exportMd };
}
