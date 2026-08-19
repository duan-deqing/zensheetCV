import { createContext, useContext, useState, ReactNode } from 'react';
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

  const updateMarkdown = (markdown: string) => {
    if (currentResume) {
      setCurrentResume({ ...currentResume, markdown });
    }
  };

  const updateTemplate = (templateId: string) => {
    if (currentResume) {
      setCurrentResume({ ...currentResume, template_id: templateId });
    }
  };

  const updateTheme = (theme: Partial<ThemeConfig>) => {
    if (currentResume) {
      setCurrentResume({
        ...currentResume,
        theme_config: { ...currentResume.theme_config, ...theme },
      });
    }
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
