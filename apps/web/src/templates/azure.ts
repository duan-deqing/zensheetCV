import type { TemplateDefinition } from './index';

/**
 * 「青 Blueprint」——移植自 MujiCV blue 主题（极简色）：
 * 白底、主题色 h2 下划线、灰阶正文（#747474）、无任何装饰色块，克制留白。
 */
export const azureTemplate: TemplateDefinition = {
  id: 'azure',
  name: '青线极简',
  description: '主题色细线标题 + 灰阶正文，移植自 MujiCV 极简色主题，素净克制',
  thumbnail: '/templates/azure-thumb.svg',
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
    }
    .resume-preview h1 {
      font-size: calc(1.9rem * var(--resume-fs, 1));
      font-weight: 700;
      color: #333333;
      margin-bottom: calc(0.625rem * var(--resume-sp, 1));
    }
    .resume-preview h1 + p { color: #747474; }
    .resume-preview h2 {
      font-size: calc(1.15rem * var(--resume-fs, 1));
      font-weight: 700;
      color: var(--resume-primary, #5974D4);
      border-bottom: 1px solid var(--resume-primary, #5974D4);
      padding-bottom: 0.3rem;
      margin-top: calc(1.75rem * var(--resume-sp, 1));
      margin-bottom: calc(0.75rem * var(--resume-sp, 1));
    }
    .resume-preview h3 {
      font-size: calc(0.95rem * var(--resume-fs, 1));
      font-weight: 600;
      margin-top: calc(1rem * var(--resume-sp, 1));
      margin-bottom: calc(0.25rem * var(--resume-sp, 1));
      color: #4A4A4A;
    }
    .resume-preview h3 + p { color: #9A9A9A; font-size: 0.875em; }
    .resume-preview ul { padding-left: 1.25rem; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ul li {
      font-size: 0.9em;
      margin-bottom: calc(0.375rem * var(--resume-sp, 1));
      color: #747474;
    }
    .resume-preview ul li::marker { color: var(--resume-primary, #5974D4); }
    .resume-preview p { margin-bottom: calc(0.5rem * var(--resume-sp, 1)); color: #747474; font-size: 0.95em; }
    .resume-preview a { color: #747474; text-decoration: none; }
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
    primaryColor: '#5974D4',
    fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
    fontSize: 'base',
    spacing: 'normal',
  },
};
