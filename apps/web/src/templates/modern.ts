export const modernTemplate = {
  id: 'modern',
  name: '现代设计',
  description: '蓝色主调，现代感十足，适合互联网/科技公司',
  thumbnail: '/templates/modern-thumb.svg',
  blockMapping: { h1: 'name', h2: 'section-title', h3: 'item-title', ul: 'list', p: 'description', hr: 'divider' },
  css: `
    .resume-preview {
      font-family: 'Inter', 'Noto Sans SC', sans-serif;
      color: #1F2937;
      line-height: 1.6;
      padding: 2.5rem;
      background: linear-gradient(135deg, #FFFFFF 0%, #F0F7FF 100%);
    }
    .resume-preview h1 {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--resume-primary, #2563EB);
      letter-spacing: -0.02em;
    }
    .resume-preview h2 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-top: 1.75rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--resume-primary, #2563EB);
      color: var(--resume-primary, #2563EB);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .resume-preview h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-top: 1rem;
      margin-bottom: 0.25rem;
      color: #374151;
    }
    .resume-preview ul { padding-left: 1.25rem; list-style: none; margin-bottom: 0.5rem; }
    .resume-preview ul li { position: relative; padding-left: 1rem; margin-bottom: 0.375rem; }
    .resume-preview ul li::before {
      content: ''; position: absolute; left: 0; top: 0.6em;
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--resume-primary, #2563EB);
    }
    .resume-preview p { margin-bottom: 0.5rem; color: #4B5563; }
  `,
  defaultTheme: { primaryColor: '#2563EB', fontFamily: "'Inter', 'Noto Sans SC', sans-serif", fontSize: 'base', spacing: 'normal' },
};
