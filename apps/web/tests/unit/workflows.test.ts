import { describe, expect, it } from 'vitest';
import {
  buildJdWorkflow,
  buildPolishWorkflow,
  keywordCoverage,
  parseKeywordList,
  runWorkflow,
  type WorkflowIO,
  type WorkflowRequest,
  type WorkflowStepDef,
} from '@/ai/workflows';

/** 假请求生成器：按预设回复依次产出 */
function fakeRequest(replies: string[], calls: WorkflowRequest[] = []) {
  let i = 0;
  return async function* (req: WorkflowRequest): AsyncGenerator<string> {
    calls.push(req);
    const reply = replies[Math.min(i, replies.length - 1)];
    i += 1;
    yield reply.slice(0, 3);
    yield reply.slice(3);
  };
}

function makeIO(replies: string[], calls: WorkflowRequest[] = []): WorkflowIO & { steps: unknown[] } {
  const stepLog: Array<{ index: number; patch: unknown }> = [];
  return {
    request: fakeRequest(replies, calls),
    onStep: (index, patch) => stepLog.push({ index, patch }),
    signal: new AbortController().signal,
    steps: stepLog,
  };
}

describe('keywordCoverage / parseKeywordList', () => {
  it('拉丁词大小写不敏感，CJK 原样匹配', () => {
    const md = '# 张三\n\n- 熟悉 Kubernetes 与 React';
    const cov = keywordCoverage(md, ['kubernetes', 'React', 'Go', '张三', 'java']);
    expect(cov.find((c) => c.keyword === 'kubernetes')!.found).toBe(true);
    expect(cov.find((c) => c.keyword === 'React')!.found).toBe(true);
    expect(cov.find((c) => c.keyword === 'Go')!.found).toBe(false);
    expect(cov.find((c) => c.keyword === '张三')!.found).toBe(true);
    expect(cov.find((c) => c.keyword === 'java')!.found).toBe(false);
  });

  it('解析关键词列表：容忍前缀符号与编号，上限 12', () => {
    const text = ['- Kubernetes', '* Go', '1. React', '2、SQL', '空行', 'Docker'].join('\n');
    expect(parseKeywordList(text)).toEqual(['Kubernetes', 'Go', 'React', 'SQL', '空行', 'Docker']);
    expect(parseKeywordList(Array.from({ length: 20 }, (_, i) => `kw${i}`).join('\n'))).toHaveLength(12);
  });
});

describe('runWorkflow 状态机', () => {
  const defs: WorkflowStepDef[] = [
    { label: { zh: '一', en: 'One' }, kind: 'request', system: () => 'sys', user: () => 'u1' },
    { label: { zh: '二', en: 'Two' }, kind: 'local', local: (s) => `local:${s.intermediate[0]}` },
    { label: { zh: '三', en: 'Three' }, kind: 'request', system: () => 'sys', user: (s) => s.intermediate.join('|') },
  ];

  it('串行执行并传递中间输出', async () => {
    const calls: WorkflowRequest[] = [];
    const io = makeIO(['AAA', 'BBB'], calls);
    const result = await runWorkflow(defs, io, { markdown: 'md', jd: '', lang: 'zh' });
    expect(result.aborted).toBe(false);
    expect(result.failed).toBe(false);
    expect(result.outputs).toEqual(['AAA', 'local:AAA', 'BBB']);
    // 第二个请求步的 user 引用前序输出
    expect(calls[1].user).toBe('AAA|local:AAA');
    // 步状态：running → done 全序列
    const statuses = (io.steps as Array<{ index: number; patch: { status: string } }>).map((s) => s.patch.status);
    expect(statuses).toEqual(['running', 'done', 'running', 'done', 'running', 'done']);
  });

  it('请求步失败：标记 failed 并终止（后续步不产出占位）', async () => {
    const io = makeIO(['ok']);
    io.request = async function* () {
      yield 'partial';
      throw new Error('boom');
    };
    const result = await runWorkflow(defs, io, { markdown: 'md', jd: '', lang: 'zh' });
    expect(result.failed).toBe(true);
    expect(result.error).toBe('boom');
    expect(result.outputs).toEqual(['']);
  });

  it('abort：当前步标记 skipped 并整体返回 aborted', async () => {
    const controller = new AbortController();
    const io = makeIO(['ok']);
    io.signal = controller.signal;
    io.request = async function* () {
      // 模拟 fetch 在信号中止后抛出的 AbortError
      controller.abort();
      const err = new Error('aborted');
      err.name = 'AbortError';
      throw err;
    };
    const result = await runWorkflow(defs, io, { markdown: 'md', jd: '', lang: 'zh' });
    expect(result.aborted).toBe(true);
    expect(result.failed).toBe(false);
  });

  it('skip 步占位空串，保持后续步下标稳定', async () => {
    const skippedDefs: WorkflowStepDef[] = [
      { label: { zh: '一', en: 'One' }, kind: 'request', system: () => 's', user: () => 'u' },
      { label: { zh: '二', en: 'Two' }, kind: 'request', system: () => 's', user: () => 'u', skip: () => true },
      { label: { zh: '三', en: 'Three' }, kind: 'local', local: (s) => `idx2:${s.intermediate[1] === '' ? 'empty' : 'x'}` },
    ];
    const io = makeIO(['AA']);
    const result = await runWorkflow(skippedDefs, io, { markdown: 'md', jd: '', lang: 'zh' });
    expect(result.outputs).toEqual(['AA', '', 'idx2:empty']);
  });
});

