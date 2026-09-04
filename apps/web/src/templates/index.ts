import { classicTemplate } from './classic';
import { modernTemplate } from './modern';
import { elegantTemplate } from './elegant';
import { techTemplate } from './tech';
import { mujiTemplate } from './muji';
import { azureTemplate } from './azure';
import { sunriseTemplate } from './sunrise';
import { carbonTemplate } from './carbon';
import type { Template } from '@stylan/shared-types';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  blockMapping: Record<string, string>;
  css: string;
  /** 页面背景（全页出血，含页边距区域），导出 PDF 时应用到 body */
  pageBackground: string;
  defaultTheme: {
    primaryColor: string;
    fontFamily: string;
    /** 正文字号（px，10 ~ 30） */
    fontSize: number;
    /** 行距（倍数，1.2 ~ 2.5） */
    lineHeight: number;
  };
}

export const builtinTemplates: TemplateDefinition[] = [
  classicTemplate,
  carbonTemplate,
  modernTemplate,
  elegantTemplate,
  techTemplate,
  mujiTemplate,
  azureTemplate,
  sunriseTemplate,
];

export function getTemplateById(id: string): TemplateDefinition {
  return builtinTemplates.find((t) => t.id === id) || classicTemplate;
}

export function getTemplateCss(templateId: string): string {
  const template = getTemplateById(templateId);
  return template.css;
}

/** 将本地模板定义转换为与后端 API 一致的 Template 结构 */
export function toApiTemplate(template: TemplateDefinition): Template {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    thumbnail: template.thumbnail,
    css_styles: template.css,
    block_mapping: template.blockMapping,
    is_builtin: true,
    default_theme: template.defaultTheme,
  };
}
