import { useEffect, useState } from 'react';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useUI } from '@/store/UIContext';
import { useResume } from '@/hooks/useResume';
import { ButtonStatus, useButtonStatus } from '@/components/ButtonStatus';
import { useTr } from '@/i18n/LangContext';

/** 保存线性图标，颜色跟随 currentColor */
function SaveIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 ${className}`} aria-hidden="true">
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
  const { savedPulse, pulseSaved } = useUI();
  const tr = useTr();
  const [saving, setSaving] = useState(false);
  // 保存成功后短暂触发「落定回弹」动画，随后复位；手动与自动保存统一由 savedPulse 驱动
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (savedPulse === 0) return;
    setJustSaved(true);
    const t = window.setTimeout(() => setJustSaved(false), 450);
    return () => window.clearTimeout(t);
  }, [savedPulse]);

  const handleSave = async () => {
    if (!currentResume) {
      show('error', tr({ zh: '请先创建简历', en: 'Create a resume first' }));
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
      show('success', tr({ zh: '保存成功', en: 'Saved successfully' }));
      pulseSaved();
    } else {
      show('error', tr({ zh: '保存失败', en: 'Save failed' }));
    }
    setSaving(false);
  };

  return (
    <button
      onClick={handleSave}
      disabled={!isDirty || saving}
      className={`relative px-3.5 h-8 inline-flex items-center gap-1.5 text-[13px] font-medium rounded-full transition-all duration-300 ${
        justSaved ? 'save-settle' : ''
      } ${
        isDirty
          ? 'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98]'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {saving ? (
        // 手机端仅图标：保存中给图标加脉冲示意进行状态
        <span className="hidden sm:inline">{tr({ zh: '保存中...', en: 'Saving…' })}</span>
      ) : (
        // key 变化触发文案重挂载：保存 ↔ 已保存 切换时淡入上浮
        <span key={isDirty ? 'dirty' : 'clean'} className={`save-label-in hidden sm:inline ${saving ? 'animate-pulse' : ''}`}>
          {isDirty ? tr({ zh: '保存', en: 'Save' }) : tr({ zh: '已保存', en: 'Saved' })}
        </span>
      )}
      <SaveIcon className={saving ? 'animate-pulse' : ''} />
      <ButtonStatus status={status} exiting={exiting} placement="left" />
    </button>
  );
}
