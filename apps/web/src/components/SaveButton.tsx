import { useState } from 'react';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useResume } from '@/hooks/useResume';
import { ButtonStatus, useButtonStatus } from '@/components/ButtonStatus';

/** 保存线性图标，颜色跟随 currentColor */
function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  );
}

export function SaveButton() {
  const { markdown, isDirty } = useEditor();
  const dispatch = useEditorDispatch();
  const { currentResume } = useResumeStore();
  const { updateResume } = useResume();
  const { status, exiting, show } = useButtonStatus();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentResume) {
      show('error', '请先创建简历');
      return;
    }
    setSaving(true);
    // 与自动保存保持一致，一并提交 template_id / theme_config，
    // 确保模板与主题变更随保存完整落库
    const result = await updateResume(currentResume.id, {
      markdown,
      template_id: currentResume.template_id,
      theme_config: currentResume.theme_config,
    });
    if (result) {
      dispatch({ type: 'MARK_CLEAN' });
      show('success', '保存成功');
    } else {
      show('error', '保存失败');
    }
    setSaving(false);
  };

  return (
    <button
      onClick={handleSave}
      disabled={!isDirty || saving}
      className={`relative px-3.5 h-8 inline-flex items-center gap-1.5 text-[13px] font-medium rounded-full transition-all ${
        isDirty
          ? 'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98]'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {saving ? '保存中...' : isDirty ? '保存' : '已保存'}
      <SaveIcon />
      <ButtonStatus status={status} exiting={exiting} placement="left" />
    </button>
  );
}
