import type { MarginOption } from '@stylan/shared-types';

/** 字号/行距缩放基准：--resume-fs / --resume-sp 为 1.0 时对应 14px 字号与 1.6 倍行距，
 * 模板内所有字号与垂直留白均通过 calc(var() * 基准值) 等比缩放 */
export const BASE_FONT_SIZE = 14;
export const BASE_LINE_HEIGHT = 1.6;

const clampNum = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** 旧版档位字符串 → 数值映射（历史 theme_config 数据兼容） */
const LEGACY_FONT_SIZE: Record<string, number> = { xs: 12, sm: 13, base: 14, lg: 15, xl: 17 };
const LEGACY_LINE_HEIGHT: Record<string, number> = {
  tight: 1.3, compact: 1.45, normal: 1.6, relaxed: 1.85, loose: 2.1,
};

/** 归一化正文字号：数值限定 10 ~ 30 px，旧档位字符串按就近 px 映射 */
export function normalizeFontSize(v: unknown, fallback = BASE_FONT_SIZE): number {
  if (typeof v === 'number' && Number.isFinite(v)) return clampNum(Math.round(v), 10, 30);
  if (typeof v === 'string' && LEGACY_FONT_SIZE[v] != null) return LEGACY_FONT_SIZE[v];
  return fallback;
}

/** 归一化行距：数值限定 1.2 ~ 2.5 倍，旧档位字符串按就近倍数映射 */
export function normalizeLineHeight(v: unknown, fallback = BASE_LINE_HEIGHT): number {
  if (typeof v === 'number' && Number.isFinite(v)) return clampNum(Math.round(v * 10) / 10, 1.2, 2.5);
  if (typeof v === 'string' && LEGACY_LINE_HEIGHT[v] != null) return LEGACY_LINE_HEIGHT[v];
  return fallback;
}

/** 主题 → --resume-fs 字号缩放系数（自动兼容旧档位数据） */
export function fontScale(theme?: { fontSize?: unknown } | null): number {
  return normalizeFontSize(theme?.fontSize) / BASE_FONT_SIZE;
}

/** 主题 → --resume-sp 行距缩放系数；旧版 spacing 档位字段同样兼容 */
export function spacingScale(theme?: { lineHeight?: unknown; spacing?: unknown } | null): number {
  return normalizeLineHeight(theme?.lineHeight ?? theme?.spacing) / BASE_LINE_HEIGHT;
}

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
