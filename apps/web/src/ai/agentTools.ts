/** Agent 工具集（方案 B）：schema + 执行器。
 *  核心安全设计：模型不直接改文档 —— propose_edit 只做定位校验并入队，
 *  实际修改由用户在 diff 卡片上逐条确认（复用方案 A 管线）。 */
import type { ToolSchema } from '@/api/chatClient';

/** 执行器所需的宿主上下文（React 层注入快照 getter，避免工具层依赖 Context） */
export interface AgentToolContext {
  getMarkdown: () => string;
  getPageCount: () => number | null;
  getTemplateInfo: () => {
    id: string;
    name: string;
    primaryColor: string;
    fontSize: number;
    lineHeight: number;
  } | null;
  /** propose_edit 定位成功后入队（AIWindow 挂到当前消息的卡片列表） */
  onPatch: (patch: { search: string; replace: string; note?: string }) => void;
}

export interface ToolResult {
  ok: boolean;
  /** 回传给模型的 JSON 字符串 */
  content: string;
}

/** 与简历相关的只读/提议工具（描述面向模型，英文最稳） */
export const AGENT_TOOL_SCHEMAS: ToolSchema[] = [
  {
    type: 'function',
    function: {
      name: 'read_resume',
      description: 'Read the full resume Markdown content.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_section',
      description: 'Read one section of the resume by its heading title (e.g. "工作经历", "Projects").',
      parameters: {
        type: 'object',
        properties: {
          heading: { type: 'string', description: 'The heading title to locate (without # marks).' },
        },
        required: ['heading'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'propose_edit',
      description:
        'Propose one modification to the resume. The user will review it on a diff card and apply it manually. '
        + '"search" MUST be copied verbatim from the resume Markdown and appear exactly once; '
        + '"replace" is the replacement fragment (empty string = deletion); "note" is a one-line reason.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Verbatim unique fragment from the resume.' },
          replace: { type: 'string', description: 'Replacement fragment. Empty string deletes.' },
          note: { type: 'string', description: 'One-line explanation of the change.' },
        },
        required: ['search', 'replace'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_page_count',
      description: 'Get the current rendered page count of the resume preview (A4 pages).',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_template_info',
      description: 'Get the current resume template info: id, name, primary color, base font size and line height.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
];

/** 统计 needle 在 haystack 中出现次数 */
function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let pos = haystack.indexOf(needle);
  while (pos !== -1) {
    count += 1;
    pos = haystack.indexOf(needle, pos + needle.length);
  }
  return count;
}

/** 按标题读取小节：匹配任意级别标题文本（忽略大小写），收集到同级或更高级标题为止 */
export function readSection(markdown: string, heading: string): string | null {
  const lines = markdown.split('\n');
  const target = heading.trim().toLowerCase();
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.*)$/);
    if (m && m[2].trim().toLowerCase().includes(target)) {
      start = i;
      level = m[1].length;
      break;
    }
  }
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+/);
    if (m && m[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n').trim();
}

/** 解析工具参数（空串按 {} 处理） */
function parseArgs(argsJson: string): Record<string, unknown> {
  if (!argsJson.trim()) return {};
  try {
    return JSON.parse(argsJson) as Record<string, unknown>;
  } catch {
    return { __invalid: argsJson };
  }
}

const json = (v: unknown) => JSON.stringify(v);

/** 执行一次工具调用。未知工具 / 参数非法返回 ok:false（模型可自行纠正重试）。 */
export function executeTool(name: string, argsJson: string, ctx: AgentToolContext): ToolResult {
  const args = parseArgs(argsJson);
  switch (name) {
    case 'read_resume':
      return { ok: true, content: json({ markdown: ctx.getMarkdown() }) };

    case 'read_section': {
      const heading = typeof args.heading === 'string' ? args.heading : '';
      if (!heading) return { ok: false, content: json({ error: 'missing "heading" argument' }) };
      const content = readSection(ctx.getMarkdown(), heading);
      return content === null
        ? { ok: false, content: json({ found: false, heading }) }
        : { ok: true, content: json({ found: true, heading, content }) };
    }

    case 'propose_edit': {
      const search = typeof args.search === 'string' ? args.search : '';
      const replace = typeof args.replace === 'string' ? args.replace : '';
      const note = typeof args.note === 'string' && args.note ? args.note : undefined;
      if (!search) return { ok: false, content: json({ error: 'missing "search" argument' }) };
      // 提交前先做定位校验，模型可据此自行修正（循环内的即时反馈）
      const count = countOccurrences(ctx.getMarkdown(), search);
      if (count === 0) {
        return { ok: false, content: json({ error: 'not_found', hint: 'search must be copied verbatim from the resume' }) };
      }
      if (count > 1) {
        return { ok: false, content: json({ error: 'ambiguous', occurrences: count, hint: 'widen the search fragment to make it unique' }) };
      }
      ctx.onPatch({ search, replace, note });
      return { ok: true, content: json({ queued: true, message: 'Proposal queued; the user will confirm it on a diff card.' }) };
    }

    case 'get_page_count': {
      const pages = ctx.getPageCount();
      return pages === null
        ? { ok: true, content: json({ pages: null, hint: 'preview not rendered yet' }) }
        : { ok: true, content: json({ pages }) };
    }

    case 'get_template_info': {
      const info = ctx.getTemplateInfo();
      return info
        ? { ok: true, content: json(info) }
        : { ok: true, content: json({ available: false }) };
    }

    default:
      return { ok: false, content: json({ error: `unknown tool: ${name}` }) };
  }
}
