
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn().mockRejectedValue(new Error('network disabled')),
    post: vi.fn().mockRejectedValue(new Error('network disabled')),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import App from '../src/App';

describe('navbar layout', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('home page has exactly 1 navbar', async () => {
    render(<App />);
    await screen.findAllByText(/ZENSHEET/i);
    const navs = document.querySelectorAll('nav');
    expect(navs.length).toBe(1);
  });

  it('login page has exactly 1 navbar', async () => {
    render(<App />);
    window.location.hash = '#/login';
    await screen.findByText('欢迎回来');
    const navs = document.querySelectorAll('nav');
    expect(navs.length).toBe(1);
    // Active state: the login link inside nav uses the primary active style on the light pill
    const nav = document.querySelector('nav');
    const loginLink = Array.from(nav.querySelectorAll('a')).find(a => a.textContent.trim() === '登录');
    expect(loginLink.className).toContain('text-primary-600');
  });

  it('register page has exactly 1 navbar', async () => {
    render(<App />);
    window.location.hash = '#/register';
    await screen.findByText('创建账户');
    const navs = document.querySelectorAll('nav');
    expect(navs.length).toBe(1);
    // Active state: on the register page the ghost CTA is filled solid
    const nav = document.querySelector('nav');
    const regLink = Array.from(nav.querySelectorAll('a')).find(a => a.textContent.trim() === '注册');
    expect(regLink.className).toContain('bg-primary-600');
  });
});
