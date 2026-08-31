
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn().mockRejectedValue(new Error('network disabled in test')),
    post: vi.fn().mockRejectedValue(new Error('network disabled in test')),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import App from '../src/App';

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('renders home page', async () => {
    render(<App />);
    expect(await screen.findAllByText(/ZENSHEET/i)).not.toHaveLength(0);
    expect(screen.getByText('免费注册')).toBeInTheDocument();
    expect(screen.getAllByText('登录').length).toBeGreaterThan(0);
  });

  it('renders register page without error', async () => {
    render(<App />);
    window.location.hash = '#/register';
    const heading = await screen.findByText('创建账户');
    expect(heading).toBeInTheDocument();
    expect(screen.queryByText('出错了')).not.toBeInTheDocument();
  });

  it('renders login page without error', async () => {
    render(<App />);
    window.location.hash = '#/login';
    const heading = await screen.findByText('欢迎回来');
    expect(heading).toBeInTheDocument();
    expect(screen.queryByText('出错了')).not.toBeInTheDocument();
  });
});
