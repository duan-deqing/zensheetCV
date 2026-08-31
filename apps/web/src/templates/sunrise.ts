import type { TemplateDefinition } from './index';

/**
 * 「朝阳」——移植自 MujiCV orange 主题（朝阳黄）：
 * 橙→黄→白渐变题头、主题色居中标题（两侧延伸色线）、暖色系技能标签。
 */
export const sunriseTemplate: TemplateDefinition = {
  id: 'sunrise',
  name: '朝阳暖橙',
  description: '暖橙渐变题头 + 主题色标题线，明快有活力',
  thumbnail: '/templates/sunrise-thumb.svg',
  blockMapping: {
    h1: 'name',
    h2: 'section-title',
    h3: 'item-title',
    ul: 'list',
    p: 'description',
    hr: 'divider',
  },
  pageBackground: 'linear-gradient(180deg, #FFF6EE 0%, #FFFFFF 18%)',
  css: `
    .resume-preview {
      font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
      color: #3D3229;
      line-height: calc(1.7 * var(--resume-sp, 1));
      background: #FFFFFF;
    }
    .resume-preview h1 {
      font-size: calc(1.75rem * var(--resume-fs, 1));
      font-weight: 800;
      color: #FFFFFF;
      text-shadow: 0 1px 2px rgba(180, 90, 20, 0.35);
      background: linear-gradient(180deg, #F9855D 0%, #FDD288 78%, #FFFFFF 100%);
      padding: 1.25rem 1.25rem 1.5rem;
      margin-bottom: calc(0.5rem * var(--resume-sp, 1));
    }
    .resume-preview h1 + p { color: #8A6A4F; }
    .resume-preview h2 {
      /* 居中主题色标题，两侧延伸暖橙细线（flex 匿名文本项 + 弹性伪元素线） */
      display: flex;
      align-items: center;
      gap: 0.875rem;
      font-size: calc(1.05rem * var(--resume-fs, 1));
      font-weight: 700;
      color: var(--resume-primary, #F9855D);
      margin-top: calc(1.75rem * var(--resume-sp, 1));
      margin-bottom: calc(0.75rem * var(--resume-sp, 1));
    }
    .resume-preview h2::before,
    .resume-preview h2::after {
      content: '';
      flex: 1 1 0;
      height: 2px;
      background: #FDD288;
    }
    .resume-preview h3 {
      font-size: calc(0.95rem * var(--resume-fs, 1));
      font-weight: 600;
      margin-top: calc(1rem * var(--resume-sp, 1));
      margin-bottom: calc(0.25rem * var(--resume-sp, 1));
      color: #4A3B2E;
    }
    .resume-preview ul { padding-left: 1.1rem; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ol { padding-left: 1.4rem; list-style: decimal; margin-bottom: calc(0.5rem * var(--resume-sp, 1)); }
    .resume-preview ol li {
      font-size: 0.9em;
      margin-bottom: calc(0.375rem * var(--resume-sp, 1));
      color: #5C4F42;
    }
    .resume-preview ol li::marker { color: #F9855D; }
    .resume-preview ul li {
      font-size: 0.9em;
      margin-bottom: calc(0.375rem * var(--resume-sp, 1));
      color: #5C4F42;
    }
    .resume-preview ul li::marker { color: #F9855D; }
    .resume-preview p { margin-bottom: calc(0.5rem * var(--resume-sp, 1)); color: #5C4F42; font-size: 0.95em; }
    .resume-preview code {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 0.8125em;
      padding: 0.15em 0.4em;
      display: inline-block;
      color: #A3541B;
      background-color: #FDF0E4;
      border: 1px solid #FAD9BD;
      border-radius: 4px;
      white-space: nowrap;
    }
    .resume-preview pre code {
      padding: 0;
      display: inline;
      background: transparent;
      border: none;
      border-radius: 0;
      color: inherit;
      white-space: pre-wrap;
    }
  `,
  defaultTheme: {
    primaryColor: '#F9855D',
    fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
    fontSize: 'base',
    spacing: 'normal',
  },
};
