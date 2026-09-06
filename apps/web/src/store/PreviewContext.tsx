import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode } from 'react';
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

export function PreviewProvider({
  children,
  initialTemplate,
  initialThemeReady,
}: {
  children: ReactNode;
  /** 懒初始化：传入时作为初始模板（首页工作台展示用，避免首帧骨架闪变） */
  initialTemplate?: Template | null;
  /** 懒初始化：传入 true 时跳过数据加载骨架，直接就绪 */
  initialThemeReady?: boolean;
}) {
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(initialTemplate ?? null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(defaultTheme);
  const [themeReady, setThemeReady] = useState(!!initialThemeReady);
  const [scale, setScale] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  /** 进入全屏前的缩放，退出时恢复 */
  const scaleBeforeFullscreenRef = useRef<number | null>(null);

  const toggleFullscreen = useCallback(() => {
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
  }, [isFullscreen, scale]);

  const value = useMemo(
    () => ({
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
    }),
    [currentTemplate, templates, themeConfig, themeReady, scale, isFullscreen, toggleFullscreen],
  );

  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (!context) throw new Error('usePreview must be used within PreviewProvider');
  return context;
}
