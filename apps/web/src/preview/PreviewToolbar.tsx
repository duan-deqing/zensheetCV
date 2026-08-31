import { useCallback } from 'react';
import { usePreview } from '@/store/PreviewContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useUI } from '@/store/UIContext';
import { builtinTemplates, getTemplateById, toApiTemplate } from '@/templates';
import { Dropdown } from '@/components/Dropdown';
import type { ThemeConfig } from '@stylan/shared-types';

/** 调色盘线性图标，颜色跟随 currentColor */
function PaletteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

export function PreviewToolbar() {
  const { currentTemplate, themeConfig, scale, setScale, isFullscreen, toggleFullscreen, setCurrentTemplate, setThemeConfig } = usePreview();
  const { updateTemplate, updateTheme } = useResumeStore();
  const { themePanelOpen, toggleThemePanel } = useUI();

  const handleTemplateChange = useCallback((templateId: string) => {
    const template = getTemplateById(templateId);

    // Update preview context
    setCurrentTemplate(toApiTemplate(template));
    // 切换模板只重置视觉主题（主色/字体/字号/间距）为模板默认；
    // 页面布局设置（页边距/内容边距）保留用户当前选择，对所有模板生效
    const nextTheme: ThemeConfig = {
      primaryColor: template.defaultTheme.primaryColor,
      fontFamily: template.defaultTheme.fontFamily,
      fontSize: template.defaultTheme.fontSize,
      spacing: template.defaultTheme.spacing,
      marginX: themeConfig.marginX,
      marginY: themeConfig.marginY,
      contentPadding: themeConfig.contentPadding ?? 'none',
    };
    setThemeConfig(nextTheme);

    // Update resume data（模板默认主题一并写入，随自动保存落库）
    updateTemplate(templateId);
    updateTheme(nextTheme);
  }, [currentTemplate?.id, setCurrentTemplate, setThemeConfig, themeConfig, updateTemplate, updateTheme]);

  return (
    <div className="relative flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0"
        aria-hidden="true"
      >
        {'< PREVIEW />'}
      </p>
      <span className="w-px h-4 bg-gray-200 shrink-0" aria-hidden="true" />
      <Dropdown
        className="w-32 shrink-0"
        options={builtinTemplates.map((t) => ({ value: t.id, label: t.name }))}
        value={currentTemplate?.id || 'classic'}
        onChange={handleTemplateChange}
        ariaLabel="选择模板"
        placeholder="选择模板"
      />
      <div className="ml-auto flex items-center gap-1 shrink-0">
        <button
          onClick={toggleThemePanel}
          className={`h-7 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-md transition-colors ${
            themePanelOpen
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
          }`}
          title="主题配置"
        >
          <PaletteIcon />
          主题
        </button>
        <span className="w-px h-4 bg-gray-200 shrink-0" aria-hidden="true" />
        <button
          onClick={() => setScale(Math.max(50, scale - 10))}
          className="font-mono text-xs w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
          title="缩小"
        >
          −
        </button>
        <span className="font-mono text-xs text-gray-500 w-10 text-center tabular-nums">{scale}%</span>
        <button
          onClick={() => setScale(Math.min(150, scale + 10))}
          className="font-mono text-xs w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
          title="放大"
        >
          +
        </button>
        <button
          onClick={toggleFullscreen}
          className="font-mono text-xs w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors ml-1"
          title={isFullscreen ? '退出全屏' : '全屏预览'}
        >
          {isFullscreen ? '⊡' : '⊞'}
        </button>
      </div>
    </div>
  );
}