describe('润色工作流（本地自查步）', () => {
  const MARKDOWN = '# 张三\n\n- 从 0 搭建物联网平台\n';

  it('全部定位成功时跳过修订步', async () => {
    const defs = buildPolishWorkflow('zh');
    const draft = '```resume-edits\n[{"search":"从 0 搭建物联网平台","replace":"从 0 搭建物联网平台，日均 2 亿条","note":"量化"}]\n```';
    const calls: WorkflowRequest[] = [];
    const io = makeIO(['问题清单', draft], calls);
    const result = await runWorkflow(defs, io, { markdown: MARKDOWN, jd: '', lang: 'zh' });
    expect(result.failed).toBe(false);
    // 只应有 2 次请求（诊断 + 起草），修订步被跳过
    expect(calls).toHaveLength(2);
    expect(result.outputs[2]).toContain('定位成功');
  });

  it('定位失败时进入修订步并附失败清单', async () => {
    const defs = buildPolishWorkflow('zh');
    const draft = '```resume-edits\n[{"search":"不存在的原文片段","replace":"x","note":"n"}]\n```';
    const calls: WorkflowRequest[] = [];
    const revised = '```resume-edits\n[{"search":"从 0 搭建物联网平台","replace":"y","note":"fixed"}]\n```';
    let callIdx = 0;
    const io = makeIO([]);
    io.request = async function* (req) {
      calls.push(req);
      const reply = callIdx === 0 ? '问题' : callIdx === 1 ? draft : revised;
      callIdx += 1;
      yield reply;
    };
    const result = await runWorkflow(defs, io, { markdown: MARKDOWN, jd: '', lang: 'zh' });
    expect(calls).toHaveLength(3);
    expect(result.outputs[2]).toContain('reason');
    expect(calls[2].user).toContain('原草稿');
    expect(calls[2].user).toContain('不存在的原文片段');
    // 最终气泡内容（最后一个请求步）= 修订输出
    expect(result.outputs[3]).toBe(revised);
  });
});

describe('JD 对齐工作流', () => {
  const MARKDOWN = '# 张三\n\n- 熟悉 React 与 TypeScript\n';

  it('三步串联：关键词 → 覆盖表 → 改写建议', async () => {
    const defs = buildJdWorkflow('zh');
    const calls: WorkflowRequest[] = [];
    const io = makeIO(['React\nGo\nDocker', '改写建议 + resume-edits 块'], calls);
    const result = await runWorkflow(defs, io, { markdown: MARKDOWN, jd: '前端工程师，要求 React', lang: 'zh' });
    expect(result.failed).toBe(false);
    // 覆盖步输出含统计与逐条状态
    expect(result.outputs[1]).toContain('覆盖：1/3');
    expect(result.outputs[1]).toContain('- React: 已覆盖');
    expect(result.outputs[1]).toContain('- Go: 未覆盖');
    // 改写步 user prompt 携带简历与覆盖表
    expect(calls[1].user).toContain('【覆盖表】');
    expect(calls[1].user).toContain('熟悉 React 与 TypeScript');
  });
});
