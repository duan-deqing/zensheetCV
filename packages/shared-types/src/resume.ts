export type FontSizeOption = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type SpacingOption = 'tight' | 'compact' | 'normal' | 'relaxed' | 'loose';
export type MarginOption = 'none' | 'narrow' | 'normal' | 'wide';

/** 简历照片：绝对定位在某页纸面上，坐标与宽度均为该页尺寸的百分比；
 *  高度不存储 —— 渲染时 width:x% + height:auto，天然保持原始宽高比 */
export interface ResumePhoto {
  id: string;
  /** 图片 data URL */
  src: string;
  /** 页码（从 1 开始） */
  page: number;
  /** 左上角 X（相对页宽百分比 0-100） */
  x: number;
  /** 左上角 Y（相对页高百分比 0-100） */
  y: number;
  /** 宽度（相对页宽百分比） */
  width: number;
}

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
  /** 照片：预览页面上自由拖放/缩放，随主题配置持久化并写入 PDF */
  photos?: ResumePhoto[];
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
