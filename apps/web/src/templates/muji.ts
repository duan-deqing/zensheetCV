import type { TemplateDefinition } from './index';

/**
 * 「墨纸极简」——深色题头横幅（姓名 + 联系信息白字延续横幅）、
 * 居中浅灰胶囊章节标题（两侧延伸细线）、方形列表符号、黑白灰沉稳商务风。
 */
export const mujiTemplate: TemplateDefinition = {
  id: 'muji',
  name: '墨纸极简',
  description: '深色题头横幅 + 居中胶囊标题，黑白灰沉稳耐看',
  thumbnail: '/templates/muji-thumb.svg',
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
      color: #333333;
      line-height: calc(1.7 * var(--resume-sp, 1));
      background: #FFFFFF;
      text-align: justify;
    }
    /* —— 深色题头横幅：姓名 + 白色细分隔线，联系信息白字延续同一横幅 —— */
    .resume-preview h1 {
      font-size: var(--resume-fs-h1, 30px);
      font-weight: 900;
      letter-spacing: 0.02em;
      color: #FFFFFF;
      background: var(--resume-primary, #39393A);
      padding: 0.9rem 1.25rem 0.7rem;
      margin-bottom: 0;
    }
    /* 联系行（h1 后紧跟的 p，及 ::: 三栏块与其后第一行）：深底白字、
       零外边距无缝拼接成同一横幅；统一 0.85rem 底部内边距，行间与收尾间距一致 */
    .resume-preview h1 + p,
    .resume-preview h1 + p + p,
    .resume-preview h1 + .resume-cols,
    .resume-preview h1 + .resume-cols + p {
      background: var(--resume-primary, #39393A);
      color: #FFFFFF;
      margin: 0;
      padding: 0 1.25rem 0.85rem;
    }
    .resume-preview h1 + .resume-cols p {
      color: #FFFFFF;
      margin: 0;
    }
    .resume-preview h2 {
      /* 居中胶囊标题，两侧延伸细线（flex 匿名文本项 + 弹性伪元素线） */
      display: flex;
      align-items: center;
      gap: 0.875rem;
      font-size: var(--resume-fs-h2, 20px);
      font-weight: 700;
      color: #333333;
      margin-top: calc(1.75rem * var(--resume-sp, 1));
      margin-bottom: calc(0.75rem * var(--resume-sp, 1));
    }
    .resume-preview h2::before,
    .resume-preview h2::after {
      content: '';
      flex: 1 1 0;
      height: 1px;
      background: #E3E3E3;
    }
    /* 胶囊载体：rehypeWrapH2Text 把 h2 文本包进 .h2-text（纯 CSS 无法
       为 flex 匿名文本项设置背景），浅灰底黑字全圆角 */
    .resume-preview h2 .h2-text {
      background: #F1F1F1;
      color: #1A1A1A;
      border-radius: 999px;
      padding: 0.3rem 1.5rem;
      line-height: 1.5;
    }
    .resume-preview h3 {
      font-size: var(--resume-fs-h3, 14px);
      font-weight: 700;
      margin-top: calc(1rem * var(--resume-sp, 1));
      margin-bottom: calc(0.25rem * var(--resume-sp, 1));
      color: #1A1A1A;
    }
    .resume-preview ul { padding-left: 1.1rem; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ol { padding-left: 1.4rem; list-style: decimal; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ol li {
      margin-bottom: calc(0.375rem * var(--resume-sp, 1));
      color: #444444;
    }
    .resume-preview ol li::marker { color: #444444; }
    .resume-preview ul li {
      list-style: square;
      margin-bottom: calc(0.375rem * var(--resume-sp, 1));
      color: #444444;
    }
    .resume-preview ul li::marker { color: #444444; }
    .resume-preview p { margin-bottom: calc(0.5rem * var(--resume-sp, 1)); color: #4A4A4A; }
    .resume-preview code {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 0.8125em;
      padding: 0.15em 0.4em;
      display: inline-block;
      color: #333333;
      background-color: rgba(27, 31, 35, 0.05);
      border-radius: 4px;
      white-space: nowrap;
    }
    .resume-preview pre code {
      padding: 0;
      display: inline;
      background: transparent;
      border-radius: 0;
      color: inherit;
      white-space: pre-wrap;
    }
  `,
  defaultTheme: {
    primaryColor: '#39393A',
    fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
    fontSize: 14,
    lineHeight: 1.4,
  },
};
