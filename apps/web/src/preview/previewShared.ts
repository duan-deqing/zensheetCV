import type { FontSizeOption, MarginOption, SpacingOption } from '@stylan/shared-types';

/** 字号/间距档位 → CSS 缩放系数，模板内通过 calc(var() * 基准值) 生效 */
export const FONT_SCALE: Record<FontSizeOption, number> = {
  xs: 0.85, sm: 0.92, base: 1, lg: 1.1, xl: 1.2,
};
export const SPACING_SCALE: Record<SpacingOption, number> = {
  tight: 0.8, compact: 0.9, normal: 1, relaxed: 1.15, loose: 1.3,
};

/** 页边距档位 → mm（预览内边距与 PDF 导出 Playwright margin 共用同一映射） */
export const MARGIN_MM: Record<MarginOption, number> = {
  none: 0, narrow: 8, normal: 12, wide: 20,
};

/** 内容边距档位 → mm（内容到页面边界的距离，叠加在页边距上） */
export const CONTENT_PADDING_MM: Record<MarginOption, number> = {
  none: 0, narrow: 5, normal: 10, wide: 15,
};

/** 默认内容边距档位：标准 10mm（theme_config 缺失该字段时的回退值） */
export const DEFAULT_CONTENT_PADDING: MarginOption = 'normal';

/** A4 纸张尺寸（mm@96dpi：210mm ≈ 794px），预览纸张与 PDF 导出换算共用 */
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

/** :::left / :::mid / :::right 三栏布局样式。
 * scope 为空时全局生效；传入选择器前缀（如 '.rp-thumb'）时仅作用于该容器内。
 * 弹性基准取内容宽度（flex-basis: auto），按内容分配比例、减少换行；
 * space-between 使左栏贴左、右栏贴右；单栏最大 55% 防止挤压其余栏 */
export const resumeColsCss = (scope = '') => `
  ${scope} .resume-cols {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: calc(0.5rem * var(--resume-sp, 1));
  }
  ${scope} .resume-col { flex: 0 1 auto; max-width: 55%; }
  ${scope} .resume-col-left { text-align: left; }
  ${scope} .resume-col-mid { text-align: center; }
  ${scope} .resume-col-right { text-align: right; }
`;

/** `>` 引用块样式：左侧主色竖线 + 缩进 + 弱化文字；
 * Tailwind preflight 会重置 blockquote 默认样式，必须在预览中显式定义 */
export const resumeQuoteCss = (scope = '') => `
  ${scope} blockquote {
    margin: calc(0.75rem * var(--resume-sp, 1)) 0;
    padding: 0.2rem 0 0.2rem 0.9rem;
    border-left: 3px solid var(--resume-primary, #1a1a1a);
    color: #4b5563;
  }
  ${scope} blockquote p {
    margin: 0.3rem 0;
  }
`;

/** `icon:名称` 图标样式：尺寸随字号（1em），颜色跟随文字（currentColor） */
export const resumeIconsCss = (scope = '') => `
  ${scope} .resume-icon {
    display: inline-flex;
    align-items: center;
    vertical-align: -0.125em;
  }
  ${scope} .resume-icon svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
  }
`;
