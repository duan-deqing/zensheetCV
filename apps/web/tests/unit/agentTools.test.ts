import { describe, expect, it } from 'vitest';
import { AGENT_TOOL_SCHEMAS, executeTool, readSection, type AgentToolContext } from '@/ai/agentTools';

const RESUME = [
  '# 张三',
  '',
  '## 工作经历',
  '',
  '- 负责后端开发',
  '- 负责后端开发（二期）',
  '',
  '### 项目亮点',
  '',
  '- 从 0 搭建物联网平台',
  '',
  '## 教育背景',
  '',
  '- 本科 · 某大学',
].join('\n');

/** 构造工具执行上下文 + 入队记录 */
function makeCtx(overrides?: Partial<AgentToolContext>) {
  const queued: Array<{ search: string; replace: string; note?: string }> = [];
  const ctx: AgentToolContext = {
    getMarkdown: () => RESUME,
    getPageCount: () => 2,
    getTemplateInfo: () => ({
      id: 'vintage',
      name: '优雅复古',
      primaryColor: '#8B3A3A',
      fontSize: 14,
      lineHeight: 1.6,
    }),
    onPatch: (p) => queued.push(p),
    ...overrides,
  };
  return { ctx, queued };
}

describe('executeTool', () => {
  it('read_resume 返回完整 Markdown', () => {
    const { ctx } = makeCtx();
    const result = executeTool('read_resume', '', ctx);
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.content)).toEqual({ markdown: RESUME });
  });

  it('read_section 命中标题返回小节（到同级或更高级标题为止）', () => {
    const { ctx } = makeCtx();
    const result = executeTool('read_section', JSON.stringify({ heading: '工作经历' }), ctx);
    const data = JSON.parse(result.content) as { found: boolean; content: string };
    expect(result.ok).toBe(true);
    expect(data.found).toBe(true);
    expect(data.content).toContain('## 工作经历');
    expect(data.content).toContain('### 项目亮点');
    expect(data.content).not.toContain('教育背景');
  });

  it('read_section 未命中返回 found:false', () => {
    const { ctx } = makeCtx();
    const result = executeTool('read_section', JSON.stringify({ heading: '奖项' }), ctx);
    expect(result.ok).toBe(false);
    expect(JSON.parse(result.content)).toMatchObject({ found: false, heading: '奖项' });
  });

  it('read_section 缺少 heading 参数报错', () => {
    const { ctx } = makeCtx();
    const result = executeTool('read_section', '', ctx);
    expect(result.ok).toBe(false);
    expect(JSON.parse(result.content).error).toContain('heading');
  });

  it('propose_edit 唯一命中即入队', () => {
    const { ctx, queued } = makeCtx();
    const result = executeTool(
      'propose_edit',
      JSON.stringify({ search: '从 0 搭建物联网平台', replace: '从 0 搭建物联网平台，日均处理 2 亿条消息', note: '量化' }),
      ctx,
    );
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.content).queued).toBe(true);
    expect(queued).toEqual([
      { search: '从 0 搭建物联网平台', replace: '从 0 搭建物联网平台，日均处理 2 亿条消息', note: '量化' },
    ]);
  });

  it('propose_edit 未命中返回 not_found', () => {
    const { ctx, queued } = makeCtx();
    const result = executeTool('propose_edit', JSON.stringify({ search: '不存在的片段', replace: 'x' }), ctx);
    expect(result.ok).toBe(false);
    expect(JSON.parse(result.content).error).toBe('not_found');
    expect(queued).toHaveLength(0);
  });

  it('propose_edit 多处命中返回 ambiguous 与次数', () => {
    const { ctx, queued } = makeCtx();
    const result = executeTool('propose_edit', JSON.stringify({ search: '负责后端开发', replace: 'x' }), ctx);
    expect(result.ok).toBe(false);
    const data = JSON.parse(result.content) as { error: string; occurrences: number };
    expect(data.error).toBe('ambiguous');
    expect(data.occurrences).toBe(2);
    expect(queued).toHaveLength(0);
  });

  it('propose_edit 缺少 search / 参数非法 JSON 报错', () => {
    const { ctx } = makeCtx();
    expect(executeTool('propose_edit', '{}', ctx).ok).toBe(false);
    expect(executeTool('propose_edit', '{bad json', ctx).ok).toBe(false);
  });

  it('get_page_count 返回页数；未渲染时给出提示', () => {
    const { ctx } = makeCtx();
    expect(JSON.parse(executeTool('get_page_count', '', ctx).content)).toEqual({ pages: 2 });
    const { ctx: emptyCtx } = makeCtx({ getPageCount: () => null });
    const result = executeTool('get_page_count', '', emptyCtx);
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.content).pages).toBeNull();
  });

  it('get_template_info 返回快照；无模板时 available:false', () => {
    const { ctx } = makeCtx();
    const result = executeTool('get_template_info', '', ctx);
    expect(JSON.parse(result.content)).toMatchObject({ id: 'vintage', name: '优雅复古', primaryColor: '#8B3A3A' });
    const { ctx: noTpl } = makeCtx({ getTemplateInfo: () => null });
    expect(JSON.parse(executeTool('get_template_info', '', noTpl).content)).toEqual({ available: false });
  });

  it('未知工具返回 ok:false', () => {
    const { ctx } = makeCtx();
    const result = executeTool('hack_filesystem', '', ctx);
    expect(result.ok).toBe(false);
    expect(JSON.parse(result.content).error).toContain('unknown tool');
  });

  it('schema 表包含 5 个工具且名称唯一', () => {
    const names = AGENT_TOOL_SCHEMAS.map((t) => t.function.name);
    expect(names).toEqual(['read_resume', 'read_section', 'propose_edit', 'get_page_count', 'get_template_info']);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('readSection', () => {
  it('按 includes 匹配标题（大小写不敏感）', () => {
    const md = '## Work Experience\n\n- Built X\n\n## Education\n\n- BS';
    expect(readSection(md, 'work experience')).toContain('- Built X');
  });

  it('子标题（更高级别）归属当前小节，同级标题截断', () => {
    const md = ['## A', '', '内容A', '', '### A1', '', '内容A1', '', '## B', '', '内容B'].join('\n');
    const section = readSection(md, 'A');
    expect(section).toContain('内容A1');
    expect(section).not.toContain('内容B');
  });
});
