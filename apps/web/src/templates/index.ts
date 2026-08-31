import { classicTemplate } from './classic';
import { modernTemplate } from './modern';
import { elegantTemplate } from './elegant';
import { techTemplate } from './tech';
import type { FontSizeOption, SpacingOption, Template } from '@stylan/shared-types';

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
    fontSize: FontSizeOption;
    spacing: SpacingOption;
  };
}

export const builtinTemplates: TemplateDefinition[] = [
  classicTemplate,
  modernTemplate,
  elegantTemplate,
  techTemplate,
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
