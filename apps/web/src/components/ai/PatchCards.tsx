import { useState } from 'react';
import { applyPatches } from '@/ai/patchApply';
import type { PatchState } from '@/ai/types';
import { useTr, type Bi } from '@/i18n/LangContext';

/** diff 展示阈值：超过该字符数默认折叠，可展开 */
const COLLAPSE_CHARS = 160;

const STATUS_BADGE: Record<PatchState['status'], { label: Bi; cls: string }> = {
  pending: { label: { zh: '待确认', en: 'Pending' }, cls: 'bg-gray-100 text-gray-500' },
  applied: { label: { zh: '已应用', en: 'Applied' }, cls: 'bg-emerald-50 text-emerald-600' },
  rejected: { label: { zh: '已忽略', en: 'Skipped' }, cls: 'bg-gray-50 text-gray-400' },
  failed: { label: { zh: '应用失败', en: 'Failed' }, cls: 'bg-red-50 text-red-500' },
};

function failReasonText(reason: string | undefined, tr: (b: Bi) => string): string {
  if (reason === 'not_found') return tr({ zh: '未在简历中找到该原文片段', en: 'Fragment not found in resume' });
  if (reason === 'ambiguous') return tr({ zh: '该片段在简历中出现多次，无法定位', en: 'Fragment appears multiple times' });
  if (reason === 'invalid_json') return tr({ zh: '建议块解析失败（格式不符合协议）', en: 'Malformed edit block' });
  return '';
}

/** 单条 diff 视图：search（红）与 replace（绿）上下两栏，超长折叠 */
function DiffBlock({ label, text, tone }: { label: Bi; text: string; tone: 'del' | 'ins' }) {
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const long = text.length > COLLAPSE_CHARS;
  const cls = tone === 'del'
    ? 'bg-red-50/70 border-red-100 text-red-900/80'
    : 'bg-emerald-50/70 border-emerald-100 text-emerald-900/80';
  return (
    <div className={`rounded-md border px-2 py-1.5 ${cls}`}>
      <p className="font-mono text-[10px] uppercase tracking-wider opacity-60 mb-0.5">{tr(label)}</p>
      <pre
        className={`whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed ${long && !open ? 'max-h-20 overflow-hidden' : ''}`}
      >
        {text || tr({ zh: '（删除）', en: '(deleted)' })}
      </pre>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-0.5 font-mono text-[10px] opacity-60 hover:opacity-100 transition-opacity"
        >
          {open ? tr({ zh: '收起', en: 'Collapse' }) : tr({ zh: '展开全部', en: 'Expand' })}
        </button>
      )}
    </div>
  );
}

/**
 * 编辑建议确认卡片列表：渲染某条 AI 消息携带的 resume-edits 建议。
 * 应用 = 在当前简历 Markdown 上定位替换（纯函数），结果统一上抛由父组件写回编辑器。
 * 失败条目可重试（用户可能已手工修出可匹配的原文），「撤销本轮」由父组件提供快照。
 */
