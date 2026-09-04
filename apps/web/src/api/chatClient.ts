/** OpenAI 兼容流式对话客户端（浏览器直连供应商，BYOK）。
 *  解析 SSE `data: {...}` 增量与 `data: [DONE]` 终止标记 */
import { getLang } from '@/i18n/LangContext';

export interface ChatRequestOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  signal?: AbortSignal;
}

/** 流式对话：逐段产出文本增量 */
export async function* streamChat(opts: ChatRequestOptions): AsyncGenerator<string> {
  const url = `${opts.baseUrl.replace(/\/+$/, '')}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      stream: true,
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const lang = getLang();
    let detail = lang === 'en'
      ? `Request failed (HTTP ${res.status})`
      : `请求失败 (HTTP ${res.status})`;
    try {
      const body = await res.text();
      if (body) detail += `: ${body.slice(0, 300)}`;
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
      if (payload === '[DONE]') return;
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
      const delta = (data as { choices?: Array<{ delta?: { content?: string } }> })
        ?.choices?.[0]?.delta?.content;
      if (delta) yield delta;
    }
  }
}
