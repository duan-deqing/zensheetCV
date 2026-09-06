import { describe, expect, it } from 'vitest';
import { runAgentLoop } from '@/ai/agentLoop';
import type { ToolCall, ToolSchema, WireApiMessage } from '@/api/chatClient';

/** 测试用工具表（一个只读工具即可） */
const tools: ToolSchema[] = [
  {
    type: 'function',
    function: { name: 'read_resume', description: '', parameters: { type: 'object', properties: {}, required: [] } },
  },
];

const BASE_OPTS = {
  baseUrl: 'https://api.test/v1',
  apiKey: 'sk-test',
  model: 'test-model',
  tools,
  summarySystem: 'SUMMARY-PROMPT',
  fallbackSystem: 'FALLBACK-PROMPT',
};

const noopCb = {
  onRoundStart: () => {},
  onText: () => {},
  onStepStart: () => {},
  onStepEnd: () => {},
};

type FakeEvent = { type: 'text'; delta: string } | { type: 'tool_calls'; calls: ToolCall[] } | { type: 'done' };

interface Capture {
  /** 每轮请求是否携带 tools */
  toolsList: (ToolSchema[] | undefined)[];
  /** 每轮请求的 system（messages[0].content） */
  systems: string[];
  /** 每轮请求完整 messages 的 role 序列 */
  roleSets: string[][];
}

/** 构造按脚本回放的假请求函数：第 i 次调用回放 script[i]（越界回放最后一段） */
function scriptedRequest(script: FakeEvent[][], capture?: Capture) {
  let i = 0;
  return (o: {
    baseUrl: string;
    apiKey: string;
    model: string;
    messages: WireApiMessage[];
    tools?: ToolSchema[];
    signal: AbortSignal;
  }): AsyncGenerator<FakeEvent> => {
    capture?.toolsList.push(o.tools);
    capture?.systems.push(o.messages[0]?.role === 'system' ? (o.messages[0].content ?? '') : '');
    capture?.roleSets.push(o.messages.map((m) => m.role));
    const events = script[Math.min(i, script.length - 1)];
    i += 1;
    return (async function* () {
      for (const ev of events) {
        if (ev.type === 'tool_calls') yield { type: 'tool_calls' as const, calls: ev.calls };
        else if (ev.type === 'done') yield { type: 'done' as const };
        else yield { type: 'text' as const, delta: ev.delta };
      }
    })();
  };
}

