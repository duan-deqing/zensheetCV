import type { ThemeConfig } from './resume';

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  css_styles: string;
  block_mapping: Record<string, string>;
  is_builtin: boolean;
  default_theme: Partial<ThemeConfig>;
}

export interface PDFGenerateRequest {
  resume_id: string;
  html: string;
  css: string;
}

export interface PDFGenerateResponse {
  download_url: string;
  expires_at: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
