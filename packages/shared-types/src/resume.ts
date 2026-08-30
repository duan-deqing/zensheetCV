export type FontSizeOption = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type SpacingOption = 'tight' | 'compact' | 'normal' | 'relaxed' | 'loose';

export interface ThemeConfig {
  primaryColor: string;
  fontFamily: string;
  fontSize: FontSizeOption;
  spacing: SpacingOption;
}

export const defaultTheme: ThemeConfig = {
  primaryColor: '#2563EB',
  fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
  fontSize: 'base',
  spacing: 'normal',
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
