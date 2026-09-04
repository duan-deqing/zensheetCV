
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

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

  it('navbar always shows resumes link and no auth links', async () => {
    render(<App />);
    await screen.findAllByText(/ZENSHEET/i);
    const nav = document.querySelector('nav');
    const resumesLink = Array.from(nav.querySelectorAll('a')).find(
      (a) => a.textContent.trim() === '我的简历',
    );
    expect(resumesLink).toBeDefined();
    const texts = Array.from(nav.querySelectorAll('a')).map((a) => a.textContent.trim());
    expect(texts).not.toContain('登录');
    expect(texts).not.toContain('注册');
  });
});
