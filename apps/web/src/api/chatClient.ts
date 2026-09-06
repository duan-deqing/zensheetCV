/** OpenAI 兼容流式对话客户端（浏览器直连供应商，BYOK）。
 *  解析 SSE `data: {...}` 增量与 `data: [DONE]` 终止标记。
 *  streamChatEvents 为底层实现：文本增量 + 工具调用（function calling，
 *  delta.tool_calls 按 index 聚合，流结束产出完整调用）；
 *  streamChat 为纯文本薄封装，行为与旧版完全一致。 */
import { getLang } from '@/i18n/LangContext';

/** 工具 schema（OpenAI function calling 格式） */
export interface ToolSchema {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

/** 模型返回的一次完整工具调用（arguments 分片已在流内聚合） */
export interface ToolCall {
  id: string;
  name: string;
  /** JSON 字符串，可能为空串（调用方按 {} 处理） */
  argsJson: string;
}

export type StreamEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool_calls'; calls: ToolCall[] }
  | { type: 'done' };

/** 请求消息的宽容形态：普通消息 {role, content}；
 *  Agent 循环还需透传 assistant 的 tool_calls 与 role:'tool' 的执行结果 */
export interface WireApiMessage {
  role: string;
  content: string | null;
  tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>;
  tool_call_id?: string;
}

export interface ChatRequestOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: Array<WireApiMessage>;
  signal?: AbortSignal;
  /** 工具表：传入后模型可返回 tool_calls（供应商需支持 function calling） */
  tools?: ToolSchema[];
}

export async function* streamChatEvents(opts: ChatRequestOptions): AsyncGenerator<StreamEvent> {
  const url = `${opts.baseUrl.replace(/\/+$/, '')}/chat/completions`;
  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
    stream: true,
  };
  if (opts.tools && opts.tools.length > 0) body.tools = opts.tools;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok) {
    const lang = getLang();
    let detail = lang === 'en'
      ? `Request failed (HTTP ${res.status})`
      : `请求失败 (HTTP ${res.status})`;
    try {
      const resBody = await res.text();
      if (resBody) detail += `: ${resBody.slice(0, 300)}`;
    } catch { /* 忽略读取失败 */ }
    throw new Error(detail);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error(getLang() === 'en'
      ? 'Streaming is not supported in this browser'
      : '当前浏览器不支持流式读取');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  // tool_calls 按 index 聚合：id/name 首次出现记录，arguments 逐分片拼接
  const toolAcc = new Map<number, { id: string; name: string; args: string }>();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // SSE 事件可能被 chunk 边界截断，先缓存不完整的行
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') {
        yield* drainToolCalls(toolAcc);
        return;
      }
      let data: unknown;
      try {
        data = JSON.parse(payload);
      } catch {
        continue; // 非完整 JSON 行（如注释/心跳）忽略
      }
      const error = (data as { error?: { message?: string } | string })?.error;
      if (error) {
        throw new Error(
          typeof error === 'string'
            ? error
            : error.message
              || (getLang() === 'en' ? 'Provider returned an error' : '供应商返回错误'),
        );
      }
      const choice = (data as {
        choices?: Array<{
          delta?: {
            content?: string;
            tool_calls?: Array<{
              index?: number;
              id?: string;
              function?: { name?: string; arguments?: string };
            }>;
          };
          finish_reason?: string | null;
        }>;
      })?.choices?.[0];
      const delta = choice?.delta;
      if (delta?.content) yield { type: 'text', delta: delta.content };
      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = typeof tc.index === 'number' ? tc.index : 0;
          const acc = toolAcc.get(idx) ?? { id: '', name: '', args: '' };
          if (tc.id) acc.id = tc.id;
          if (tc.function?.name) acc.name = tc.function.name;
          if (tc.function?.arguments) acc.args += tc.function.arguments;
          toolAcc.set(idx, acc);
        }
      }
    }
  }
  // 流自然结束（无 [DONE]）：也要把聚合中的工具调用让出去
  yield* drainToolCalls(toolAcc);
  yield { type: 'done' };
}

/** 产出聚合完成的工具调用并清空累积区（按 index 排序） */
async function* drainToolCalls(
  toolAcc: Map<number, { id: string; name: string; args: string }>,
): AsyncGenerator<StreamEvent> {
  if (toolAcc.size === 0) return;
  const calls: ToolCall[] = [...toolAcc.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, v]) => ({ id: v.id, name: v.name, argsJson: v.args }));
  toolAcc.clear();
  yield { type: 'tool_calls', calls };
}

/** 流式对话（纯文本视图）：逐段产出文本增量，忽略工具调用。
 *  供普通聊天 / 工作流使用，行为与旧版完全一致。 */
export async function* streamChat(opts: ChatRequestOptions): AsyncGenerator<string> {
  for await (const ev of streamChatEvents(opts)) {
    if (ev.type === 'text') yield ev.delta;
  }
}

/** 浏览器直连供应商 GET /models（OpenAI 兼容协议）。
 *  供应商未开放 CORS 时会抛出网络错误，此时可手动输入模型名称 */

export async function fetchProviderModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const url = `${baseUrl.replace(/\/+$/, '')}/models`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch {
    // 网络层失败：断网/被网络环境拦截，或供应商不开放浏览器跨域（CORS，如实测 LongCat 未返回 CORS 头）
    throw new Error(getLang() === 'en'
      ? 'Cannot reach the provider endpoint — check your network; the provider must also allow browser CORS. Enter the model name manually'
      : '无法连接到供应商接口：请检查网络，且供应商需支持浏览器跨域（CORS）。可手动输入模型名称');
  }
  if (!res.ok) {
    throw new Error(getLang() === 'en'
      ? `Request failed (HTTP ${res.status})`
      : `请求失败 (HTTP ${res.status})`);
  }
  const data = await res.json();
  // OpenAI 协议返回 { data: [{ id }] }，兼容直接返回字符串数组或对象数组
  const raw: unknown[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return raw
    .map((m) => (typeof m === 'string' ? m : (m as { id?: unknown })?.id))
    .filter((m): m is string => typeof m === 'string' && m.length > 0);
}
