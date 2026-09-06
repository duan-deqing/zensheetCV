/**
 * MiniResume / ResumePaper —— 首页展示用真实渲染管线（从 HomePage 抽出复用）。
 * MiniResume：react-markdown + 模板真实 CSS 渲染示例简历（非静态截图）；
 * ResumePaper：固定高度窗口 + 等比缩放，模拟 A4 纸预览。
 */
import ReactMarkdown, { type Components } from 'react-markdown';
import type { CSSProperties } from 'react';
import { getTemplateById, getTemplateCss } from '@/templates';
import { RESUME_ICON_TAG, getIconMap, remarkResumeIcons } from '@/preview/resumeIcons';
import {
  CONTENT_PADDING_MM,
  fontScale,
  MARGIN_MM,
  rehypeWrapH2Text,
  spacingScale,
  resumeColsCss,
  resumeFontSizeCss,
  resumeIconsCss,
} from '@/preview/previewShared';
import { defaultTheme } from '@stylan/shared-types';
import { sampleMarkdown } from '@/sampleResume';
import { normalizeColMarkers, remarkResumeCols } from '@/preview/remarkResumeCols';
import { useLang } from '@/i18n/LangContext';

export function MiniResume({
  templateId,
  className = '',
}: {
  templateId: string;
  className?: string;
}) {
  // 各模板 CSS 均以 .resume-preview 为作用域，替换前缀实现同页多模板互不干扰
  const scoped = getTemplateCss(templateId).replace(
    /\.resume-preview/g,
    `.rp-${templateId}`,
  );
  // 与编辑页/我的简历页一致：使用模板自带默认主题（主色/字体/字号/间距）
  const theme = getTemplateById(templateId).defaultTheme;
  // 按界面语言选择示例简历内容（中/英文版同人设同结构）
  const { lang } = useLang();
  // 每页四周总留白 = 页边距 + 内容边距，与分页预览/导出同一套默认值
  const padXMM =
    (MARGIN_MM[defaultTheme.marginX] ?? 0) + (CONTENT_PADDING_MM[defaultTheme.contentPadding] ?? 0);
  const padYMM =
    (MARGIN_MM[defaultTheme.marginY] ?? 0) + (CONTENT_PADDING_MM[defaultTheme.contentPadding] ?? 0);
  const iconMap = getIconMap();
  const components = {
    [RESUME_ICON_TAG]: ({ name }: { name?: string }) => {
      const svg = name ? iconMap[name] : undefined;
      if (!svg) return null;
      return <span className="resume-icon" dangerouslySetInnerHTML={{ __html: svg }} />;
    },
  } as Components; // 自定义元素名不在 JSX.IntrinsicElements 中，需断言
  return (
    <div className={className}>
      <style>{scoped}</style>
      <style>{resumeIconsCss(`.rp-${templateId}`)}</style>
      <style>{resumeColsCss(`.rp-${templateId}`)}</style>
      <style>{resumeFontSizeCss(`.rp-${templateId}`)}</style>
      <div
        className={`rp-${templateId}`}
        style={
          {
            '--resume-primary': theme.primaryColor,
            fontFamily: theme.fontFamily,
            '--resume-fs': fontScale(theme),
            '--resume-sp': spacingScale(theme),
          } as CSSProperties
        }
      >
        <div style={{ padding: `${padYMM}mm ${padXMM}mm` }}>
          <ReactMarkdown
            remarkPlugins={[remarkResumeCols, remarkResumeIcons(iconMap)]}
            rehypePlugins={[rehypeWrapH2Text]}
            components={components}
          >
            {normalizeColMarkers(sampleMarkdown(lang))}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

/** 固定高度窗口 + 等比缩放，模拟 A4 纸预览 */
export function ResumePaper({
  templateId,
  zoom = 0.42,
  className = '',
}: {
  templateId: string;
  zoom?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden bg-white ${className}`}>
      <div
        className="origin-top-left"
        style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }}
      >
        <MiniResume templateId={templateId} />
      </div>
    </div>
  );
}
