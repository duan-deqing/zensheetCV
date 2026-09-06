import type { TemplateDefinition } from './index';

export const elegantTemplate: TemplateDefinition = {
  id: 'elegant',
  name: '优雅复古',
  description: '优雅复古设计，适合设计/创意/教育行业',
  thumbnail: '/templates/elegant-thumb.svg',
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
      font-family: 'Georgia', 'Noto Serif SC', serif;
      color: #2C2C2C;
      line-height: calc(1.7 * var(--resume-sp, 1));
      background: #FFFFFF;
      text-align: justify;
    }
    .resume-preview h1 {
      font-size: var(--resume-fs-h1, 30px);
      font-weight: 400;
      margin-bottom: calc(0.25rem * var(--resume-sp, 1));
      color: var(--resume-primary, #78350F);
      letter-spacing: 0.06em;
    }
    .resume-preview h2 {
      font-size: var(--resume-fs-h2, 18px);
      font-weight: 600;
      letter-spacing: 0.08em;
      margin-top: calc(2rem * var(--resume-sp, 1));
      margin-bottom: calc(0.75rem * var(--resume-sp, 1));
      color: var(--resume-primary, #78350F);
      /* 下划线随主色调联动：主色 45% 混白的浅调 */
      border-bottom: 1px solid #D4A574;
      border-bottom: 1px solid color-mix(in srgb, var(--resume-primary, #78350F) 45%, #FFFFFF);
      padding-bottom: 0.375rem;
    }
    .resume-preview h3 {
      font-size: var(--resume-fs-h3, 14px);
      font-weight: 600;
      margin-top: calc(1rem * var(--resume-sp, 1));
      margin-bottom: calc(0.25rem * var(--resume-sp, 1));
      color: #44403C;
    }
    .resume-preview ul { padding-left: 1.5rem; list-style: square; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ol { padding-left: 1.5rem; list-style: decimal; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview li { margin-bottom: calc(0.375rem * var(--resume-sp, 1)); }
    .resume-preview p { margin-bottom: calc(0.625rem * var(--resume-sp, 1)); }
    /* 复古暖调点缀：列表符号与强调/链接统一暖酒金色系 */
    .resume-preview ul li::marker {
      color: #B45309;
      color: color-mix(in srgb, var(--resume-primary, #78350F) 72%, #FFFFFF);
    }
    .resume-preview strong { color: var(--resume-primary, #78350F); }
    .resume-preview a {
      color: #92400E;
      color: color-mix(in srgb, var(--resume-primary, #78350F) 70%, #FFFFFF);
      text-decoration: none;
    }
    .resume-preview hr {
      border: none;
      border-top: 3px double #DCC9A8;
      width: 60%;
      margin: calc(1.5rem * var(--resume-sp, 1)) auto;
    }
    .resume-preview code {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 0.8125em;
      padding: 0.125em 0.5em;
      background: #F7F0E3;
      border: 1px solid #E7D8BF;
      border-radius: 3px;
      color: #92400E;
      white-space: nowrap;
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
    primaryColor: '#78350F',
    fontFamily: "'Times New Roman', 'Noto Serif SC', serif",
    fontSize: 14,
    lineHeight: 1.6,
  },
};
