export const elegantTemplate = {
  id: 'elegant',
  name: '优雅复古',
  description: '优雅复古设计，适合设计/创意/教育行业',
  thumbnail: '/templates/elegant-thumb.svg',
  blockMapping: { h1: 'name', h2: 'section-title', h3: 'item-title', ul: 'list', p: 'description', hr: 'divider' },
  css: `
    .resume-preview {
      font-family: 'Georgia', 'Noto Serif SC', serif;
      color: #2C2C2C;
      line-height: 1.7;
      padding: 3rem;
      background: #FDFBF7;
    }
    .resume-preview h1 {
      font-size: 2.5rem;
      font-weight: 400;
      margin-bottom: 0.25rem;
      color: var(--resume-primary, #78350F);
      font-style: italic;
      letter-spacing: 0.02em;
    }
    .resume-preview h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
      color: var(--resume-primary, #78350F);
      border-bottom: 1px solid #D4A574;
      padding-bottom: 0.375rem;
    }
    .resume-preview h3 {
      font-size: 1.0625rem;
      font-weight: 600;
      margin-top: 1rem;
      margin-bottom: 0.25rem;
      color: #44403C;
    }
    .resume-preview ul { padding-left: 1.5rem; list-style: square; margin-bottom: 0.5rem; }
    .resume-preview li { margin-bottom: 0.375rem; }
    .resume-preview p { margin-bottom: 0.625rem; }
  `,
  defaultTheme: { primaryColor: '#78350F', fontFamily: "'Georgia', 'Noto Serif SC', serif", fontSize: 'base', spacing: 'relaxed' },
};