describe('runAgentLoop', () => {
  it('首轮无工具调用即作为最终回复收尾', async () => {
    const capture: Capture = { toolsList: [], systems: [], roleSets: [] };
    const result = await runAgentLoop(
      { ...BASE_OPTS, messages: [{ role: 'user', content: '你好' }], signal: new AbortController().signal },
      noopCb,
      scriptedRequest([[{ type: 'text', delta: '你好' }], [{ type: 'text', delta: '不应到达' }]], capture),
      () => ({ ok: true, content: '{}' }),
    );
    expect(result).toMatchObject({ content: '你好', aborted: false, failed: false, degraded: false, truncated: false, rounds: 1 });
    expect(capture.roleSets[0]).toEqual(['system', 'user']);
  });

  it('工具轮执行后回填 assistant(tool_calls)+tool 消息并进入下一轮', async () => {
    const capture: Capture = { toolsList: [], systems: [], roleSets: [] };
    const executed: string[] = [];
    const result = await runAgentLoop(
      { ...BASE_OPTS, messages: [{ role: 'user', content: '读简历' }], signal: new AbortController().signal },
      noopCb,
      scriptedRequest([
        [{ type: 'tool_calls', calls: [{ id: 'call-1', name: 'read_resume', argsJson: '{}' }] }],
        [{ type: 'text', delta: '已读取' }],
      ], capture),
      (name) => {
        executed.push(name);
        return { ok: true, content: '{"markdown":"# 张三"}' };
      },
    );
    expect(executed).toEqual(['read_resume']);
    expect(result).toMatchObject({ content: '已读取', rounds: 2 });
    // 第二轮请求：system + user + assistant(tool_calls) + tool
    expect(capture.roleSets[1]).toEqual(['system', 'user', 'assistant', 'tool']);
    expect(capture.toolsList[1]).toEqual(tools);
  });

  it('达到 maxRounds 后切换总结轮（无 tools + summarySystem）', async () => {
    const capture: Capture = { toolsList: [], systems: [], roleSets: [] };
    const result = await runAgentLoop(
      { ...BASE_OPTS, messages: [{ role: 'user', content: '优化' }], signal: new AbortController().signal, maxRounds: 1 },
      noopCb,
      scriptedRequest([
        [{ type: 'tool_calls', calls: [{ id: 'call-1', name: 'read_resume', argsJson: '{}' }] }],
        [{ type: 'text', delta: '总结' }],
      ], capture),
      () => ({ ok: true, content: '{}' }),
    );
    expect(result).toMatchObject({ content: '总结', truncated: true, degraded: true });
    // 总结轮不带 tools，system 换为 summarySystem
    expect(capture.toolsList[1]).toBeUndefined();
    expect(capture.systems[1]).toBe('SUMMARY-PROMPT');
    // 工具轮累积的 tool 消息在总结轮仍可见
    expect(capture.roleSets[1]).toContain('tool');
  });

  it('供应商不支持 tools：首轮 400 后降级为 resume-edits 单轮', async () => {
    const capture: Capture = { toolsList: [], systems: [], roleSets: [] };
    let calls = 0;
    const request = (o: { messages: WireApiMessage[]; tools?: ToolSchema[] }): AsyncGenerator<FakeEvent> => {
      capture.toolsList.push(o.tools);
      capture.systems.push(o.messages[0]?.role === 'system' ? (o.messages[0].content ?? '') : '');
      calls += 1;
      if (calls === 1) {
        throw new Error('请求失败 (HTTP 400): tools parameter is not supported');
      }
      return (async function* () {
        yield { type: 'text' as const, delta: '降级回复' };
      })();
    };
    const result = await runAgentLoop(
      { ...BASE_OPTS, messages: [{ role: 'user', content: '润色' }], signal: new AbortController().signal },
      noopCb,
      request,
      () => ({ ok: true, content: '{}' }),
    );
    expect(result).toMatchObject({ content: '降级回复', failed: false, degraded: true, rounds: 2 });
    // 降级轮不带 tools 且 system 换为 fallbackSystem
    expect(capture.toolsList[1]).toBeUndefined();
    expect(capture.systems[1]).toBe('FALLBACK-PROMPT');
  });

  it('普通错误（非 tools 不支持）直接失败返回', async () => {
    const result = await runAgentLoop(
      { ...BASE_OPTS, messages: [{ role: 'user', content: '润色' }], signal: new AbortController().signal },
      noopCb,
      () => {
        throw new Error('网络断开');
      },
      () => ({ ok: true, content: '{}' }),
    );
    expect(result).toMatchObject({ content: '', failed: true, error: '网络断开', degraded: false });
  });

  it('abort 中断返回 aborted', async () => {
    const result = await runAgentLoop(
      { ...BASE_OPTS, messages: [{ role: 'user', content: '润色' }], signal: new AbortController().signal },
      noopCb,
      () => {
        const err = new Error('The operation was aborted');
        err.name = 'AbortError';
        throw err;
      },
      () => ({ ok: true, content: '{}' }),
    );
    expect(result).toMatchObject({ aborted: true, failed: false });
  });

  it('工具执行器抛异常被捕获，错误回传模型继续循环', async () => {
    const stepEnds: Array<{ status: string; detail?: string }> = [];
    const result = await runAgentLoop(
      { ...BASE_OPTS, messages: [{ role: 'user', content: '优化' }], signal: new AbortController().signal },
      { ...noopCb, onStepEnd: (patch) => stepEnds.push({ status: patch.status, detail: patch.detail }) },
      scriptedRequest([
        [{ type: 'tool_calls', calls: [{ id: 'call-1', name: 'boom_tool', argsJson: '{}' }] }],
        [{ type: 'text', delta: '已处理错误' }],
      ]),
      () => {
        throw new Error('boom');
      },
    );
    expect(result).toMatchObject({ content: '已处理错误', failed: false });
    expect(stepEnds[0]).toMatchObject({ status: 'failed' });
    expect(stepEnds[0].detail).toContain('boom');
  });

  it('多工具调用逐个执行且按序回填 tool 结果', async () => {
    const capture: Capture = { toolsList: [], systems: [], roleSets: [] };
    await runAgentLoop(
      { ...BASE_OPTS, messages: [{ role: 'user', content: '查' }], signal: new AbortController().signal },
      noopCb,
      scriptedRequest([
        [
          { type: 'tool_calls', calls: [
            { id: 'call-a', name: 'get_page_count', argsJson: '' },
            { id: 'call-b', name: 'get_template_info', argsJson: '' },
          ] },
        ],
        [{ type: 'text', delta: 'ok' }],
      ], capture),
      (name) => ({ ok: true, content: `{"tool":"${name}"}` }),
    );
    expect(capture.roleSets[1]).toEqual(['system', 'user', 'assistant', 'tool', 'tool']);
  });
});
