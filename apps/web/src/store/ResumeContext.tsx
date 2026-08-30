import { createContext, useContext, useState, ReactNode } from 'react';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import type { Resume, ThemeConfig } from '@stylan/shared-types';

interface ResumeContextType {
  currentResume: Resume | null;
  resumes: Resume[];
  isLoading: boolean;
  error: string | null;
  setCurrentResume: (resume: Resume | null) => void;
  setResumes: (resumes: Resume[]) => void;
  updateMarkdown: (markdown: string) => void;
  updateTemplate: (templateId: string) => void;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ResumeProvider 位于 EditorProvider 内部，可联动编辑器脏标记以触发自动保存
  const { markdown } = useEditor();
  const editorDispatch = useEditorDispatch();

  // 均使用函数式更新：连续调用（如切换模板时同时写入默认主题）时
  // 基于最新 state 合并，避免闭包中的旧快照互相覆盖字段
  const updateMarkdown = (markdown: string) => {
    setCurrentResume((prev) => (prev ? { ...prev, markdown } : prev));
  };

  const updateTemplate = (templateId: string) => {
    setCurrentResume((prev) => (prev ? { ...prev, template_id: templateId } : prev));
    editorDispatch({ type: 'SET_MARKDOWN', payload: markdown });
  };

  const updateTheme = (theme: Partial<ThemeConfig>) => {
    setCurrentResume((prev) =>
      prev ? { ...prev, theme_config: { ...prev.theme_config, ...theme } } : prev,
    );
    editorDispatch({ type: 'SET_MARKDOWN', payload: markdown });
  };

  return (
    <ResumeContext.Provider
      value={{
        currentResume,
        resumes,
        isLoading,
        error,
        setCurrentResume,
        setResumes,
        updateMarkdown,
        updateTemplate,
        updateTheme,
        setLoading,
        setError,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResumeStore() {
  const context = useContext(ResumeContext);
  if (!context) throw new Error('useResumeStore must be used within ResumeProvider');
  return context;
}
