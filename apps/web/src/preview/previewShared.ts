import type {
  ElementFontSizes,
  MarginOption,
} from '@stylan/shared-types';
import { defaultElementFontSizes } from '@stylan/shared-types';

/** 字号/行距缩放基准：--resume-fs / --resume-sp 为 1.0 时对应 14px 字号与 1.6 倍行距，
 * 模板内所有字号与垂直留白均通过 calc(var() * 基准值) 等比缩放 */
export const BASE_FONT_SIZE = 14;
export const BASE_LINE_HEIGHT = 1.6;

/** 行距默认值：未设置时按 1.4 倍渲染（BASE_LINE_HEIGHT 仅作缩放基准，保证旧数据渲染不变） */
export const DEFAULT_LINE_HEIGHT = 1.4;

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
export function normalizeLineHeight(v: unknown, fallback = DEFAULT_LINE_HEIGHT): number {
  if (typeof v === 'number' && Number.isFinite(v)) return clampNum(Math.round(v * 10) / 10, 1.2, 2.5);
  if (typeof v === 'string' && LEGACY_LINE_HEIGHT[v] != null) return LEGACY_LINE_HEIGHT[v];
  return fallback;
}

/** 主题 → --resume-fs 字号缩放系数（自动兼容旧档位数据） */
export function fontScale(theme?: { fontSize?: unknown } | null): number {
  return normalizeFontSize(theme?.fontSize) / BASE_FONT_SIZE;
}

/** 分类字号（H1~H5 / 段落 / 列表）→ CSS 变量名映射 */
export const ELEMENT_FONT_SIZE_VAR: Record<keyof ElementFontSizes, string> = {
  h1: '--resume-fs-h1',
  h2: '--resume-fs-h2',
  h3: '--resume-fs-h3',
  h4: '--resume-fs-h4',
  h5: '--resume-fs-h5',
  p: '--resume-fs-p',
  list: '--resume-fs-list',
};

/** 各分类字号上限（px）：与主题面板下拉选项一致 —— 10 ~ 30，H1 默认 30 可调至 40 */
const ELEMENT_FONT_SIZE_MAX: Record<keyof ElementFontSizes, number> = {
  h1: 40, h2: 30, h3: 30, h4: 30, h5: 30, p: 30, list: 30,
};

/** 归一化分类字号：逐项限定取值范围，未设置/非法值回退默认值 */
export function normalizeElementFontSizes(
  v?: Partial<ElementFontSizes> | null,
): ElementFontSizes {
  const pick = (raw: unknown, key: keyof ElementFontSizes) =>
    typeof raw === 'number' && Number.isFinite(raw)
      ? clampNum(Math.round(raw), 10, ELEMENT_FONT_SIZE_MAX[key])
      : defaultElementFontSizes[key];
  return {
    h1: pick(v?.h1, 'h1'),
    h2: pick(v?.h2, 'h2'),
    h3: pick(v?.h3, 'h3'),
    h4: pick(v?.h4, 'h4'),
    h5: pick(v?.h5, 'h5'),
    p: pick(v?.p, 'p'),
    list: pick(v?.list, 'list'),
  };
}

/** 主题 → 分类字号 CSS 变量声明（注入到 .resume-preview），
 *  模板 CSS 与共享样式通过 var(--resume-fs-*) 消费 */
export function elementFontSizeVars(
  theme?: { elementFontSizes?: Partial<ElementFontSizes> } | null,
): string {
  const sizes = normalizeElementFontSizes(theme?.elementFontSizes);
  return (Object.keys(ELEMENT_FONT_SIZE_VAR) as Array<keyof ElementFontSizes>)
    .map((k) => `${ELEMENT_FONT_SIZE_VAR[k]}:${sizes[k]}px`)
    .join(';');
}

/** h4/h5/段落/列表字号规则：模板 CSS 未定义这些元素的 font-size，由共享规则统一提供；
 *  h1~h3 的 font-size 在各模板 CSS 中定义（fallback 同为默认值）。
 *  选择器覆盖 ul li / ol li / h1~h5 + p 等复合形式（与模板潜在规则同特异性），
 *  且本规则注入顺序在模板 CSS 之后，可稳定压过模板历史硬编码，保证分类字号在所有模板生效。
 *  scope 为空时作用于 .resume-preview，传入容器选择器时仅作用于该容器内 */
export const resumeFontSizeCss = (scope = '') => {
  const root = scope || '.resume-preview';
  return `
    ${root} h4, ${root} ul h4, ${root} ol h4 { font-size: var(--resume-fs-h4, ${defaultElementFontSizes.h4}px); }
    ${root} h5, ${root} ul h5, ${root} ol h5 { font-size: var(--resume-fs-h5, ${defaultElementFontSizes.h5}px); }
    ${root} p, ${root} h1 + p, ${root} h2 + p, ${root} h3 + p, ${root} h4 + p, ${root} h5 + p { font-size: var(--resume-fs-p, ${defaultElementFontSizes.p}px); }
    ${root} li, ${root} ul li, ${root} ol li { font-size: var(--resume-fs-list, ${defaultElementFontSizes.list}px); }
  `;
};

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

/** 最小 hast 节点结构（仅遍历所需字段，避免依赖 hast 类型包） */
interface MinimalHastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: MinimalHastNode[];
}

/** rehype 插件：把 h2 的子节点包进 `<span class="h2-text">`。
 *  「墨纸极简」模板的居中胶囊章节标题需要给标题文字设置深色底 +
 *  白字 + 全圆角，而纯 CSS 无法为 flex 匿名文本项设置背景，必须以真实
 *  元素作为样式载体；其余模板不引用 .h2-text，包装后渲染不受影响 */
export function rehypeWrapH2Text() {
  return (tree: MinimalHastNode): void => {
    const visit = (node: MinimalHastNode): void => {
      if (!node.children || node.children.length === 0) return;
      if (node.type === 'element' && node.tagName === 'h2') {
        node.children = [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['h2-text'] },
            children: node.children,
          },
        ];
      }
      node.children.forEach(visit);
    };
    visit(tree);
  };
}
