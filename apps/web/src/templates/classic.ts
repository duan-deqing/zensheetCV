export const classicTemplate = {
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
  css: `
    .resume-preview {
      font-family: 'Inter', 'Noto Sans SC', sans-serif;
      color: #111827;
      line-height: 1.6;
      padding: 2rem;
    }
    .resume-preview h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--resume-primary, #111827);
    }
    .resume-preview h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.25rem;
      border-bottom: 2px solid var(--resume-primary, #111827);
      color: var(--resume-primary, #111827);
    }
    .resume-preview h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-top: 1rem;
      margin-bottom: 0.25rem;
    }
    .resume-preview ul {
      padding-left: 1.25rem;
      list-style: disc;
      margin-bottom: 0.5rem;
    }
    .resume-preview li {
      margin-bottom: 0.25rem;
    }
    .resume-preview p {
      margin-bottom: 0.5rem;
    }
  `,
  defaultTheme: {
    primaryColor: '#111827',
    fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
    fontSize: 'base',
    spacing: 'normal',
  },
};
