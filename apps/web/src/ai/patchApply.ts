/** resume-edits 应用：在当前 Markdown 上定位并替换。
 *  纯字符串运算，可单测。 */
import type { PatchFailReason, ResumePatch } from './types';

export interface PatchApplyResult {
  ok: boolean;
  reason?: Extract<PatchFailReason, 'not_found' | 'ambiguous'>;
  newMarkdown?: string;
}

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

/** 应用单条：search 必须恰好命中一次 */
export function applyPatch(markdown: string, patch: ResumePatch): PatchApplyResult {
  const count = countOccurrences(markdown, patch.search);
  if (count === 0) return { ok: false, reason: 'not_found' };
  if (count > 1) return { ok: false, reason: 'ambiguous' };
  return { ok: true, newMarkdown: markdown.replace(patch.search, patch.replace) };
}

export interface PatchesApplyResult {
  results: PatchApplyResult[];
  /** 全部成功条目应用后的 markdown（失败条目不影响结果） */
  markdown: string;
  okCount: number;
}

/** 顺序应用多条：单条失败不中断后续，失败条目保持原文不动 */
export function applyPatches(markdown: string, patches: ResumePatch[]): PatchesApplyResult {
  let current = markdown;
  const results: PatchApplyResult[] = [];
  for (const patch of patches) {
    const r = applyPatch(current, patch);
    results.push(r);
    if (r.ok) current = r.newMarkdown!;
  }
  return { results, markdown: current, okCount: results.filter((r) => r.ok).length };
}
