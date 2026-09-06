/** resume-edits 协议解析：从助手回复文本中提取并解析编辑建议块。
 *  纯字符串运算，可单测；不依赖 React 与网络。 */
import type { PatchState } from './types';

const BLOCK_RE_SOURCE = '```resume-edits\\s*\\n([\\s\\S]*?)```';

let patchSeq = 0;

function nextPatchId(): string {
  return `patch-${Date.now().toString(36)}-${patchSeq++}`;
}

/** 解析单个 fenced 块内容为 PatchState 列表；非法 JSON / 非法字段产出
 *  failReason: 'invalid_json' 的占位条目（UI 显示解析失败行） */
function parseBlock(raw: string): PatchState[] {
  const out: PatchState[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    return [{ id: nextPatchId(), search: '', replace: '', status: 'failed', failReason: 'invalid_json' }];
  }
  const items = Array.isArray(parsed) ? parsed : [parsed];
  for (const item of items) {
    const p = item as { search?: unknown; replace?: unknown; note?: unknown };
    if (
      typeof p?.search === 'string' && p.search.length > 0 &&
      typeof p?.replace === 'string'
    ) {
      out.push({
        id: nextPatchId(),
        search: p.search,
        replace: p.replace,
        note: typeof p.note === 'string' && p.note ? p.note : undefined,
        status: 'pending',
      });
    } else {
      out.push({ id: nextPatchId(), search: '', replace: '', status: 'failed', failReason: 'invalid_json' });
    }
  }
  return out;
}

/** 从助手回复中提取全部 resume-edits 块并解析（流结束后调用一次）。
 *  无块返回空数组。 */
export function parseResumeEdits(content: string): PatchState[] {
  if (!content) return [];
  const re = new RegExp(BLOCK_RE_SOURCE, 'g');
  const out: PatchState[] = [];
  for (const match of content.matchAll(re)) {
    out.push(...parseBlock(match[1]));
  }
  return out;
}

/** 渲染用：剔除回复中的 resume-edits 块（编辑建议已由卡片展示，正文不再重复）。
 *  streaming=true 时同时剔除末尾尚未闭合的半截块（流式期间防 JSON 闪现）。 */
export function stripEditBlocks(content: string, streaming = false): string {
  let text = content.replace(new RegExp(BLOCK_RE_SOURCE, 'g'), '');
  if (streaming) {
    text = text.replace(/```resume-edits\s*\n[\s\S]*$/, '');
  }
  // 块移除后可能残留连续空行，收敛为最多一个空行
  return text.replace(/\n{3,}/g, '\n\n').trim();
}
