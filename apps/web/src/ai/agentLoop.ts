/** Agent 循环（方案 B）：前端 function calling 主循环。
 *  每轮：流式请求 → 聚合文本/工具调用 → 执行工具并回填 → 下一轮；
 *  无工具调用即结束。轮次上限后降级为「无工具总结」一轮（summarySystem）。
 *  供应商不支持 tools（首轮 400 报文含 tool/function 措辞）时自动降级为
 *  方案 A 单轮（resume-edits 协议 fallbackSystem），结果标记 degraded。
 *  文本策略与工作流一致：每轮开始清空气泡（onRoundStart），增量全部 onText，
 *  气泡最终内容即最后一个产生文本的轮次。
 *  请求函数注入，可单测。 */
import type { ToolCall, ToolSchema, WireApiMessage } from '@/api/chatClient';
import type { Bi } from '@/i18n/LangContext';
import type { StepStatus } from './types';
import type { ToolResult } from './agentTools';

export interface AgentLoopOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
  /** [system, ...history]；history 只含 user/assistant */
  messages: Array<{ role: string; content: string }>;
  tools: ToolSchema[];
  /** 工具额度用尽后的总结轮 system prompt */
  summarySystem: string;
  /** 供应商不支持 tools 时的降级 system prompt（resume-edits 协议） */
  fallbackSystem: string;
  signal: AbortSignal;
  maxRounds?: number;
}

export interface AgentLoopCallbacks {
  /** 每轮开始（调用方清空气泡） */
  onRoundStart: () => void;
  /** 文本增量（全量回调，流入气泡） */
  onText: (delta: string) => void;
  /** 工具步开始（AIStatus 追加一行） */
  onStepStart: (label: Bi) => void;
  /** 工具步结束 */
  onStepEnd: (patch: { status: StepStatus; detail?: string; ms?: number }) => void;
}

export interface AgentLoopResult {
  /** 最终文本（总结轮 / 无工具轮 / 降级轮的输出） */
  content: string;
  aborted: boolean;
  failed: boolean;
  error?: string;
  /** true = 供应商不支持 tools，已降级为方案 A 单轮 */
  degraded: boolean;
  /** true = 达到工具轮上限后强制总结收尾 */
  truncated: boolean;
  rounds: number;
}

/** 工具请求轮上限（超过即强制总结） */
const DEFAULT_MAX_ROUNDS = 6;

/** 错误报文是否为「不支持 tools」类（供应商 400 常见措辞） */
function isToolsUnsupportedError(message: string): boolean {
  return /tool|function/i.test(message) && /400|invalid|unsupported|not\s+support|param(eter)?/i.test(message);
}

export async function runAgentLoop(
  opts: AgentLoopOptions,
  cb: AgentLoopCallbacks,
  request: (o: {
    baseUrl: string;
    apiKey: string;
    model: string;
    messages: WireApiMessage[];
    tools?: ToolSchema[];
    signal: AbortSignal;
  }) => AsyncGenerator<{ type: 'text'; delta: string } | { type: 'tool_calls'; calls: ToolCall[] } | { type: 'done' }>,
  executeTool: (name: string, argsJson: string) => ToolResult,
): Promise<AgentLoopResult> {
  const maxRounds = opts.maxRounds ?? DEFAULT_MAX_ROUNDS;
  const first = opts.messages[0];
  const system0 = first?.role === 'system' ? first.content : '';
  const history: WireApiMessage[] = (first?.role === 'system' ? opts.messages.slice(1) : opts.messages).map((m) => ({
    role: m.role,
    content: m.content,
  }));
  /** 工具轮累积的对话（assistant tool_calls + role:'tool' 结果） */
  const toolWire: WireApiMessage[] = [];
  let system = system0;
  let degraded = false;
  let truncated = false;
  let round = 0;

  /** 单次流式请求 */
  const requestOnce = async function* (): AsyncGenerator<
    { type: 'text'; delta: string } | { type: 'tool_calls'; calls: ToolCall[] } | { type: 'done' }
  > {
    return yield* request({
      baseUrl: opts.baseUrl,
      apiKey: opts.apiKey,
      model: opts.model,
      messages: [{ role: 'system', content: system }, ...history, ...toolWire],
      tools: degraded ? undefined : opts.tools,
      signal: opts.signal,
    });
  };

  try {
    while (true) {
      round += 1;
      cb.onRoundStart();
      let text = '';
      const calls: ToolCall[] = [];
      for await (const ev of requestOnce()) {
        if (ev.type === 'text') {
          cb.onText(ev.delta);
          text += ev.delta;
        } else if (ev.type === 'tool_calls') {
          calls.push(...ev.calls);
        } else break;
      }

      // 无工具调用 → 本轮即最终回复（降级单轮同样在此收尾）
      if (calls.length === 0 || degraded) {
        return { content: text, aborted: false, failed: false, degraded, truncated, rounds: round };
      }

      // 工具轮：记录助手 tool_calls 消息并逐个执行
      toolWire.push({
        role: 'assistant',
        content: text,
        tool_calls: calls.map((c) => ({
          id: c.id,
          type: 'function' as const,
          function: { name: c.name, arguments: c.argsJson || '{}' },
        })),
      });
      for (const call of calls) {
        cb.onStepStart({ zh: `调用 ${call.name}`, en: `Call ${call.name}` });
        const t0 = Date.now();
        let result: ToolResult;
        try {
          result = executeTool(call.name, call.argsJson || '{}');
        } catch (err: unknown) {
          result = { ok: false, content: JSON.stringify({ error: (err as Error)?.message || 'tool crashed' }) };
        }
        cb.onStepEnd({
          status: result.ok ? 'done' : 'failed',
          ms: Date.now() - t0,
          detail: result.content.slice(0, 60),
        });
        toolWire.push({ role: 'tool', tool_call_id: call.id, content: result.content });
      }

      // 额度用尽：下一轮切换为无工具总结
      if (round >= maxRounds) {
        truncated = true;
        degraded = true;
        system = opts.summarySystem;
      }
    }
  } catch (err: unknown) {
    if ((err as { name?: string })?.name === 'AbortError') {
      return { content: '', aborted: true, failed: false, degraded, truncated, rounds: round };
    }
    const msg = (err as Error)?.message || String(err);
    // 首轮即失败且报文指向 tools 不被支持：降级为方案 A 单轮重试
    if (!degraded && round === 1 && isToolsUnsupportedError(msg)) {
      try {
        degraded = true;
        system = opts.fallbackSystem;
        cb.onRoundStart();
        let text = '';
        for await (const ev of requestOnce()) {
          if (ev.type === 'text') {
            cb.onText(ev.delta);
            text += ev.delta;
          } else if (ev.type === 'done') break;
        }
        return { content: text, aborted: false, failed: false, degraded, truncated, rounds: round + 1 };
      } catch (retryErr: unknown) {
        if ((retryErr as { name?: string })?.name === 'AbortError') {
          return { content: '', aborted: true, failed: false, degraded, truncated, rounds: round + 1 };
        }
        return {
          content: '',
          aborted: false,
          failed: true,
          error: (retryErr as Error)?.message || msg,
          degraded,
          truncated,
          rounds: round + 1,
        };
      }
    }
    return { content: '', aborted: false, failed: true, error: msg, degraded, truncated, rounds: round };
  }
}
