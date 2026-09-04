
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { putResume } from '@/storage/resumeStore';
import type { Resume, ThemeConfig } from '@stylan/shared-types';

function seedResume(overrides: Partial<Resume> = {}): Promise<void> {
  const now = new Date().toISOString();
  return putResume({
    id: 'r1',
    user_id: 'local',
    title: '我的第一份简历',
    markdown: '# 张三',
    template_id: 'classic',
    theme_config: {} as ThemeConfig,
    created_at: now,
    updated_at: now,
    ...overrides,
  });
}

import App from '../src/App';

describe('editor and resumes layout', () => {
  beforeEach(async () => {
    localStorage.clear();
    window.location.hash = '';
    await seedResume();
    await seedResume({ id: 'r2', title: '求职简历', template_id: 'modern', updated_at: '2026-08-18T10:00:00.000Z' });
  });

  it('editor page has only ONE header (TopBar), no global Navbar', async () => {
    window.location.hash = '#/editor/r1';
    render(<App />);
    await screen.findByText('我的第一份简历', {}, { timeout: 5000 });
    const headers = document.querySelectorAll('header');
    const navs = document.querySelectorAll('nav');
    expect(headers.length).toBe(1);
    expect(navs.length).toBe(0);
    expect(screen.getByText(/AI 助手/)).toBeInTheDocument();
    expect(screen.getByText(/我的简历/)).toBeInTheDocument();
    expect(screen.getByText(/编辑简历|我的第一份简历/)).toBeInTheDocument();
  });

  it('resumes page shows resume cards', async () => {
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
    window.location.hash = '#/editor/r1';
    render(<App />);
    await screen.findByText('我的第一份简历', {}, { timeout: 5000 });
    const splitter = document.querySelector('[aria-label="拖拽调整编辑器宽度"]');
    expect(splitter).not.toBeNull();
    expect(splitter!.className).toContain('col-resize');
  });
});
