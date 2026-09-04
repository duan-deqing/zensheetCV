import type { TemplateDefinition } from './index';

export const classicTemplate: TemplateDefinition = {
  id: 'classic',
  name: '经典简洁',
  description: '经典黑白设计，适合正式求职场景',
  thumbnail: '/templates/classic-thumb.svg',
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
      font-family: 'Inter', 'Noto Sans SC', sans-serif;
      color: #111827;
      line-height: calc(1.6 * var(--resume-sp, 1));
      text-align: justify;
    }
    .resume-preview h1 {
      font-size: var(--resume-fs-h1, 30px);
      font-weight: 700;
      margin-bottom: calc(0.5rem * var(--resume-sp, 1));
      color: var(--resume-primary, #111827);
    }
    .resume-preview h2 {
      font-size: var(--resume-fs-h2, 20px);
      font-weight: 600;
      margin-top: calc(1.5rem * var(--resume-sp, 1));
      margin-bottom: calc(0.75rem * var(--resume-sp, 1));
      padding-bottom: 0.25rem;
      border-bottom: 2px solid var(--resume-primary, #111827);
      color: var(--resume-primary, #111827);
    }
    .resume-preview h3 {
      font-size: var(--resume-fs-h3, 14px);
      font-weight: 600;
      margin-top: calc(1rem * var(--resume-sp, 1));
      margin-bottom: calc(0.25rem * var(--resume-sp, 1));
    }
    .resume-preview ul {
      padding-left: 1.25rem;
      list-style: disc;
      margin-bottom: calc(0.5rem * var(--resume-sp, 1));
    }
    .resume-preview ol {
      padding-left: 1.25rem;
      list-style: decimal;
      margin-bottom: calc(0.5rem * var(--resume-sp, 1));
    }
    .resume-preview li {
      margin-bottom: calc(0.25rem * var(--resume-sp, 1));
    }
    .resume-preview p {
      margin-bottom: calc(0.5rem * var(--resume-sp, 1));
    }
    .resume-preview code {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 0.8125em;
      padding: 0.125em 0.45em;
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      border-radius: 4px;
      color: #1F2937;
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
    primaryColor: '#111827',
    fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
    fontSize: 14,
    lineHeight: 1.4,
  },
};
