import { createContext, useContext, useRef, useState, ReactNode } from 'react';
import type { ThemeConfig, Template } from '@stylan/shared-types';
import { defaultTheme } from '@stylan/shared-types';

interface PreviewContextType {
  currentTemplate: Template | null;
  templates: Template[];
  themeConfig: ThemeConfig;
  /** 简历数据是否已加载并同步到预览，未就绪前渲染骨架屏避免默认主题闪变 */
  themeReady: boolean;
  scale: number;
  isFullscreen: boolean;
  setCurrentTemplate: (template: Template) => void;
  setTemplates: (templates: Template[]) => void;
  setThemeConfig: (config: ThemeConfig) => void;
  setThemeReady: (ready: boolean) => void;
  setScale: (scale: number) => void;
  toggleFullscreen: () => void;
}

const PreviewContext = createContext<PreviewContextType | null>(null);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(defaultTheme);
  const [themeReady, setThemeReady] = useState(false);
  const [scale, setScale] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  /** 进入全屏前的缩放，退出时恢复 */
  const scaleBeforeFullscreenRef = useRef<number | null>(null);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      // 退出全屏：恢复之前的缩放
      if (scaleBeforeFullscreenRef.current !== null) {
        setScale(scaleBeforeFullscreenRef.current);
        scaleBeforeFullscreenRef.current = null;
      }
      setIsFullscreen(false);
    } else {
      // 进入全屏：缩放自动切换为 100%
      scaleBeforeFullscreenRef.current = scale;
      setScale(100);
      setIsFullscreen(true);
    }
  };

  return (
    <PreviewContext.Provider
      value={{
        currentTemplate,
        templates,
        themeConfig,
        themeReady,
        scale,
        isFullscreen,
        setCurrentTemplate,
        setTemplates,
        setThemeConfig,
        setThemeReady,
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
