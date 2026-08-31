import type { TemplateDefinition } from './index';

export const modernTemplate: TemplateDefinition = {
  id: 'modern',
  name: '现代设计',
  description: '蓝色主调，现代感十足，适合互联网/科技公司',
  thumbnail: '/templates/modern-thumb.svg',
  blockMapping: {
    h1: 'name',
    h2: 'section-title',
    h3: 'item-title',
    ul: 'list',
    p: 'description',
    hr: 'divider',
  },
  pageBackground: 'linear-gradient(135deg, #FFFFFF 0%, #F0F7FF 100%)',
  css: `
    .resume-preview {
      font-family: 'Inter', 'Noto Sans SC', sans-serif;
      color: #1F2937;
      line-height: calc(1.6 * var(--resume-sp, 1));
      background: linear-gradient(135deg, #FFFFFF 0%, #F0F7FF 100%);
    }
    .resume-preview h1 {
      font-size: calc(2.25rem * var(--resume-fs, 1));
      font-weight: 700;
      margin-bottom: calc(0.5rem * var(--resume-sp, 1));
      color: var(--resume-primary, #2563EB);
      letter-spacing: -0.02em;
    }
    .resume-preview h2 {
      font-size: calc(1.125rem * var(--resume-fs, 1));
      font-weight: 600;
      margin-top: calc(1.75rem * var(--resume-sp, 1));
      margin-bottom: calc(0.75rem * var(--resume-sp, 1));
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--resume-primary, #2563EB);
      color: var(--resume-primary, #2563EB);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .resume-preview h3 {
      font-size: calc(1rem * var(--resume-fs, 1));
      font-weight: 600;
      margin-top: calc(1rem * var(--resume-sp, 1));
      margin-bottom: calc(0.25rem * var(--resume-sp, 1));
      color: #374151;
    }
    .resume-preview ul { padding-left: 1.25rem; list-style: none; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ul li { position: relative; padding-left: 1rem; margin-bottom: calc(0.375rem * var(--resume-sp, 1)); }
    .resume-preview ul li::before {
      content: ''; position: absolute; left: 0; top: 0.6em;
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--resume-primary, #2563EB);
    }
    .resume-preview p { margin-bottom: calc(0.5rem * var(--resume-sp, 1)); color: #4B5563; }
    .resume-preview code {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 0.8125em;
      padding: 0.125em 0.45em;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 4px;
      color: var(--resume-primary, #2563EB);
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
    primaryColor: '#2563EB',
    fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
    fontSize: 'base',
    spacing: 'normal',
  },
};
