import { useEffect, useRef } from 'react';
import { useEditor } from '@/store/EditorContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useResume } from './useResume';

const AUTOSAVE_DELAY = 2000;

export function useAutoSave() {
  const { markdown, isDirty } = useEditor();
  const { currentResume } = useResumeStore();
  const { updateResume } = useResume();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty || !currentResume) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      await updateResume(currentResume.id, { markdown });
    }, AUTOSAVE_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [markdown, isDirty, currentResume, updateResume]);
}
