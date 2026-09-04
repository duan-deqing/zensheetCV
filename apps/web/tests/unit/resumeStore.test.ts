import { describe, expect, it } from 'vitest';
import { defaultTheme, type Resume } from '@stylan/shared-types';
import {
  getResume,
  listResumes,
  newResumeId,
  putResume,
  removeResume,
  updateResumeRecord,
} from '@/storage/resumeStore';
import { getAiHistory, putAiHistory } from '@/storage/aiHistoryStore';

function makeResume(overrides: Partial<Resume> = {}): Resume {
  const now = new Date().toISOString();
  return {
    id: newResumeId(),
    user_id: 'local',
    title: '未命名简历',
    markdown: '# 简历\n',
    template_id: 'classic',
    theme_config: { ...defaultTheme },
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

describe('resumeStore (IndexedDB)', () => {
  it('put 后可 get 读回，字段完整', async () => {
    const resume = makeResume({ title: '测试简历' });
    await putResume(resume);
    const got = await getResume(resume.id);
    expect(got).toBeDefined();
    expect(got?.title).toBe('测试简历');
    expect(got?.theme_config).toEqual(resume.theme_config);
  });

  it('listResumes 按 updated_at 倒序返回', async () => {
    const early = makeResume({ title: '早', updated_at: '2026-01-01T00:00:00.000Z' });
    const late = makeResume({ title: '晚', updated_at: '2026-02-01T00:00:00.000Z' });
    await putResume(early);
    await putResume(late);
    const list = await listResumes();
    const titles = list.map((r) => r.title);
    expect(titles.indexOf('晚')).toBeLessThan(titles.indexOf('早'));
  });

  it('updateResumeRecord 合并字段并刷新 updated_at，不丢弃未涉及字段', async () => {
    const resume = makeResume({ markdown: '# 旧内容\n', template_id: 'muji' });
    await putResume(resume);
    const updated = await updateResumeRecord(resume.id, { markdown: '# 新内容\n' });
    expect(updated?.markdown).toBe('# 新内容\n');
    expect(updated?.template_id).toBe('muji');
    expect(updated?.updated_at >= resume.created_at).toBe(true);
  });

  it('updateResumeRecord 对不存在的 id 返回 undefined', async () => {
    const result = await updateResumeRecord('no-such-id', { title: 'x' });
    expect(result).toBeUndefined();
  });

  it('removeResume 删除后 get 返回 undefined', async () => {
    const resume = makeResume();
    await putResume(resume);
    await removeResume(resume.id);
    expect(await getResume(resume.id)).toBeUndefined();
  });
});

describe('aiHistoryStore (IndexedDB)', () => {
  it('put 后按 resume_id 读回', async () => {
    await putAiHistory({ resume_id: 'r1', messages: [{ role: 'user', content: 'hi' }], updated_at: '2026-01-01T00:00:00.000Z' });
    const got = await getAiHistory('r1');
    expect(got?.messages).toHaveLength(1);
  });

  it('重复 put 全量覆盖', async () => {
    await putAiHistory({ resume_id: 'r2', messages: [{ role: 'user', content: 'a' }], updated_at: '2026-01-01T00:00:00.000Z' });
    await putAiHistory({ resume_id: 'r2', messages: [], updated_at: '2026-01-02T00:00:00.000Z' });
    const got = await getAiHistory('r2');
    expect(got?.messages).toHaveLength(0);
  });
});
