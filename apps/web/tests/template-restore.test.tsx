
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

  it('template cards show saved template as current and preview uses saved primary color', async () => {
    window.location.hash = '#/editor/r1';
    render(<App />);

    // 等待数据加载完成（编辑器出现内容，骨架屏消失）
    await screen.findByText('模板恢复测试', {}, { timeout: 15000 });
    await waitFor(() => expect(screen.queryByText('// MARKDOWN')).not.toBeInTheDocument(), { timeout: 15000 });

    // 主题侧边栏中的模板卡片应以「选中」状态标记已保存的模板，而不是回退到第一个「经典简洁」；
    // 卡片在主题面板内，需先点击顶栏「主题」按钮展开面板
    fireEvent.click(screen.getByRole('button', { name: '主题' }));
    await waitFor(() => {
      const card = screen.getByRole('button', { name: '切换到模板 现代设计' });
      expect(card.getAttribute('aria-pressed')).toBe('true');
    }, { timeout: 15000 });

    // 预览排版源（含模板/主题 <style>）应注入已保存的主色调与字号/间距变量
    await waitFor(() => {
      const preview = document.querySelector('.resume-export-root');
      expect(preview).not.toBeNull();
      const styles = preview!.querySelectorAll('style');
      const all = Array.from(styles).map((s) => s.textContent || '').join('\n');
      expect(all).toContain('--resume-primary: #10B981');
      expect(all).toContain('--resume-fs: 1.07'); // fontSize lg（15 / 14 ≈ 1.0714）
      expect(all).toContain('--resume-sp: 1.3'); // spacing loose
      // 分类字号（H1~H5 / 段落 / 列表）：未设置时注入默认值
      expect(all).toContain('--resume-fs-h1:30px');
      expect(all).toContain('--resume-fs-p:14px');
    }, { timeout: 15000 });
  }, 30000);
});
