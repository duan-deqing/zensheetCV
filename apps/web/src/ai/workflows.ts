/** 本地工作流状态机（方案 C）：串行多步流水线，每步一次请求或一段本地纯逻辑。
 *  步数固定、无自由循环，成本可预期；请求函数注入，可单测。
 *  最终步输出含 resume-edits 块，与方案 A 同一管线解析成确认卡片。 */
import type { Bi, Lang } from '@/i18n/LangContext';
import {
  jdKeywordsSystem,
  jdRewriteSystem,
  polishAnalystSystem,
  polishDraftSystem,
  polishReviseSystem,
} from './prompts';
import { parseResumeEdits } from './patchParser';
import { applyPatches } from './patchApply';
import type { WorkflowStepState } from './types';

/** 请求步输入：system + user 一次性对话（非流式聚合由 io.request 实现方负责） */
export interface WorkflowRequest {
  system: string;
  user: string;
  signal: AbortSignal;
}

/** 运行期 IO（注入）：request 生产实现可替换为测试桩 */
export interface WorkflowIO {
  request: (req: WorkflowRequest) => AsyncGenerator<string>;
  /** 步状态实时回调（写入消息 meta.steps） */
  onStep: (index: number, patch: Partial<WorkflowStepState>) => void;
  /** 正文流式回调：仅最终内容步应把增量写进气泡（由调用方过滤步下标） */
  onStreamText?: (delta: string, stepIndex: number) => void;
  signal: AbortSignal;
}

export interface WorkflowState {
  markdown: string;
  /** JD 对齐工作流的职位描述原文 */
  jd: string;
  lang: Lang;
  /** 各步输出（跳过步占位空串，保持下标稳定） */
  intermediate: string[];
}

export interface WorkflowStepDef {
  label: Bi;
  kind: 'request' | 'local';
  system?: (s: WorkflowState) => string;
  user?: (s: WorkflowState) => string;
  local?: (s: WorkflowState, io: WorkflowIO) => string | Promise<string>;
  /** 满足条件时跳过该步（占位空串，保持步下标稳定） */
  skip?: (s: WorkflowState) => boolean;
}

export interface WorkflowResult {
  outputs: string[];
  aborted: boolean;
  failed: boolean;
  error?: string;
}

export function runWorkflow(
  defs: WorkflowStepDef[],
  io: WorkflowIO,
  state: Pick<WorkflowState, 'markdown' | 'jd' | 'lang'>,
): Promise<WorkflowResult> {
  const ctx: WorkflowState = { ...state, intermediate: [] };
  return (async () => {
    for (let i = 0; i < defs.length; i++) {
      const def = defs[i];
      if (def.skip?.(ctx)) {
        ctx.intermediate.push('');
        io.onStep(i, { status: 'skipped' });
        continue;
      }
      io.onStep(i, { status: 'running' });
      const start = Date.now();
      try {
        let output: string;
        if (def.kind === 'local') {
          output = await def.local!(ctx, io);
        } else {
          let acc = '';
          for await (const delta of io.request({
            system: def.system!(ctx),
            user: def.user!(ctx),
            signal: io.signal,
          })) {
            acc += delta;
            io.onStreamText?.(delta, i);
          }
          output = acc;
        }
        ctx.intermediate.push(output);
        io.onStep(i, {
          status: 'done',
          ms: Date.now() - start,
          detail: output.replace(/\s+/g, ' ').trim().slice(0, 80),
        });
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === 'AbortError') {
          ctx.intermediate.push('');
          io.onStep(i, { status: 'skipped' });
          return { outputs: ctx.intermediate, aborted: true, failed: false };
        }
        const msg = (err as Error)?.message || String(err);
        ctx.intermediate.push('');
        io.onStep(i, { status: 'failed', ms: Date.now() - start, detail: msg.slice(0, 80) });
        return { outputs: ctx.intermediate, aborted: false, failed: true, error: msg };
      }
    }
    return { outputs: ctx.intermediate, aborted: false, failed: false };
  })();
}

/* ------------------------------------------------------------------ */
/* 本地纯逻辑：关键词覆盖计算                                          */
/* ------------------------------------------------------------------ */

export interface KeywordCoverage {
  keyword: string;
  found: boolean;
}

/** 关键词在简历中的覆盖计算：拉丁词不区分大小写，其余（中日韩）原样匹配 */
export function keywordCoverage(markdown: string, keywords: string[]): KeywordCoverage[] {
  const lower = markdown.toLowerCase();
  return keywords
    .map((k) => k.trim())
    .filter(Boolean)
    .map((keyword) => ({
      keyword,
      found: /^[a-z0-9]+$/i.test(keyword)
        ? lower.includes(keyword.toLowerCase())
        : markdown.includes(keyword),
    }));
}

/** 把关键词列表文本（每行一个，容忍 - / * / 数字编号前缀）解析为数组 */
export function parseKeywordList(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.、)])\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 12);
}

