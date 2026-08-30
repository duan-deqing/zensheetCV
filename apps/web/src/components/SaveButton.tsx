import { useState } from 'react';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useResume } from '@/hooks/useResume';
import { ButtonStatus, useButtonStatus } from '@/components/ButtonStatus';

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
    // 避免后端部分更新时丢失未随请求发送的模板与主题变更
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
      className={`relative px-3.5 h-8 inline-flex items-center text-[13px] font-medium rounded-full transition-all ${
        isDirty
          ? 'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98]'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {saving ? '保存中...' : isDirty ? '保存' : '已保存'}
      <ButtonStatus status={status} exiting={exiting} placement="left" />
    </button>
  );
}
