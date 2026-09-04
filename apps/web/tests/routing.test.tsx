
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import App from '../src/App';

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('renders home page with editor CTA', async () => {
    render(<App />);
    expect(await screen.findAllByText(/ZENSHEET/i)).not.toHaveLength(0);
    expect(screen.getByText('进入编辑器')).toBeInTheDocument();
    expect(screen.queryByText('免费注册')).not.toBeInTheDocument();
    expect(screen.queryByText('登录')).not.toBeInTheDocument();
  });

  it('renders docs page without error', async () => {
    render(<App />);
    window.location.hash = '#/docs';
    await screen.findAllByText(/ZENSHEET/i);
    expect(screen.queryByText('出错了')).not.toBeInTheDocument();
  });

  it('renders resumes page without error', async () => {
    render(<App />);
    window.location.hash = '#/resumes';
    await screen.findAllByText(/ZENSHEET/i);
    expect(screen.queryByText('出错了')).not.toBeInTheDocument();
  });
});
