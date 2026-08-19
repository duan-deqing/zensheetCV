export interface ThemeConfig {
  primaryColor: string;
  fontFamily: string;
  fontSize: 'sm' | 'base' | 'lg';
  spacing: 'compact' | 'normal' | 'relaxed';
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
