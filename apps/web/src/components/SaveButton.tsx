import { useState } from 'react';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useResume } from '@/hooks/useResume';
import { useToast } from '@/hooks/useToast';

export function SaveButton() {
  const { markdown, isDirty } = useEditor();
  const dispatch = useEditorDispatch();
  const { currentResume } = useResumeStore();
  const { updateResume } = useResume();
  const addToast = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentResume) {
      addToast('请先创建简历', 'error');
      return;
    }
    setSaving(true);
    const result = await updateResume(currentResume.id, { markdown });
    if (result) {
      dispatch({ type: 'MARK_CLEAN' });
      addToast('保存成功', 'success');
    } else {
      addToast('保存失败', 'error');
    }
    setSaving(false);
  };

  return (
    <button
      onClick={handleSave}
      disabled={!isDirty || saving}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
        isDirty
          ? 'bg-primary-600 text-white hover:bg-primary-700'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {saving ? '保存中...' : isDirty ? '保存' : '已保存'}
    </button>
  );
}
