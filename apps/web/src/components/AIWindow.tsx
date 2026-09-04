import { useEffect, useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEditor } from '@/store/EditorContext';
import { useUI } from '@/store/UIContext';
import { useAuth } from '@/store/AuthContext';
import { streamChat } from '@/api/chatClient';
import { getAiHistory, putAiHistory } from '@/storage/aiHistoryStore';
import { HoverTip } from '@/components/HoverTip';
import { useTr, type Bi } from '@/i18n/LangContext';
import { loadAISettings, resolveAISettings } from '@/settings/aiSettings';

/** AI 请求执行元信息：用于消息上方的可展开执行状态 */
interface AIMeta {
  model?: string;
  baseUrl?: string;
  /** 是否携带了当前简历作为上下文 */
  context: boolean;
  start: number;
  end?: number;
  status: 'running' | 'done' | 'error' | 'aborted';
  /** 技术性报错详情，仅在状态面板中展示 */
  error?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  /** 泡内时间戳（HH:MM），创建消息时记录 */
  time?: string;
  /** 发送者名称，显示在时间戳左侧 */
  name?: string;
  /** AI 消息的执行状态（用户消息无） */
  meta?: AIMeta;
}

function nowTime(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** 规范化从本地载入的历史：中断的流式消息标记为「已停止」 */
function normalizeHistory(msgs: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(msgs)) return [];
  return msgs.map((m) =>
    m.meta?.status === 'running'
      ? { ...m, meta: { ...m.meta, status: 'aborted' as const, end: m.meta.end ?? Date.now() } }
      : m,
  );
}

/** AI 回复的 Markdown 渲染样式：紧凑聊天排版（GFM 支持表格/任务列表/删除线） */
const aiMarkdownComponents: Components = {
  p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => <h3 className="mt-2 mb-1 text-[14px] font-semibold text-gray-900 first:mt-0">{children}</h3>,
  h2: ({ children }) => <h4 className="mt-2 mb-1 text-[13px] font-semibold text-gray-900 first:mt-0">{children}</h4>,
  h3: ({ children }) => <h5 className="mt-2 mb-1 text-[13px] font-semibold text-gray-900 first:mt-0">{children}</h5>,
  h4: ({ children }) => <h6 className="mt-2 mb-1 text-[13px] font-semibold text-gray-900 first:mt-0">{children}</h6>,
  ul: ({ children }) => <ul className="my-1.5 pl-4 list-disc space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="my-1.5 pl-4 list-decimal space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through text-gray-400">{children}</del>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline decoration-primary-300 hover:text-primary-700 transition-colors">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-1.5 border-l-2 border-gray-300 pl-2.5 text-gray-500">{children}</blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = typeof className === 'string' && className.includes('language-');
    if (isBlock) {
      return <code className="block font-mono text-[12px] leading-relaxed whitespace-pre">{children}</code>;
    }
    return <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[12px] text-gray-800">{children}</code>;
  },
  pre: ({ children }) => (
    <pre className="my-1.5 rounded-lg bg-gray-50 border border-gray-200/80 px-2.5 py-2 overflow-x-auto">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="my-1.5 overflow-x-auto rounded-lg border border-gray-200/80">
      <table className="w-full text-[12px] border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-gray-200 bg-gray-50 px-2 py-1 text-left font-semibold text-gray-700">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-gray-100 px-2 py-1 align-top">{children}</td>,
  hr: () => <hr className="my-2 border-gray-200" />,
};

