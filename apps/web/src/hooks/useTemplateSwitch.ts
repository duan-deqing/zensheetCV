import { useCallback } from 'react';
import { usePreview } from '@/store/PreviewContext';
import { useResumeStore } from '@/store/ResumeContext';
import { getTemplateById, toApiTemplate } from '@/templates';
import { DEFAULT_CONTENT_PADDING } from '@/preview/previewShared';
import type { ThemeConfig } from '@stylan/shared-types';

/** 切换模板的统一逻辑（主题侧边栏下拉与模板库弹窗共用）：
 *  视觉主题重置为模板默认；页面布局设置（页边距/内容边距）与自定义图标保留 */
export function useTemplateSwitch() {
  const { themeConfig, setCurrentTemplate, setThemeConfig } = usePreview();
  const { updateTemplate, updateTheme } = useResumeStore();

  return useCallback(
    (templateId: string) => {
      const template = getTemplateById(templateId);
      setCurrentTemplate(toApiTemplate(template));
      const nextTheme: ThemeConfig = {
        primaryColor: template.defaultTheme.primaryColor,
        fontFamily: template.defaultTheme.fontFamily,
        fontSize: template.defaultTheme.fontSize,
        lineHeight: template.defaultTheme.lineHeight,
        marginX: themeConfig.marginX,
        marginY: themeConfig.marginY,
        contentPadding: themeConfig.contentPadding ?? DEFAULT_CONTENT_PADDING,
        customIcons: themeConfig.customIcons,
        photos: themeConfig.photos,
      };
      setThemeConfig(nextTheme);
      // 模板默认主题一并写入，随自动保存落库
      updateTemplate(templateId);
      updateTheme(nextTheme);
    },
    [themeConfig, setCurrentTemplate, setThemeConfig, updateTemplate, updateTheme],
  );
}
