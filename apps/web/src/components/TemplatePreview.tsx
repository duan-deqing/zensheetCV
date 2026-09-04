import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
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
  resumeQuoteCss,
} from '@/preview/previewShared';
import { defaultTheme } from '@stylan/shared-types';
import { SAMPLE_MARKDOWN as PREVIEW_MARKDOWN } from '@/sampleResume';
import { normalizeColMarkers, remarkResumeCols } from '@/preview/remarkResumeCols';

/** A4 设计稿尺寸（px，96dpi），与预览/导出一致 */
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

interface TemplatePreviewProps {
  templateId: string;
  /** 可视区高度（px） */
  height: number;
  /** page = 整页等比缩放完整显示（默认，主题面板卡片用）；
   *  fill = 等比缩放至占满卡片宽度，纵向超出部分隐藏（模板库卡片用） */
  mode?: 'page' | 'fill';
  className?: string;
}

/** 模板卡片预览：与首页/编辑页同一套作用域替换方案 + 主题变量注入，
 *  完整示例简历整页等比缩放展示，供模板库弹窗与主题面板卡片共用 */
export function TemplatePreview({ templateId, height, mode = 'page', className = '' }: TemplatePreviewProps) {
  const scoped = getTemplateCss(templateId).replace(
    /\.resume-preview/g,
    `.tpl-${templateId}`,
  );
  const iconMap = getIconMap();
  const components = {
    [RESUME_ICON_TAG]: ({ name }: { name?: string }) => {
      const svg = name ? iconMap[name] : undefined;
      if (!svg) return null;
      return <span className="resume-icon" dangerouslySetInnerHTML={{ __html: svg }} />;
    },
  } as Components; // 自定义元素名不在 JSX.IntrinsicElements 中，需断言
  // 与预览/导出一致的每页留白 = 页边距 + 内容边距
  const padXMM =
    (MARGIN_MM[defaultTheme.marginX] ?? 0) + (CONTENT_PADDING_MM[defaultTheme.contentPadding] ?? 0);
  // 与编辑页/首页同一套主题变量注入，保证卡片预览与真实预览逐像素同构
  const theme = getTemplateById(templateId).defaultTheme;

  // 测量可视区与内容实际高度，等比缩放（webfont 加载后自动重算）：
  // page 模式整页完整显示居中；fill 模式占满卡片宽度、左上对齐，纵向超出由 overflow 隐藏
  const boxRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState({ scale: 0, paperH: PAGE_HEIGHT });

  useLayoutEffect(() => {
    const box = boxRef.current;
    const page = pageRef.current;
    if (!box || !page) return;
    const compute = () => {
      const paperH = Math.max(PAGE_HEIGHT, page.scrollHeight);
      const scale =
        mode === 'fill'
          ? box.clientWidth / PAGE_WIDTH
          : Math.min(box.clientWidth / PAGE_WIDTH, height / paperH);
      setFit((prev) =>
        prev.scale === scale && prev.paperH === paperH ? prev : { scale, paperH },
      );
    };
    compute();
    if (typeof ResizeObserver === 'undefined') return; // jsdom 环境无 ResizeObserver
    const ro = new ResizeObserver(compute);
    ro.observe(page);
    ro.observe(box);
    return () => ro.disconnect();
  }, [templateId, height, mode]);

  const fillMode = mode === 'fill';

  return (
    <div ref={boxRef} className={`relative overflow-hidden bg-gray-50 ${className}`} style={{ height }}>
      <style>{scoped}</style>
      <style>{resumeIconsCss(`.tpl-${templateId}`)}</style>
      <style>{resumeQuoteCss(`.tpl-${templateId}`)}</style>
      <style>{resumeColsCss(`.tpl-${templateId}`)}</style>
      <style>{resumeFontSizeCss(`.tpl-${templateId}`)}</style>
      <div
        ref={pageRef}
        className={`tpl-${templateId} absolute top-0 origin-top-left bg-white`}
        style={
          {
            left: fillMode ? 0 : `calc(50% - ${(PAGE_WIDTH * fit.scale) / 2}px)`,
            top: fillMode ? 0 : `calc(50% - ${(fit.paperH * fit.scale) / 2}px)`,
            transform: `scale(${fit.scale})`,
            width: PAGE_WIDTH,
            minHeight: PAGE_HEIGHT,
            '--resume-primary': theme.primaryColor,
            fontFamily: theme.fontFamily,
            '--resume-fs': fontScale(theme),
            '--resume-sp': spacingScale(theme),
          } as CSSProperties
        }
      >
        <div style={{ padding: `${padXMM}mm ${padXMM}mm` }}>
          <ReactMarkdown
            remarkPlugins={[remarkResumeCols, remarkResumeIcons(iconMap)]}
            rehypePlugins={[rehypeWrapH2Text]}
            components={components}
          >
            {normalizeColMarkers(PREVIEW_MARKDOWN)}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
