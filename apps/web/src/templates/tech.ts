export const techTemplate = {
  id: 'tech',
  name: '技术极简',
  description: '极简技术风格，适合技术/开源/开发者',
  thumbnail: '/templates/tech-thumb.svg',
  blockMapping: { h1: 'name', h2: 'section-title', h3: 'item-title', ul: 'list', p: 'description', hr: 'divider' },
  css: `
    .resume-preview {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      color: #E5E7EB;
      line-height: 1.6;
      padding: 2rem;
      background: #111827;
    }
    .resume-preview h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--resume-primary, #10B981);
    }
    .resume-preview h2 {
      font-size: 0.875rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      color: var(--resume-primary, #10B981);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid #374151;
      padding-bottom: 0.375rem;
    }
    .resume-preview h3 {
      font-size: 0.9375rem;
      font-weight: 600;
      margin-top: 0.75rem;
      margin-bottom: 0.25rem;
      color: #D1D5DB;
    }
    .resume-preview ul { padding-left: 1rem; list-style: none; margin-bottom: 0.5rem; }
    .resume-preview ul li { position: relative; padding-left: 1rem; margin-bottom: 0.25rem; color: #9CA3AF; }
    .resume-preview ul li::before {
      content: '>'; position: absolute; left: 0;
      color: var(--resume-primary, #10B981);
    }
    .resume-preview p { margin-bottom: 0.5rem; color: #9CA3AF; }
  `,
  defaultTheme: { primaryColor: '#10B981', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 'sm', spacing: 'compact' },
};
