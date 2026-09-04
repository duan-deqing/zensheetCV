import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Resume } from '@stylan/shared-types';

/** AI 对话历史记录（按简历维度存储） */
export interface AiHistoryRecord {
  resume_id: string;
  messages: unknown[];
  updated_at: string;
}

/** IndexedDB 库结构：简历表 + AI 历史表 */
interface StylanDB extends DBSchema {
  resumes: {
    key: string;
    value: Resume;
    indexes: { by_updated: string };
  };
  ai_history: {
    key: string;
    value: AiHistoryRecord;
  };
}

const DB_NAME = 'stylan';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<StylanDB>> | null = null;
let degraded = false;

/** 存储降级（隐私模式 / IndexedDB 被禁用）时的内存兜底 */
const memoryResumes = new Map<string, Resume>();
const memoryAiHistory = new Map<string, AiHistoryRecord>();

type DegradedListener = (reason: unknown) => void;
const degradedListeners = new Set<DegradedListener>();

/** 订阅存储降级事件（用于 UI 一次性提示「数据仅保存在本次会话」） */
export function onStorageDegraded(listener: DegradedListener): () => void {
  degradedListeners.add(listener);
  return () => degradedListeners.delete(listener);
}

function enterDegraded(reason: unknown) {
  if (degraded) return;
  degraded = true;
  // eslint-disable-next-line no-console
  console.warn('[stylan] IndexedDB 不可用，数据仅保存在本次会话', reason);
  degradedListeners.forEach((listener) => listener(reason));
}

/** 惰性打开数据库；失败时进入内存降级模式 */
function getDB(): Promise<IDBPDatabase<StylanDB>> {
  if (!dbPromise) {
    dbPromise = openDB<StylanDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('resumes')) {
          const store = db.createObjectStore('resumes', { keyPath: 'id' });
          store.createIndex('by_updated', 'updated_at');
        }
        if (!db.objectStoreNames.contains('ai_history')) {
          db.createObjectStore('ai_history', { keyPath: 'resume_id' });
        }
      },
    }).catch((err) => {
      enterDegraded(err);
      throw err;
    });
  }
  return dbPromise;
}

/** 是否处于内存降级模式（IndexedDB 不可用） */
export const isStorageDegraded = () => degraded;

export { memoryResumes, memoryAiHistory };

/** 安全获取数据库实例；降级模式下返回 null（调用方走内存兜底） */
export async function safeDB(): Promise<IDBPDatabase<StylanDB> | null> {
  try {
    return await getDB();
  } catch {
    return null;
  }
}

/** 生成简历 id：优先 crypto.randomUUID（https/localhost），否则时间戳兜底 */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
