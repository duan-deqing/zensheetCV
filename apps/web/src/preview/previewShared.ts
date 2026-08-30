import type { FontSizeOption, SpacingOption } from '@stylan/shared-types';

/** 字号/间距档位 → CSS 缩放系数，模板内通过 calc(var() * 基准值) 生效 */
export const FONT_SCALE: Record<FontSizeOption, number> = {
  xs: 0.85, sm: 0.92, base: 1, lg: 1.1, xl: 1.2,
};
export const SPACING_SCALE: Record<SpacingOption, number> = {
  tight: 0.8, compact: 0.9, normal: 1, relaxed: 1.15, loose: 1.3,
};

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