/** AI 回复正文：Markdown 解析渲染 */
function AIMarkdown({ content }: { content: string }) {
  return (
    <div className="text-gray-700">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={aiMarkdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

/** 预填快捷指令：点击后写入输入框，用户可补充后发送 */
const QUICK_PROMPTS: { label: Bi; text: Bi }[] = [
  {
    label: { zh: '润色全文', en: 'Polish resume' },
    text: {
      zh: '请帮我润色当前简历的表述，让经历更有说服力。',
      en: 'Please polish the wording of my current resume to make my experience more persuasive.',
    },
  },
  {
    label: { zh: '关键词分析', en: 'Keyword analysis' },
    text: {
      zh: '以下是目标职位描述，请分析我的简历缺失哪些关键词：\n',
      en: 'Here is the target job description. Analyze which keywords are missing from my resume:\n',
    },
  },
  {
    label: { zh: '要点成段', en: 'Expand bullets' },
    text: {
      zh: '请把以下要点扩写成结构完整的项目描述：\n- ',
      en: 'Please expand the following bullet points into a well-structured project description:\n- ',
    },
  },
];

/** 发送图标（向上箭头） */
function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

/** 停止图标（方块） */
function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  );
}

/** AI 消息上方的执行状态行：收起时显示摘要，点击展开查看具体步骤 */
function AIStatus({ meta }: { meta: AIMeta }) {
  const [open, setOpen] = useState(false);
  const tr = useTr();
  const dur = (((meta.end ?? Date.now()) - meta.start) / 1000).toFixed(1);
  const statusText =
    meta.status === 'running'
      ? tr({ zh: '生成中', en: 'Generating' })
      : meta.status === 'done'
        ? tr({ zh: '已完成', en: 'Done' })
        : meta.status === 'aborted'
          ? tr({ zh: '已停止', en: 'Stopped' })
          : tr({ zh: '执行出错', en: 'Error' });
  const dotColor =
    meta.status === 'running'
      ? 'bg-primary-500 animate-pulse'
      : meta.status === 'done'
        ? 'bg-emerald-500'
        : meta.status === 'aborted'
          ? 'bg-amber-500'
          : 'bg-red-500';

  // 从实际请求过程还原的执行步骤
  const steps: { label: Bi; detail: string; failed?: boolean }[] = [
    {
      label: { zh: '读取模型配置', en: 'Read model config' },
      detail: meta.model ?? tr({ zh: '未配置 AI 模型', en: 'No AI model configured' }),
      failed: !meta.model,
    },
    {
      label: { zh: '组装对话上下文', en: 'Build context' },
      detail: meta.context
        ? tr({ zh: '已携带当前简历内容', en: 'With resume context' })
        : tr({ zh: '仅携带对话历史', en: 'Chat history only' }),
    },
    {
      label: { zh: '连接推理服务', en: 'Connect to inference service' },
      detail: meta.baseUrl
        ? meta.baseUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '')
        : meta.model
          ? tr({ zh: '未获取服务地址', en: 'Service address unavailable' })
          : tr({ zh: '已跳过（未配置）', en: 'Skipped (not configured)' }),
      failed: !!meta.model && !meta.baseUrl,
    },
    {
      label: { zh: '流式生成回复', en: 'Stream response' },
      detail: `${statusText} · ${dur}s`,
      failed: meta.status === 'error',
    },
  ];

  return (
    <div className="mb-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-[11px] font-mono text-gray-400 hover:text-gray-600 transition-colors select-none"
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
        {tr({ zh: 'AI 执行', en: 'AI RUN' })} · {statusText}
        <span className="tabular-nums">· {dur}s</span>
      </button>
      {open && (
        <div className="mt-1.5 rounded-lg bg-gray-50 border border-gray-200/80 px-2.5 py-2 flex flex-col gap-1.5">
          {steps.map((s, i) => (
            <div key={s.label.zh} className="flex items-baseline gap-2 text-[11px] leading-snug">
              <span className="font-mono text-gray-300 tabular-nums shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <span className={s.failed ? 'text-red-500 shrink-0' : 'text-gray-600 shrink-0'}>{tr(s.label)}</span>
              <span className={`truncate ${s.failed ? 'text-red-400' : 'text-gray-400'}`} title={s.detail}>
                {s.detail}
              </span>
            </div>
          ))}
          {meta.error && (
            <div className="flex items-baseline gap-2 text-[11px] leading-snug pt-1 border-t border-gray-200/80">
              <span className="font-mono text-red-400 shrink-0">!</span>
              <span className="text-red-500 shrink-0">{tr({ zh: '错误详情', en: 'Error details' })}</span>
              <span className="text-red-400 break-all" title={meta.error}>{meta.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * AI 助手聊天窗口：在 EditorPage 中与预览窗口同层级渲染（占据页面右侧），
 * 外观与编辑器/预览同为圆角卡片。多轮流式对话，BYOK 配置随请求携带；
 * Esc / 关闭按钮 / 再次点击 AI 按钮均可关闭。
 */
export function AIWindow({ width, resumeId, onClose }: { width?: number; resumeId?: string; onClose?: () => void }) {
  const { aiWindowOpen, toggleAIWindow } = useUI();
  // 统一关闭入口：由 EditorPage 的关闭流程驱动（滑出动画结束后卸载）
  const close = onClose ?? toggleAIWindow;
  const { markdown } = useEditor();
  const { user } = useAuth();
  const tr = useTr();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  // 对话记录持久化（IndexedDB）：按简历隔离，打开窗口时从本地载入；
  // 流式期间与载入完成前不回写，避免覆盖
  const [historyReady, setHistoryReady] = useState(false);
  useEffect(() => {
    if (!resumeId) {
      setMessages([]);
      setHistoryReady(false);
      return;
    }
    let cancelled = false;
    setHistoryReady(false);
    getAiHistory(resumeId)
      .then((record) => {
        if (!cancelled) setMessages(normalizeHistory((record?.messages ?? []) as ChatMessage[]));
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setHistoryReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [resumeId]);
  useEffect(() => {
    if (!historyReady || isStreaming || !resumeId) return;
    const t = setTimeout(() => {
      putAiHistory({ resume_id: resumeId, messages, updated_at: new Date().toISOString() })
        .catch(() => { /* 保存失败静默，下次消息变化时重试 */ });
    }, 500);
    return () => clearTimeout(t);
  }, [messages, historyReady, isStreaming, resumeId]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Esc 关闭（面板打开时）
  useEffect(() => {
    if (!aiWindowOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [aiWindowOpen, close]);

  // 打开时聚焦输入框；消息变化时滚动到底部
  useEffect(() => {
    if (aiWindowOpen) inputRef.current?.focus();
  }, [aiWindowOpen]);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // 输入框自适应高度：随内容增减（含粘贴/清空/输入法），上限约 5 行
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  const send = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');

    // BYOK：未配置供应商时直接给出提示，不发请求
    const cfg = resolveAISettings(loadAISettings());
    const userMsg: ChatMessage = { role: 'user', content: text, time: nowTime(), name: user?.name || tr({ zh: '我', en: 'Me' }) };
    const history = [...messages, userMsg];
    // 附带当前简历 Markdown 作为上下文（仅首次请求携带，避免多轮重复超长）
    const contextPrefix = messages.length === 0 && markdown.trim()
      ? tr({
          zh: `【我的当前简历 Markdown】\n${markdown}\n\n【我的问题】\n${text}`,
          en: `[My current resume Markdown]\n${markdown}\n\n[My question]\n${text}`,
        })
      : text;
    setMessages([...history, {
      role: 'assistant',
      content: '',
      time: nowTime(),
      name: tr({ zh: 'AI 助手', en: 'AI Assistant' }),
      meta: { model: cfg?.model, baseUrl: cfg?.baseUrl, context: messages.length === 0 && !!markdown.trim(), start: Date.now(), status: 'running' },
    }]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const patchLast = (patch: (prev: string) => string) => {
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], content: patch(next[next.length - 1].content) };
        return next;
      });
    };
    /** 将技术性报错写入执行状态，正文只保留友好提示 */
    const FAIL_HINT = tr({
      zh: '生成失败：请检查网络连接与 API 配置，可展开上方「AI 执行」查看详情。',
      en: 'Generation failed: check your network connection and API configuration. Expand "AI RUN" above for details.',
    });
    const setLastError = (error: string) => {
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const last = next[next.length - 1];
        if (last.role === 'assistant' && last.meta) {
          next[next.length - 1] = { ...last, meta: { ...last.meta, error } };
        }
        return next;
      });
    };

    // 记录执行结果，供结束时写入状态元信息
    let outcome: AIMeta['status'] = 'done';

    try {
      if (!cfg) {
        outcome = 'error';
        setLastError(tr({ zh: '未配置 AI 模型，未发起请求', en: 'No AI model configured — request not sent' }));
        patchLast(
          () =>
            tr({
              zh: '尚未配置 AI 模型：点击右上角用户名，在「设置 → AI」中配置供应商与 API KEY 后重试。',
              en: 'No AI model configured yet: click your username at the top right, set up a provider and API key under "Settings → AI", then try again.',
            }),
        );
        return;
      }
      // 浏览器直连供应商（OpenAI 兼容协议，SSE 流式）
      for await (const delta of streamChat({
        baseUrl: cfg.baseUrl,
        apiKey: cfg.apiKey,
        model: cfg.model,
        messages: history.map((m, i) => ({
          role: m.role,
          content: i === 0 ? contextPrefix : m.content,
        })),
        signal: controller.signal,
      })) {
        patchLast((prev) => prev + delta);
      }
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'AbortError') {
        outcome = 'aborted';
      } else {
        outcome = 'error';
        setLastError((err as Error)?.message || tr({ zh: '网络请求异常', en: 'Network request error' }));
        patchLast((prev) => prev || FAIL_HINT);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      // 将最终状态与耗时写回该条 AI 消息的执行元信息
      const end = Date.now();
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const last = next[next.length - 1];
        if (last.role === 'assistant' && last.meta) {
          next[next.length - 1] = { ...last, meta: { ...last.meta, status: outcome, end } };
        }
        return next;
      });
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  if (!aiWindowOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <aside
      className="relative shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col w-full"
      style={width ? { width } : undefined}
      aria-label={tr({ zh: 'AI 助手', en: 'AI Assistant' })}
    >
      {/* 顶栏：与主题面板同构（mono 眉标 + 关闭按钮） */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 shrink-0">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0"
          aria-hidden="true"
        >
          {'< AI ASSISTANT />'}
        </p>
        <HoverTip text={tr({ zh: '关闭', en: 'Close' })}>
          <button
            onClick={close}
            className="ml-auto w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
            aria-label={tr({ zh: '关闭 AI 助手', en: 'Close AI assistant' })}
          >
            ✕
          </button>
        </HoverTip>
      </div>

      {/* 对话消息区：占满整个窗口，底部留出输入框悬浮的空间 */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 pb-32 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-2">
            <p className="text-[13px] text-gray-400 leading-relaxed">
              {tr({
                zh: '向 AI 描述你的需求，例如润色一段经历、分析职位关键词。',
                en: 'Tell the AI what you need — polish a bullet point or analyze job keywords.',
              })}
              <br />
              {tr({
                zh: '首次提问会自动附带当前简历内容作为参考。',
                en: 'Your first question automatically includes your current resume for reference.',
              })}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label.zh}
                  type="button"
                  onClick={() => { setInput(tr(q.text)); inputRef.current?.focus(); }}
                  className="px-2.5 py-1 rounded-full text-[12px] border border-gray-200 text-gray-500 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  {tr(q.label)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* 用户消息：Telegram 风格气泡（大圆角 + 收尾角收紧 + 泡内署名时间戳）；
                  AI 消息：无气泡 Markdown 渲染，仅保留 AI 标识与时间戳 */}
              <div
                className={`max-w-[82%] text-[13px] leading-relaxed break-words ${
                  m.role === 'user'
                    ? 'bg-primary-600 text-white px-3.5 py-2 rounded-2xl rounded-br-md shadow-sm whitespace-pre-wrap'
                    : 'text-gray-700 px-1'
                }`}
              >
                {m.role === 'assistant' && m.meta && <AIStatus meta={m.meta} />}
                {m.role === 'assistant' ? (
                  <AIMarkdown content={m.content || (isStreaming && i === messages.length - 1 ? '…' : '')} />
                ) : (
                  m.content
                )}
                {m.time && (
                  <span
                    className={`block font-mono text-[10px] leading-none mt-1 tabular-nums select-none ${
                      m.role === 'user' ? 'text-right text-white/60' : 'text-left text-gray-300'
                    }`}
                  >
                    {m.name && <span className="mr-1.5">{m.name}</span>}
                    {m.time}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 底部输入区：悬浮于对话区上方，白色渐变过渡避免遮挡内容 */}
      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-6 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
        <div className="pointer-events-auto flex flex-col bg-gray-50 border border-gray-200 rounded-2xl px-2.5 py-2 transition-all duration-150 hover:border-gray-300 focus-within:bg-white focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={tr({
              zh: '输入消息，Enter 发送，Shift+Enter 换行...',
              en: 'Type a message. Enter to send, Shift+Enter for a new line...',
            })}
            className="block w-full font-mono text-[13px] leading-relaxed px-1.5 py-1 bg-transparent outline-none resize-none placeholder:text-gray-400 max-h-[120px] overflow-y-auto"
          />
          <div className="flex justify-end mt-1">
            {isStreaming ? (
              <button
                onClick={stop}
                className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full bg-gray-200/70 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label={tr({ zh: '停止生成', en: 'Stop generating' })}
              >
                <StopIcon />
              </button>
            ) : (
              <button
                onClick={send}
                disabled={!input.trim()}
                className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full bg-gray-200/70 text-gray-500 hover:bg-primary-600 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={tr({ zh: '发送', en: 'Send' })}
              >
                <SendIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
