
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { getResume, putResume } from '@/storage/resumeStore';
import type { Resume, ThemeConfig } from '@stylan/shared-types';

beforeEach(async () => {
  localStorage.clear();
  window.location.hash = '';
  const now = '2026-08-19T10:00:00.000Z';
  await putResume({
    id: 'r1',
    user_id: 'local',
    title: '写入链路测试',
    markdown: '# 张三',
    template_id: 'classic',
    theme_config: {} as ThemeConfig,
    created_at: now,
    updated_at: now,
  } satisfies Resume);
});

import App from '../src/App';

describe('editor persists template switch + theme change on manual save', () => {
  it('saved resume carries template_id and theme_config after user edits', async () => {
    window.location.hash = '#/editor/r1';
    render(<App />);

    await screen.findByText('写入链路测试', {}, { timeout: 15000 });
    await waitFor(() => expect(screen.queryByText('// MARKDOWN')).not.toBeInTheDocument(), { timeout: 15000 });

    // 1. 打开模板库（TopBar「模板」按钮），添加「现代设计」(modern) 后关闭弹窗；
    //    主题面板模板卡片仅包含当前模板 + 已添加模板
    fireEvent.click(screen.getByRole('button', { name: '模板' }));
    fireEvent.click(await screen.findByRole('button', { name: '添加 现代设计' }));
    fireEvent.click(screen.getByRole('button', { name: '关闭模板库' }));

    // 2. 打开主题面板，点击「现代设计」预览卡片切换模板
    fireEvent.click(screen.getByRole('button', { name: '主题' }));
    fireEvent.click(screen.getByRole('button', { name: '切换到模板 现代设计' }));

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

    // 4. 断言本地存储中的简历包含 template_id 与 theme_config
    await waitFor(async () => {
      const saved = await getResume('r1');
      expect(saved).toBeDefined();
      expect(saved!.template_id).toBe('modern');
      expect(saved!.theme_config).toMatchObject({ primaryColor: '#10B981' });
    }, { timeout: 10000 });
  }, 30000);
});
