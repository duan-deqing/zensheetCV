import { AI_PROVIDERS } from './providers';
import { getLang } from '@/i18n/LangContext';

/** AI 设置：自带 Key（BYOK），全部保存在本地浏览器，仅用于当前设备。
 *  各供应商的 API KEY 独立存储（apiKeys 以供应商 id 为键） */
export interface AISettings {
  provider: string; // AI_PROVIDERS 中的 id，或 'custom'
  apiKeys: Record<string, string>; // providerId -> apiKey
  baseUrl: string; // custom 供应商的 OpenAI 兼容端点
  model: string;
}

const STORAGE_KEY = 'stylan.ai.settings';

function presetOf(id: string) {
  return AI_PROVIDERS.find((p) => p.id === id);
}

const DEFAULTS: AISettings = {
  provider: 'openai',
  apiKeys: {},
  baseUrl: presetOf('openai')!.baseUrl,
  model: '',
};

/** 读取设置；非法数据回退默认值，旧版单 apiKey 自动迁移到对应供应商名下 */
export function loadAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<AISettings>;
    const provider = presetOf(parsed.provider ?? '') ? (parsed.provider as string) : DEFAULTS.provider;
    const preset = presetOf(provider)!;
    // apiKeys：仅接受非空字符串值
    const apiKeys: Record<string, string> = {};
    const rawKeys =
      typeof parsed.apiKeys === 'object' && parsed.apiKeys !== null ? parsed.apiKeys : {};
    for (const [k, v] of Object.entries(rawKeys)) {
      if (typeof v === 'string' && v) apiKeys[k] = v;
    }
    // 旧版数据迁移：单 apiKey 归入其供应商
    const legacyKey =
      typeof (parsed as { apiKey?: unknown }).apiKey === 'string'
        ? ((parsed as { apiKey: string }).apiKey)
        : '';
    if (legacyKey && !apiKeys[provider]) apiKeys[provider] = legacyKey;
    return {
      provider,
      apiKeys,
      // 预设供应商端点固定，仅 custom 使用存储的 baseUrl
      baseUrl: provider === 'custom' ? parsed.baseUrl || '' : preset.baseUrl,
      model: typeof parsed.model === 'string' ? parsed.model : '',
    };
  } catch {
    return { ...DEFAULTS };
  }
}

/** 保存设置到 localStorage */
export function saveAISettings(settings: AISettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/** 解析为实际请求参数：预设供应商端点固定，custom 需用户填写 baseUrl；
 *  API KEY 取当前供应商名下，模型名称必须来自用户配置（通常通过 GET /models 获取） */
export function resolveAISettings(settings: AISettings): {
  apiKey: string;
  baseUrl: string;
  model: string;
} | null {
  const apiKey = settings.apiKeys[settings.provider] ?? '';
  if (!apiKey || !settings.model) return null;
  if (settings.provider === 'custom') {
    if (!settings.baseUrl) return null;
    return { apiKey, baseUrl: settings.baseUrl, model: settings.model };
  }
  const preset = presetOf(settings.provider);
  if (!preset) return null;
  return { apiKey, baseUrl: preset.baseUrl, model: settings.model };
}

/** 浏览器直连供应商 GET /models（OpenAI 兼容协议）。
 *  供应商未开放 CORS 时会抛出网络错误，此时可手动输入模型名称 */

export async function fetchProviderModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const url = `${baseUrl.replace(/\/+$/, '')}/models`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch {
    // 网络层失败：断网/被网络环境拦截，或供应商不开放浏览器跨域（CORS，如实测 LongCat 未返回 CORS 头）
    throw new Error(getLang() === 'en'
      ? 'Cannot reach the provider endpoint — check your network; the provider must also allow browser CORS. Enter the model name manually'
      : '无法连接到供应商接口：请检查网络，且供应商需支持浏览器跨域（CORS）。可手动输入模型名称');
  }
  if (!res.ok) {
    throw new Error(getLang() === 'en'
      ? `Request failed (HTTP ${res.status})`
      : `请求失败 (HTTP ${res.status})`);
  }
  const data = await res.json();
  // OpenAI 协议返回 { data: [{ id }] }，兼容直接返回字符串数组或对象数组
  const raw: unknown[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return raw
    .map((m) => (typeof m === 'string' ? m : (m as { id?: unknown })?.id))
    .filter((m): m is string => typeof m === 'string' && m.length > 0);
}
