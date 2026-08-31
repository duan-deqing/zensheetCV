export type FontSizeOption = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type SpacingOption = 'tight' | 'compact' | 'normal' | 'relaxed' | 'loose';
export type MarginOption = 'none' | 'narrow' | 'normal' | 'wide';

export interface ThemeConfig {
  primaryColor: string;
  fontFamily: string;
  fontSize: FontSizeOption;
  spacing: SpacingOption;
  /** 左右页边距（PDF 导出与预览共用） */
  marginX: MarginOption;
  /** 上下页边距（PDF 导出与预览共用） */
  marginY: MarginOption;
  /** 内容边距：内容到页面边界的距离（四边，叠加在页边距上，每页生效） */
  contentPadding: MarginOption;
  /** 自定义图标：名称 → SVG 字符串，Markdown 中以 `icon:名称` 引用 */
  customIcons?: Record<string, string>;
}

export const defaultTheme: ThemeConfig = {
  primaryColor: '#2563EB',
  fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
  fontSize: 'base',
  spacing: 'normal',
  marginX: 'none',
  marginY: 'none',
  contentPadding: 'normal',
};

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  markdown: string;
  template_id: string;
  theme_config: ThemeConfig;
  created_at: string;
  updated_at: string;
}

export interface ResumeCreate {
  title: string;
  markdown: string;
  template_id?: string;
  theme_config?: ThemeConfig;
}

export interface ResumeUpdate {
  title?: string;
  markdown?: string;
  template_id?: string;
  theme_config?: ThemeConfig;
}
