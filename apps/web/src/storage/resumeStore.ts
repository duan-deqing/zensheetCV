import type { Resume } from '@stylan/shared-types';
import { memoryResumes, newId, safeDB } from './db';

/**
 * 简历存储（IndexedDB，隐私模式自动降级内存）。
 * 所有写入均为全量 put，读取按 updated_at 倒序。
 */

/** 简历列表：按更新时间倒序（与云端版列表排序一致） */
export async function listResumes(): Promise<Resume[]> {
  const db = await safeDB();
  if (!db) {
    return [...memoryResumes.values()].sort((a, b) =>
      b.updated_at.localeCompare(a.updated_at),
    );
  }
  const index = db.transaction('resumes').store.index('by_updated');
  const all: Resume[] = [];
  let cursor = await index.openCursor(null, 'prev');
  while (cursor) {
    all.push(cursor.value);
    cursor = await cursor.continue();
  }
  return all;
}

/** 读取单份简历，不存在返回 undefined */
export async function getResume(id: string): Promise<Resume | undefined> {
  const db = await safeDB();
  if (!db) return memoryResumes.get(id);
  return db.transaction('resumes').store.get(id);
}

/** 写入（新增或整体覆盖）一份简历 */
export async function putResume(resume: Resume): Promise<void> {
  const db = await safeDB();
  if (!db) {
    memoryResumes.set(resume.id, resume);
    return;
  }
  await db.transaction('resumes', 'readwrite').store.put(resume);
}

/** 单事务读-改-写：合并字段并刷新 updated_at（防并发标签页写坏整条记录） */
export async function updateResumeRecord(
  id: string,
  patch: Partial<Pick<Resume, 'title' | 'markdown' | 'template_id' | 'theme_config'>>,
): Promise<Resume | undefined> {
  const db = await safeDB();
  if (!db) {
    const current = memoryResumes.get(id);
    if (!current) return undefined;
    const merged: Resume = { ...current, ...patch, updated_at: new Date().toISOString() };
    memoryResumes.set(id, merged);
    return merged;
  }
  const tx = db.transaction('resumes', 'readwrite');
  const current = await tx.store.get(id);
  if (!current) {
    await tx.done;
    return undefined;
  }
  const merged: Resume = { ...current, ...patch, updated_at: new Date().toISOString() };
  await tx.store.put(merged);
  await tx.done;
  return merged;
}

/** 删除一份简历 */
export async function removeResume(id: string): Promise<void> {
  const db = await safeDB();
  if (!db) {
    memoryResumes.delete(id);
    return;
  }
  await db.transaction('resumes', 'readwrite').store.delete(id);
}

export { newId as newResumeId };
