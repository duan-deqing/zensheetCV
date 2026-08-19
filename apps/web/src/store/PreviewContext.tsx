import { createContext, useContext, useState, ReactNode } from 'react';
import type { ThemeConfig, Template } from '@stylan/shared-types';
import { defaultTheme } from '@stylan/shared-types';

interface PreviewContextType {
  currentTemplate: Template | null;
  templates: Template[];
  themeConfig: ThemeConfig;
  scale: number;
  isFullscreen: boolean;
  setCurrentTemplate: (template: Template) => void;
  setTemplates: (templates: Template[]) => void;
  setThemeConfig: (config: ThemeConfig) => void;
  setScale: (scale: number) => void;
  toggleFullscreen: () => void;
}

const PreviewContext = createContext<PreviewContextType | null>(null);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(defaultTheme);
  const [scale, setScale] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  return (
    <PreviewContext.Provider
      value={{
        currentTemplate,
        templates,
        themeConfig,
        scale,
        isFullscreen,
        setCurrentTemplate,
        setTemplates,
        setThemeConfig,
        setScale,
        toggleFullscreen,
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (!context) throw new Error('usePreview must be used within PreviewProvider');
  return context;
}
