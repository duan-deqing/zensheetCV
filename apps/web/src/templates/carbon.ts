import type { TemplateDefinition } from './index';

/**
 * 「碳黑章标」——参考用户提供的简历设计图：
 * 灰底章节标题条 + 左侧主题色粗竖标、超大加粗姓名、方形列表符号、
 * 黑白灰配色、宽松行距，正式商务风。
 */
export const carbonTemplate: TemplateDefinition = {
  id: 'carbon',
  name: '碳黑章标',
  description: '灰底章节条 + 左侧竖标，黑白灰商务风，适合正式求职与国企/事业单位',
  thumbnail: '/templates/carbon-thumb.svg',
  blockMapping: {
    h1: 'name',
    h2: 'section-title',
    h3: 'item-title',
    ul: 'list',
    p: 'description',
    hr: 'divider',
  },
  pageBackground: '#FFFFFF',
  css: `
    .resume-preview {
      font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
      color: #1A1A1A;
      line-height: calc(1.75 * var(--resume-sp, 1));
      background: #FFFFFF;
      text-align: justify;
    }
    .resume-preview h1 {
      font-size: var(--resume-fs-h1, 30px);
      font-weight: 900;
      letter-spacing: 0.02em;
      /* 姓名颜色固定碳黑，不随主色调联动 */
      color: #1A1A1A;
      margin-bottom: calc(0.5rem * var(--resume-sp, 1));
    }
    .resume-preview h1 + p {
      font-weight: 700;
      color: #1A1A1A;
    }
    .resume-preview h2 {
      /* 章节条底色随主色调联动：主色 8% 混白（默认碳黑 ≈ #ECECEC 灰底），左侧主题色粗竖标（参考图最鲜明特征） */
      background: #ECECEC;
      background: color-mix(in srgb, var(--resume-primary, #1A1A1A) 8%, #ffffff);
      border-left: 5px solid var(--resume-primary, #1A1A1A);
      padding: 0.4rem 0.9rem;
      font-size: var(--resume-fs-h2, 20px);
      font-weight: 800;
      color: var(--resume-primary, #1A1A1A);
      margin-top: calc(2rem * var(--resume-sp, 1));
      margin-bottom: calc(1rem * var(--resume-sp, 1));
    }
    .resume-preview h3 {
      font-size: var(--resume-fs-h3, 14px);
      font-weight: 700;
      color: #1A1A1A;
      margin-top: calc(1.25rem * var(--resume-sp, 1));
      margin-bottom: calc(0.375rem * var(--resume-sp, 1));
    }
    .resume-preview ul { padding-left: 1.2rem; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ol { padding-left: 1.4rem; list-style: decimal; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ol li {
      margin-bottom: calc(0.45rem * var(--resume-sp, 1));
      color: #222222;
    }
    .resume-preview ol li::marker { color: #1A1A1A; }
    .resume-preview ul li {
      list-style: square;
      margin-bottom: calc(0.45rem * var(--resume-sp, 1));
      color: #222222;
    }
    .resume-preview ul li::marker { color: #1A1A1A; }
    .resume-preview p { margin-bottom: calc(0.5rem * var(--resume-sp, 1)); color: #333333; }
    .resume-preview code {
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
      font-size: 0.85em;
      font-weight: 600;
      padding: 0.1em 0.4em;
      display: inline-block;
      color: #222222;
      background-color: #F4F4F4;
      border: 1px solid #DDDDDD;
      border-radius: 3px;
      white-space: nowrap;
    }
    .resume-preview pre code {
      padding: 0;
      display: inline;
      background: transparent;
      border: none;
      border-radius: 0;
      color: inherit;
      white-space: pre-wrap;
    }
  `,
  defaultTheme: {
    primaryColor: '#1A1A1A',
    fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
    fontSize: 14,
    lineHeight: 1.4,
  },
};
