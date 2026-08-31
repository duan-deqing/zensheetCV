
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn().mockImplementation((url) => {
      if (url === '/auth/me') return Promise.resolve({ data: { id: 'u1', name: '测试用户', email: 'test@test.com', created_at: '2026-08-01' } });
      if (url === '/resumes') return Promise.resolve({ data: { items: [
        { id: 'r1', title: '我的第一份简历', markdown: '# 张三', template_id: 'classic', updated_at: '2026-08-19T10:00:00' },
        { id: 'r2', title: '求职简历', markdown: '# 李四', template_id: 'modern', updated_at: '2026-08-18T10:00:00' },
      ] } });
      if (url === '/resumes/r1') return Promise.resolve({ data: { id: 'r1', title: '我的第一份简历', markdown: '# 张三', template_id: 'classic', updated_at: '2026-08-19T10:00:00' } });
      return Promise.reject(new Error('not found'));
    }),
    post: vi.fn().mockResolvedValue({ data: { id: 'r3', title: '未命名简历', markdown: '# 姓名', updated_at: '2026-08-19' } }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import App from '../src/App';

const setToken = () => localStorage.setItem('access_token', 'test-token');

describe('editor and resumes layout', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('editor page has only ONE header (TopBar), no global Navbar', async () => {
    setToken();
    window.location.hash = '#/editor/r1';
    render(<App />);
    await screen.findByText('我的第一份简历', {}, { timeout: 5000 });
    await waitFor(() => expect(screen.queryByText('创建账户')).not.toBeInTheDocument());
    const headers = document.querySelectorAll('header');
    const navs = document.querySelectorAll('nav');
    expect(headers.length).toBe(1);
    expect(navs.length).toBe(0);
    expect(screen.getByText(/AI 助手/)).toBeInTheDocument();
    expect(screen.getByText(/我的简历/)).toBeInTheDocument();
    expect(screen.getByText(/编辑简历|我的第一份简历/)).toBeInTheDocument();
  });

  it('resumes page shows resume cards', async () => {
    setToken();
    window.location.hash = '#/resumes';
    render(<App />);
    await screen.findByText('我的第一份简历', {}, { timeout: 5000 });
    expect(screen.getByText('求职简历')).toBeInTheDocument();
    // create entry is an in-grid card button with a plus icon and label
    const createBtn = screen.getByRole('button', { name: /新建简历/ });
    expect(createBtn.querySelector('span[aria-hidden="true"]')?.textContent).toBe('+');
    const navs = document.querySelectorAll('nav');
    expect(navs.length).toBe(1);
  });

  it('editor page has resizable splitter handle', async () => {
    setToken();
    window.location.hash = '#/editor/r1';
    render(<App />);
    await screen.findByText('我的第一份简历', {}, { timeout: 5000 });
    const splitter = document.querySelector('[aria-label="拖拽调整编辑器宽度"]');
    expect(splitter).not.toBeNull();
    expect(splitter.className).toContain('col-resize');
  });
});
