import { classicTemplate } from './classic';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  blockMapping: Record<string, string>;
  css: string;
  defaultTheme: {
    primaryColor: string;
    fontFamily: string;
    fontSize: string;
    spacing: string;
  };
}

export const builtinTemplates: TemplateDefinition[] = [classicTemplate];

export function getTemplateById(id: string): TemplateDefinition {
  return builtinTemplates.find((t) => t.id === id) || classicTemplate;
}

export function getTemplateCss(templateId: string): string {
  const template = getTemplateById(templateId);
  return template.css;
}
