/** AI 供应商预设：全部兼容 OpenAI Chat Completions 协议（/chat/completions）。
 *  模型名称不预置，通过 GET {baseUrl}/models 实时获取 */
export interface AIProviderPreset {
  id: 'openai' | 'deepseek' | 'glm' | 'longcat' | 'custom';
  label: string;
  /** OpenAI 兼容端点；custom 由用户填写 */
  baseUrl: string;
}

export const AI_PROVIDERS: AIProviderPreset[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
  },
  {
    id: 'glm',
    label: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  },
  {
    id: 'longcat',
    label: 'LongCat',
    baseUrl: 'https://api.longcat.chat/openai',
  },
  {
    id: 'custom',
    label: '自定义',
    baseUrl: '',
  },
];
