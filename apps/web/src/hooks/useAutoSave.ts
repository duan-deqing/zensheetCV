import { useEffect, useRef } from 'react';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useResume } from './useResume';

const AUTOSAVE_DELAY = 2000;

export function useAutoSave() {
  const { markdown, isDirty } = useEditor();
  const dispatch = useEditorDispatch();
  const { currentResume } = useResumeStore();
  const { updateResume } = useResume();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 保存期间若用户继续输入，不应误标为已保存
  const markdownRef = useRef(markdown);
  markdownRef.current = markdown;

  useEffect(() => {
    if (!isDirty || !currentResume) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      const savedMarkdown = markdown;
      const result = await updateResume(currentResume.id, {
        markdown,
        template_id: currentResume.template_id,
        theme_config: currentResume.theme_config,
      });
      if (result && markdownRef.current === savedMarkdown) {
        dispatch({ type: 'MARK_CLEAN' });
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [markdown, isDirty, currentResume, updateResume, dispatch]);
}
