
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/api/client';

// 模拟一份 classic 模板简历（模拟用户进入编辑器时的初始状态）
vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn().mockImplementation((url) => {
      if (url === '/auth/me') return Promise.resolve({ data: { id: 'u1', name: '测试用户', email: 'test@test.com', created_at: '2026-08-01' } });
      if (url === '/resumes/r1') return Promise.resolve({
        data: {
          id: 'r1',
          title: '写入链路测试',
          markdown: '# 张三',
          template_id: 'classic',
          theme_config: {},
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

describe('editor persists template switch + theme change on manual save', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('access_token', 'test-token');
    window.location.hash = '';
    vi.mocked(apiClient.put).mockClear();
  });

  it('PUT payload carries template_id and theme_config after user edits', async () => {
    window.location.hash = '#/editor/r1';
    render(<App />);

    await screen.findByText('写入链路测试', {}, { timeout: 15000 });
    await waitFor(() => expect(screen.queryByText('// MARKDOWN')).not.toBeInTheDocument(), { timeout: 15000 });

    // 1. 打开模板库（TopBar「模板」按钮），添加「现代设计」(modern) 后关闭弹窗；
    //    主题面板下拉仅包含当前模板 + 已添加模板
    fireEvent.click(screen.getByRole('button', { name: '模板' }));
    fireEvent.click(await screen.findByRole('button', { name: '添加 现代设计' }));
    fireEvent.click(screen.getByRole('button', { name: '关闭模板库' }));

    // 2. 打开主题面板，切换模板为「现代设计」
    fireEvent.click(screen.getByRole('button', { name: '主题' }));
    fireEvent.click(screen.getByRole('button', { name: '选择模板' }));
    const option = await screen.findByRole('option', { name: /现代设计/ });
    fireEvent.click(option);

    // 3. 面板保持打开，选择翡翠绿色板
    const swatches = await waitFor(() => {
      const els = document.querySelectorAll('button[aria-label="翡翠绿"]');
      expect(els.length).toBeGreaterThan(0);
      return els;
    }, { timeout: 10000 });
    fireEvent.click(swatches[0]);
    fireEvent.click(screen.getByRole('button', { name: '✕' }));

    // 3. 点击保存
    const saveBtn = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveBtn);

    // 4. 断言 PUT 载荷包含 template_id 与 theme_config
    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalled();
      const calls = vi.mocked(apiClient.put).mock.calls.filter(([url]) => String(url).includes('/resumes/r1'));
      expect(calls.length).toBeGreaterThan(0);
      const payload = calls[calls.length - 1][1] as Record<string, unknown>;
      expect(payload.template_id).toBe('modern');
      expect(payload.theme_config).toMatchObject({ primaryColor: '#10B981' });
    }, { timeout: 10000 });
  }, 30000);
});
