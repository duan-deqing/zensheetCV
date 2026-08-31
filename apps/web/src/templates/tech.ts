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
  pageBackground: '#111827',
  css: `
    .resume-preview {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      color: #E5E7EB;
      line-height: calc(1.6 * var(--resume-sp, 1));
      background: #111827;
    }
    .resume-preview h1 {
      font-size: calc(1.75rem * var(--resume-fs, 1));
      font-weight: 700;
      margin-bottom: calc(0.5rem * var(--resume-sp, 1));
      color: var(--resume-primary, #10B981);
    }
    .resume-preview h2 {
      font-size: calc(0.875rem * var(--resume-fs, 1));
      font-weight: 600;
      margin-top: calc(1.5rem * var(--resume-sp, 1));
      margin-bottom: calc(0.75rem * var(--resume-sp, 1));
      color: var(--resume-primary, #10B981);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid #374151;
      padding-bottom: 0.375rem;
    }
    .resume-preview h3 {
      font-size: calc(0.9375rem * var(--resume-fs, 1));
      font-weight: 600;
      margin-top: calc(0.75rem * var(--resume-sp, 1));
      margin-bottom: calc(0.25rem * var(--resume-sp, 1));
      color: #D1D5DB;
    }
    .resume-preview ul { padding-left: 1rem; list-style: none; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ul li { position: relative; padding-left: 1rem; margin-bottom: calc(0.25rem * var(--resume-sp, 1)); color: #9CA3AF; }
    .resume-preview ul li::before {
      content: '>'; position: absolute; left: 0;
      color: var(--resume-primary, #10B981);
    }
    .resume-preview p { margin-bottom: calc(0.5rem * var(--resume-sp, 1)); color: #9CA3AF; }
    .resume-preview code {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 0.8125em;
      padding: 0.125em 0.45em;
      background: #1F2937;
      border: 1px solid #374151;
      border-radius: 4px;
      color: var(--resume-primary, #10B981);
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
    primaryColor: '#10B981',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 'sm',
    spacing: 'compact',
  },
};