/** 双语覆盖表（写入修订步 user prompt） */
function coverageTable(coverage: KeywordCoverage[], lang: Lang): string {
  const hit = lang === 'en' ? 'covered' : '已覆盖';
  const miss = lang === 'en' ? 'missing' : '未覆盖';
  return coverage.map((c) => `- ${c.keyword}: ${c.found ? hit : miss}`).join('\n');
}

/* ------------------------------------------------------------------ */
/* 两条内置工作流                                                      */
/* ------------------------------------------------------------------ */

/** 简历正文段落（user prompt 里的简历载体） */
function resumeBlock(s: WorkflowState): string {
  return s.lang === 'en' ? `[RESUME MARKDOWN]\n${s.markdown}` : `【简历 Markdown】\n${s.markdown}`;
}

/** 全文润色：① 诊断 → ② 起草建议 → ③ 本地自查定位 → ④ 修订失败条目（无失败则跳过） */
export function buildPolishWorkflow(lang: Lang): WorkflowStepDef[] {
  return [
    {
      label: { zh: '诊断表述问题', en: 'Analyze wording' },
      kind: 'request',
      system: () => polishAnalystSystem(lang),
      user: (s) => resumeBlock(s),
    },
    {
      label: { zh: '起草修改建议', en: 'Draft suggestions' },
      kind: 'request',
      system: () => polishDraftSystem(lang),
      user: (s) =>
        s.lang === 'en'
          ? `${resumeBlock(s)}\n\n[ISSUE LIST]\n${s.intermediate[0]}`
          : `${resumeBlock(s)}\n\n【问题清单】\n${s.intermediate[0]}`,
    },
    {
      label: { zh: '本地自查定位', en: 'Verify anchors' },
      kind: 'local',
      local: (s) => {
        const patches = parseResumeEdits(s.intermediate[1]);
        if (patches.length === 0) {
          return lang === 'en' ? 'No edit block found in draft.' : '草稿中未找到建议块。';
        }
        const { results, okCount } = applyPatches(s.markdown, patches);
        const failed = results
          .map((r, i) => ({ r, p: patches[i] }))
          .filter(({ r }) => !r.ok);
        if (failed.length === 0) {
          return lang === 'en'
            ? `All ${okCount} suggestions located successfully.`
            : `全部 ${okCount} 条建议定位成功，无需修订。`;
        }
        return (
          (lang === 'en' ? 'FAILED SUGGESTIONS:\n' : '定位失败的建议：\n') +
          failed
            .map(({ r, p }) => `- reason: ${r.reason} | search: ${JSON.stringify(p.search.slice(0, 60))}`)
            .join('\n')
        );
      },
    },
    {
      label: { zh: '修订失败条目', en: 'Fix failed items' },
      kind: 'request',
      // 自查报告无「reason」行（全部定位成功 / 未找到建议块）时跳过修订
      skip: (s) => !s.intermediate[2].includes('reason'),
      system: () => polishReviseSystem(lang),
      user: (s) =>
        s.lang === 'en'
          ? `[ORIGINAL DRAFT]\n${s.intermediate[1]}\n\n[VERIFICATION REPORT]\n${s.intermediate[2]}\n\n${resumeBlock(s)}`
          : `【原草稿】\n${s.intermediate[1]}\n\n【自查报告】\n${s.intermediate[2]}\n\n${resumeBlock(s)}`,
    },
  ];
}

/** JD 对齐：① 提取关键词 → ② 本地覆盖率计算 → ③ 缺口改写建议 */
export function buildJdWorkflow(lang: Lang): WorkflowStepDef[] {
  return [
    {
      label: { zh: '提取 JD 关键词', en: 'Extract keywords' },
      kind: 'request',
      system: () => jdKeywordsSystem(lang),
      user: (s) => (lang === 'en' ? `[JOB DESCRIPTION]\n${s.jd}` : `【职位描述】\n${s.jd}`),
    },
    {
      label: { zh: '计算关键词覆盖', en: 'Compute coverage' },
      kind: 'local',
      local: (s) => {
        const keywords = parseKeywordList(s.intermediate[0]);
        const coverage = keywordCoverage(s.markdown, keywords);
        const covered = coverage.filter((c) => c.found).length;
        return (
          (lang === 'en'
            ? `Coverage: ${covered}/${coverage.length}\n`
            : `覆盖：${covered}/${coverage.length}\n`) + coverageTable(coverage, lang)
        );
      },
    },
    {
      label: { zh: '生成对齐建议', en: 'Alignment suggestions' },
      kind: 'request',
      system: () => jdRewriteSystem(lang),
      user: (s) =>
        s.lang === 'en'
          ? `${resumeBlock(s)}\n\n[COVERAGE]\n${s.intermediate[1]}`
          : `${resumeBlock(s)}\n\n【覆盖表】\n${s.intermediate[1]}`,
    },
  ];
}
