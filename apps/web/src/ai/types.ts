/** AI 结构化改写（resume-edits 协议）共享类型。
 *  协议：助手回复末尾嵌入 ```resume-edits fenced 块，内容为
 *  [{ search: "逐字复制的原文片段", replace: "替换后片段", note: "说明" }] */
import type { Bi } from '@/i18n/LangContext';

/** 单条编辑建议（模型输出，未含状态） */
export interface ResumePatch {
  /** 必须逐字复制自当前简历且全文唯一；多命中/未命中视为定位失败 */
  search: string;
  /** 替换后的片段；允许空串（删除） */
  replace: string;
  /** 一句话改动说明，卡片标题 */
  note?: string;
}

export type PatchFailReason = 'not_found' | 'ambiguous' | 'invalid_json';
export type PatchStatus = 'pending' | 'applied' | 'rejected' | 'failed';

/** 带运行状态的编辑建议（进入 UI 后的形态） */
export interface PatchState extends ResumePatch {
  id: string;
  status: PatchStatus;
  /** status === 'failed' 时的失败原因 */
  failReason?: PatchFailReason;
}

/** 工作流 / Agent 步骤运行状态（写入消息 meta.steps，AIStatus 动态渲染） */
export type StepStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

export interface WorkflowStepState {
  label: Bi;
  status: StepStatus;
  /** 完成后的简短摘要（截断）或失败原因 */
  detail?: string;
  /** 步骤耗时（毫秒） */
  ms?: number;
}
