import type { TemplateDefinition } from './index';

export const techTemplate: TemplateDefinition = {
  id: 'tech',
  name: '技术极简',
  description: '极简技术风格，适合技术/开源/开发者',
  thumbnail: '/templates/tech-thumb.svg',
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
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      color: #111827;
      line-height: calc(1.6 * var(--resume-sp, 1));
      background: #FFFFFF;
      text-align: justify;
    }
    .resume-preview h1 {
      font-size: var(--resume-fs-h1, 30px);
      font-weight: 700;
      margin-bottom: calc(0.5rem * var(--resume-sp, 1));
      color: var(--resume-primary, #10B981);
    }
    .resume-preview h2 {
      font-size: var(--resume-fs-h2, 18px);
      font-weight: 600;
      margin-top: calc(1.5rem * var(--resume-sp, 1));
      margin-bottom: calc(0.75rem * var(--resume-sp, 1));
      color: var(--resume-primary, #10B981);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid #A7D7C5;
      border-bottom: 1px solid color-mix(in srgb, var(--resume-primary, #10B981) 45%, #FFFFFF);
      padding-bottom: 0.375rem;
    }
    /* Markdown 式「#」前缀：呼应等宽字体的终端气质 */
    .resume-preview h2::before {
      content: '#';
      color: var(--resume-primary, #10B981);
      margin-right: 0.55em;
    }
    .resume-preview h3 {
      font-size: var(--resume-fs-h3, 14px);
      font-weight: 600;
      margin-top: calc(0.75rem * var(--resume-sp, 1));
      margin-bottom: calc(0.25rem * var(--resume-sp, 1));
      color: #374151;
    }
    .resume-preview ul { padding-left: 1.1rem; list-style: disc; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ol { padding-left: 1.5rem; list-style: decimal; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ol li { margin-bottom: calc(0.25rem * var(--resume-sp, 1)); color: #4B5563; }
    .resume-preview ul li { margin-bottom: calc(0.25rem * var(--resume-sp, 1)); color: #4B5563; }
    .resume-preview ul li::marker { color: var(--resume-primary, #10B981); }
    .resume-preview p { margin-bottom: calc(0.5rem * var(--resume-sp, 1)); color: #4B5563; }
    /* 链接：主色文字 + 虚线下划线，终端超链接气质 */
    .resume-preview a {
      color: var(--resume-primary, #10B981);
      text-decoration: none;
      border-bottom: 1px dashed currentColor;
    }
    .resume-preview hr {
      border: none;
      border-top: 1px dashed #D1D5DB;
      margin: calc(1.25rem * var(--resume-sp, 1)) 0;
    }
    .resume-preview code {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 0.8125em;
      padding: 0.125em 0.45em;
      background: #F3F4F6;
      border: 1px solid #D1D5DB;
      border-radius: 4px;
      color: var(--resume-primary, #10B981);
      white-space: nowrap;
    }
    /* 代码块：浅底细边圆角，模拟终端输出窗 */
    .resume-preview pre {
      background: #F8FAF9;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 0.75rem 0.9rem;
      overflow-x: auto;
    }
    .resume-preview pre code {
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 0;
      color: inherit;
      white-space: pre-wrap;
    }
  `,
  defaultTheme: {
    primaryColor: '#10B981',
    fontFamily: "'Alibaba PuHuiTi', 'Noto Sans SC', sans-serif",
    fontSize: 13,
    lineHeight: 1.6,
  },
};
