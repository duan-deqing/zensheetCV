import { memoryAiHistory, safeDB, type AiHistoryRecord } from './db';

/**
 * AI 对话历史存储（按简历维度，IndexedDB，隐私模式自动降级内存）。
 */

/** 读取某份简历的 AI 对话历史，不存在返回 undefined */
export async function getAiHistory(resumeId: string): Promise<AiHistoryRecord | undefined> {
  const db = await safeDB();
  if (!db) return memoryAiHistory.get(resumeId);
  return db.transaction('ai_history').store.get(resumeId);
}

/** 写入某份简历的 AI 对话历史（全量覆盖） */
export async function putAiHistory(record: AiHistoryRecord): Promise<void> {
  const db = await safeDB();
  if (!db) {
    memoryAiHistory.set(record.resume_id, record);
    return;
  }
  await db.transaction('ai_history', 'readwrite').store.put(record);
}
