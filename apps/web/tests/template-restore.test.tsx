
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 模拟一份已保存为 modern 模板 + 自定义主色调（翡翠绿）的简历
vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn().mockImplementation((url) => {
      if (url === '/auth/me') return Promise.resolve({ data: { id: 'u1', name: '测试用户', email: 'test@test.com', created_at: '2026-08-01' } });
      if (url === '/resumes/r1') return Promise.resolve({
        data: {
          id: 'r1',
          title: '模板恢复测试',
          markdown: '# 张三',
          template_id: 'modern',
          theme_config: {
            primaryColor: '#10B981',
            fontFamily: "'Georgia', 'Noto Serif SC', serif",
            fontSize: 'lg',
            spacing: 'loose',
          },
          updated_at: '2026-08-19T10:00:00',
        },
      });
      return Promise.reject(new Error('not found'));
    }),
    post: vi.fn(),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import App from '../src/App';

describe('editor restores saved template & theme on re-enter', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('access_token', 'test-token');
    window.location.hash = '';
  });

  it('dropdown shows saved template and preview uses saved primary color', async () => {
    window.location.hash = '#/editor/r1';
    render(<App />);

    // 等待数据加载完成（编辑器出现内容，骨架屏消失）
    await screen.findByText('模板恢复测试', {}, { timeout: 15000 });
    await waitFor(() => expect(screen.queryByText('// MARKDOWN')).not.toBeInTheDocument(), { timeout: 15000 });

    // 预览工具栏的模板下拉应显示已保存的模板，而不是回退到第一个「经典简洁」
    await waitFor(() => {
      const dropdown = screen.getByRole('button', { name: '选择模板' });
      expect(dropdown.textContent).toContain('现代设计');
    }, { timeout: 15000 });

    // 预览排版源（含模板/主题 <style>）应注入已保存的主色调与字号/间距变量
    await waitFor(() => {
      const preview = document.querySelector('.resume-export-root');
      expect(preview).not.toBeNull();
      const styles = preview!.querySelectorAll('style');
      const all = Array.from(styles).map((s) => s.textContent || '').join('\n');
      expect(all).toContain('--resume-primary: #10B981');
      expect(all).toContain('--resume-fs: 1.1'); // fontSize lg
      expect(all).toContain('--resume-sp: 1.3'); // spacing loose
    }, { timeout: 15000 });
  }, 30000);
});