export function PatchCards({
  patches,
  getMarkdown,
  onCommit,
  onStatuses,
  canUndo,
  onUndo,
}: {
  patches: PatchState[];
  getMarkdown: () => string;
  /** 应用成功：上抛新 markdown 与全部卡片状态（父组件写回编辑器并记录撤销快照） */
  onCommit: (nextMarkdown: string, updated: PatchState[], appliedCount: number) => void;
  /** 仅状态变化（忽略 / 失败标记）：上抛全部卡片状态 */
  onStatuses: (updated: PatchState[]) => void;
  canUndo?: boolean;
  onUndo?: () => void;
}) {
  const tr = useTr();
  const patch = (id: string, changes: Partial<PatchState>): PatchState[] =>
    patches.map((p) => (p.id === id ? { ...p, ...changes } : p));

  /** 尝试应用目标条目（单条或全部待确认） */
  const applyIds = (ids: string[]) => {
    const targets = patches.filter((p) => ids.includes(p.id) && p.status !== 'applied' && p.search);
    if (targets.length === 0) return;
    const { results, markdown, okCount } = applyPatches(getMarkdown(), targets);
    const resultMap = new Map(targets.map((t, i) => [t.id, results[i]]));
    const updated = patches.map((p) => {
      const r = resultMap.get(p.id);
      if (!r) return p;
      return r.ok
        ? { ...p, status: 'applied' as const, failReason: undefined }
        : { ...p, status: 'failed' as const, failReason: r.reason };
    });
    if (okCount > 0) onCommit(markdown, updated, okCount);
    else onStatuses(updated);
  };

  const pendingCount = patches.filter((p) => p.status === 'pending' && p.search).length;

  return (
    <div className="mt-1.5 flex flex-col gap-1.5" data-testid="patch-cards">
      {patches.map((p, i) => {
        const invalid = p.failReason === 'invalid_json' && !p.search;
        const badge = STATUS_BADGE[p.status];
        return invalid ? (
          <div key={p.id} className="rounded-lg border border-red-100 bg-red-50/50 px-2.5 py-1.5 text-[11px] text-red-500 flex items-center gap-1.5">
            <span className="font-mono text-red-300 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            {failReasonText(p.failReason, tr)}
          </div>
        ) : (
          <div key={p.id} className="rounded-lg border border-gray-200/80 bg-gray-50/50 px-2.5 py-2 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[10px] text-gray-300 tabular-nums shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[11px] text-gray-600 truncate flex-1" title={p.note}>{p.note || tr({ zh: '修改建议', en: 'Suggested edit' })}</span>
              <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${badge.cls}`}>{tr(badge.label)}</span>
            </div>
            {p.status !== 'rejected' && (
              <>
                <DiffBlock label={{ zh: '原文', en: 'Before' }} text={p.search} tone="del" />
                <DiffBlock label={{ zh: '改为', en: 'After' }} text={p.replace} tone="ins" />
              </>
            )}
            {p.status === 'failed' && (
              <p className="text-[11px] text-red-400 leading-snug">{failReasonText(p.failReason, tr)}</p>
            )}
            <div className="flex justify-end gap-1.5">
              {(p.status === 'pending' || p.status === 'rejected') && (
                <button
                  type="button"
                  onClick={() => onStatuses(patch(p.id, { status: 'rejected', failReason: undefined }))}
                  className="px-2 py-0.5 rounded-md text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {tr({ zh: '忽略', en: 'Skip' })}
                </button>
              )}
              {p.status === 'rejected' && (
                <button
                  type="button"
                  onClick={() => onStatuses(patch(p.id, { status: 'pending' }))}
                  className="px-2 py-0.5 rounded-md text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {tr({ zh: '恢复', en: 'Restore' })}
                </button>
              )}
              {(p.status === 'pending' || p.status === 'failed') && (
                <button
                  type="button"
                  onClick={() => applyIds([p.id])}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  {p.status === 'failed' ? tr({ zh: '重试', en: 'Retry' }) : tr({ zh: '应用', en: 'Apply' })}
                </button>
              )}
            </div>
          </div>
        );
      })}
      {(pendingCount > 0 || (canUndo && onUndo)) && (
        <div className="flex justify-end gap-1.5 pt-0.5">
          {canUndo && onUndo && (
            <button
              type="button"
              onClick={onUndo}
              className="px-2.5 py-1 rounded-full text-[11px] border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
              {tr({ zh: '撤销本轮', en: 'Undo batch' })}
            </button>
          )}
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={() => applyIds(patches.filter((p) => p.status === 'pending').map((p) => p.id))}
              className="px-2.5 py-1 rounded-full text-[11px] bg-gray-900 text-white hover:bg-gray-700 transition-colors"
            >
              {tr({ zh: `全部应用（${pendingCount}）`, en: `Apply all (${pendingCount})` })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
