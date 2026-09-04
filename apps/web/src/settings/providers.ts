/** AI 供应商预设：全部兼容 OpenAI Chat Completions 协议（/chat/completions）。
 *  模型名称不预置，通过 GET {baseUrl}/models 实时获取 */
import type { Bi } from '@/i18n/LangContext';

export interface AIProviderPreset {
  id: 'openai' | 'deepseek' | 'glm' | 'longcat' | 'custom';
  label: Bi;
  /** OpenAI 兼容端点；custom 由用户填写 */
  baseUrl: string;
}

export const AI_PROVIDERS: AIProviderPreset[] = [
  {
    id: 'openai',
    label: { zh: 'OpenAI', en: 'OpenAI' },
    baseUrl: 'https://api.openai.com/v1',
  },
  {
    id: 'deepseek',
    label: { zh: 'DeepSeek', en: 'DeepSeek' },
    baseUrl: 'https://api.deepseek.com/v1',
  },
  {
    id: 'glm',
    label: { zh: '智谱 GLM', en: 'Zhipu GLM' },
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  },
  {
    id: 'longcat',
    label: { zh: 'LongCat', en: 'LongCat' },
    // 官方对话端点为 /openai/v1/chat/completions，OpenAI SDK 会在 baseUrl 后拼接 /chat/completions
    baseUrl: 'https://api.longcat.chat/openai/v1',
  },
  {
    id: 'custom',
    label: { zh: '自定义', en: 'Custom' },
    baseUrl: '',
  },
];
