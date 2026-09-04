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
  pageBackground: '#FFFFFF',
  css: `
    .resume-preview {
      font-family: 'Inter', 'Noto Sans SC', sans-serif;
      color: #1F2937;
      line-height: calc(1.6 * var(--resume-sp, 1));
      background: #FFFFFF;
      text-align: justify;
    }
    /* 姓名：大号加粗，黑色 */
    .resume-preview h1 {
      font-size: var(--resume-fs-h1, 30px);
      font-weight: 700;
      margin-bottom: calc(0.5rem * var(--resume-sp, 1));
      color: #111827;
      letter-spacing: -0.02em;
    }
    /* 章节标题：蓝色双斜线装饰 + 黑色标题 */
    .resume-preview h2 {
      position: relative;
      font-size: var(--resume-fs-h2, 20px);
      font-weight: 700;
      margin-top: calc(1.75rem * var(--resume-sp, 1));
      margin-bottom: calc(0.75rem * var(--resume-sp, 1));
      padding-left: 1.15em;
      color: #111827;
      letter-spacing: 0.01em;
    }
    .resume-preview h2::before,
    .resume-preview h2::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 0.24em;
      height: 1em;
      background: var(--resume-primary, #2563EB);
      /* 以左下角为斜切原点：底边固定、上端右倾，
         避免斜线下半段越过内容区左边界被分页容器的 overflow: hidden 裁切 */
      transform: translateY(-50%) skewX(-20deg);
      transform-origin: bottom left;
      border-radius: 0.05em;
    }
    .resume-preview h2::before { left: 0; }
    .resume-preview h2::after { left: 0.36em; }
    /* 条目标题：黑色加粗 */
    .resume-preview h3 {
      font-size: var(--resume-fs-h3, 14px);
      font-weight: 700;
      margin-top: calc(1rem * var(--resume-sp, 1));
      margin-bottom: calc(0.25rem * var(--resume-sp, 1));
      color: #111827;
    }
    /* 列表：深灰小方块符号；ul 不再整体缩进，使方块与 h3 标题左对齐 */
    .resume-preview ul { padding-left: 0; list-style: none; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ol { padding-left: 1.5rem; list-style: decimal; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ol li { margin-bottom: calc(0.375rem * var(--resume-sp, 1)); }
    .resume-preview ul li { position: relative; padding-left: 1rem; margin-bottom: calc(0.375rem * var(--resume-sp, 1)); }
    .resume-preview ul li::before {
      content: ''; position: absolute; left: 0;
      /* 方块中心对齐首行文字中心：行高 1.6，首行中心位于 0.8em */
      top: 0.8em; transform: translateY(-50%);
      width: 5px; height: 5px;
      background: #374151;
    }
    /* 加粗词条：近黑强调 */
    .resume-preview strong { color: #111827; font-weight: 700; }
    .resume-preview p { margin-bottom: calc(0.5rem * var(--resume-sp, 1)); color: #4B5563; }
    /* 行内代码：技术栈标签，灰边胶囊 */
    .resume-preview code {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 0.8125em;
      padding: 0.2em 0.6em;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 999px;
      color: #374151;
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
    fontSize: 14,
    lineHeight: 1.4,
  },
};
