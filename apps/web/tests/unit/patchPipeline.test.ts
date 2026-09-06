import { describe, expect, it } from 'vitest';
import { parseResumeEdits, stripEditBlocks } from '@/ai/patchParser';
import { applyPatch, applyPatches } from '@/ai/patchApply';
import type { ResumePatch } from '@/ai/types';

const RESUME = [
  '# 张三',
  '',
  '## 工作经历',
  '',
  '- 从 0 搭建物联网数据接入平台',
  '- 负责后端开发',
  '',
  '## 教育背景',
  '',
  '- 本科 · 某大学',
].join('\n');

function block(items: unknown): string {
  return `\`\`\`resume-edits\n${JSON.stringify(items, null, 2)}\n\`\`\``;
}

describe('parseResumeEdits', () => {
  it('无块返回空数组', () => {
    expect(parseResumeEdits('普通回答，没有建议。')).toEqual([]);
    expect(parseResumeEdits('')).toEqual([]);
  });

  it('解析单个块并携带状态', () => {
    const content = `建议如下：\n${block([{ search: '负责后端开发', replace: '负责后端开发，QPS 1 万', note: '量化' }])}`;
    const patches = parseResumeEdits(content);
    expect(patches).toHaveLength(1);
    expect(patches[0]).toMatchObject({
      search: '负责后端开发',
      replace: '负责后端开发，QPS 1 万',
      note: '量化',
      status: 'pending',
    });
  });

  it('解析多个块与多条建议', () => {
    const content = [
      block([{ search: 'a', replace: 'b' }]),
      '中间解释文字',
      block([{ search: 'c', replace: 'd' }, { search: 'e', replace: 'f' }]),
    ].join('\n');
    expect(parseResumeEdits(content)).toHaveLength(3);
  });

  it('非法 JSON 产出 invalid_json 占位', () => {
    const content = '```resume-edits\n[{search: 未加引号}]\n```';
    const patches = parseResumeEdits(content);
    expect(patches).toHaveLength(1);
    expect(patches[0].status).toBe('failed');
    expect(patches[0].failReason).toBe('invalid_json');
  });

  it('字段类型非法（search 为空 / replace 缺失）产出 invalid_json 占位', () => {
    const patches = parseResumeEdits(
      block([{ search: '', replace: 'x' }, { search: 'y' }, 'not-an-object']),
    );
    expect(patches).toHaveLength(3);
    expect(patches.every((p) => p.failReason === 'invalid_json')).toBe(true);
  });

  it('id 唯一', () => {
    const patches = parseResumeEdits(block([{ search: 'a', replace: 'b' }, { search: 'c', replace: 'd' }]));
    expect(new Set(patches.map((p) => p.id)).size).toBe(2);
  });
});

describe('stripEditBlocks', () => {
  it('剔除完整块并收敛空行', () => {
    const content = `第一段。\n\n${block([{ search: 'a', replace: 'b' }])}\n\n第二段。`;
    expect(stripEditBlocks(content)).toBe('第一段。\n\n第二段。');
  });

  it('streaming 模式剔除末尾未闭合块', () => {
    const content = '说明文字\n```resume-edits\n[{"search": "a"';
    expect(stripEditBlocks(content, true)).toBe('说明文字');
    // 非 streaming 时保留未闭合块（不完整正则不匹配完整块语法）
    expect(stripEditBlocks(content)).toContain('resume-edits');
  });
});

describe('applyPatch', () => {
  it('唯一命中替换成功', () => {
    const r = applyPatch(RESUME, { search: '负责后端开发', replace: '负责后端开发，QPS 1 万' });
    expect(r.ok).toBe(true);
    expect(r.newMarkdown).toContain('QPS 1 万');
  });

  it('未命中返回 not_found', () => {
    const r = applyPatch(RESUME, { search: '不存在的片段', replace: 'x' });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('not_found');
  });

  it('多处命中返回 ambiguous', () => {
    const md = '# A\n\n- 重复行\n- 重复行\n';
    const r = applyPatch(md, { search: '重复行', replace: 'x' });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('ambiguous');
  });

  it('空 replace 视为删除', () => {
    const r = applyPatch(RESUME, { search: '- 负责后端开发\n', replace: '' });
    expect(r.ok).toBe(true);
    expect(r.newMarkdown).not.toContain('负责后端开发');
  });
});

describe('applyPatches', () => {
  const patches: ResumePatch[] = [
    { search: '从 0 搭建物联网数据接入平台', replace: '从 0 搭建物联网数据接入平台，日均 2 亿条' },
    { search: '负责后端开发', replace: '负责后端开发（QPS 1 万）' },
    { search: '不存在的片段', replace: 'x' },
  ];

  it('顺序应用，失败条目不影响其他条目', () => {
    const { results, markdown, okCount } = applyPatches(RESUME, patches);
    expect(okCount).toBe(2);
    expect(results[0].ok).toBe(true);
    expect(results[2]).toMatchObject({ ok: false, reason: 'not_found' });
    expect(markdown).toContain('日均 2 亿条');
    expect(markdown).toContain('QPS 1 万');
  });

  it('前一条应用后，后一条基于新文本匹配', () => {
    const chained: ResumePatch[] = [
      { search: '## 工作经历', replace: '## 工作经历（更新）' },
      { search: '（更新）', replace: '（已修订）' },
    ];
    const { markdown, okCount } = applyPatches(RESUME, chained);
    expect(okCount).toBe(2);
    expect(markdown).toContain('## 工作经历（已修订）');
  });

  it('空列表原样返回', () => {
    const { markdown, okCount } = applyPatches(RESUME, []);
    expect(okCount).toBe(0);
    expect(markdown).toBe(RESUME);
  });
});
