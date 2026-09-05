import { DocBlock, DocSectionHeader, DocsLayout } from '../DocsLayout';
import { useTr, type Bi } from '@/i18n/LangContext';

/* ============ 05 AI 助手 ============ */

const AI_PROVIDERS: { name: string; url: string; key: Bi }[] = [
  { name: 'OpenAI', url: 'https://platform.openai.com', key: { zh: 'API Keys 页面创建 Secret Key', en: 'Create a Secret Key on the API Keys page' } },
  { name: 'DeepSeek', url: 'https://platform.deepseek.com', key: { zh: 'API Keys 页面创建', en: 'Create on the API Keys page' } },
  { name: 'GLM（智谱）', url: 'https://open.bigmodel.cn', key: { zh: '开放平台 → API Keys', en: 'Open Platform → API Keys' } },
  { name: 'Qwen（通义千问）', url: 'https://qwen.ai/home', key: { zh: '官网 → API Key 控制台创建', en: 'Website → API Key console' } },
  { name: 'LongCat', url: 'https://longcat.chat', key: { zh: '官网 → 开放平台获取并注意模型名', en: 'Website → Open Platform (mind the model name)' } },
  { name: 'Xiaomi MiMo', url: 'https://mimo.mi.com/', key: { zh: '开放平台 → API Keys 创建', en: 'Open Platform → API Keys' } },
];

/** AI 助手正文（文档页与编辑器抽屉共用） */
export function AIDocContent() {
  const tr = useTr();
  return (
    <>
      <DocBlock title={tr({ zh: '三种能力', en: 'Three Capabilities' })} desc={tr({ zh: '窗口空状态提供快捷指令，也可自由提问：', en: 'The empty state offers quick prompts — or ask freely:' })}>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { t: { zh: '润色全文', en: 'Polish All' }, d: { zh: '优化表达与排版结构，让内容更专业、更有说服力', en: 'Refines wording and structure to make your content more professional and persuasive' } },
            { t: { zh: '关键词分析', en: 'Keyword Analysis' }, d: { zh: '对照目标岗位提炼简历关键词覆盖情况与改进建议', en: 'Checks keyword coverage against a target role and suggests improvements' } },
            { t: { zh: '要点成段', en: 'Expand Bullets' }, d: { zh: '把零散的经历要点扩写为完整、有细节的段落', en: 'Turns scattered bullet points into complete, detailed paragraphs' } },
          ].map((item) => (
            <div key={tr(item.t)} className="rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900 text-sm">{tr(item.t)}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(item.d)}</p>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock
        title={tr({ zh: '配置 API KEY', en: 'Configure an API KEY' })}
        desc={tr({ zh: 'AI 助手使用你自己的模型密钥（BYOK），点击导航栏用户名 → 设置 → AI 完成配置：', en: 'The AI assistant uses your own model key (BYOK). Click your username in the navbar → Settings → AI to configure:' })}
      >
        <ol className="flex flex-col gap-3">
          {[
            { zh: '打开设置：点击导航栏头像 / 用户名，进入「设置」窗口的「AI」分类。', en: 'Open Settings: click your avatar / username in the navbar and go to the AI category in the Settings window.' },
            { zh: '选择供应商：内置 OpenAI、DeepSeek、GLM、Qwen、LongCat、MiMo，也支持自定义 OpenAI 兼容协议地址。', en: 'Pick a provider: OpenAI, DeepSeek, GLM, Qwen, LongCat and MiMo are built in; custom OpenAI-compatible endpoints are supported too.' },
            { zh: '填写 API KEY：不同供应商的 KEY 独立保存，互不影响；模型列表点击「获取模型」自动拉取，失败时可手动输入模型名。', en: 'Enter your API KEY: keys are stored independently per provider. Click "Fetch Models" to auto-load the model list, or type a model name manually if it fails.' },
            { zh: '保存并测试：回到 AI 聊天窗发送消息即可；消息上方的「AI 执行」可展开查看执行步骤与错误详情。', en: 'Save and test: send a message in the AI chat window. Expand "AI Trace" above a message to see execution steps and error details.' },
          ].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-gray-200 p-4">
              <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-[13px] text-gray-600 leading-relaxed">{tr(s)}</p>
            </li>
          ))}
        </ol>
      </DocBlock>

      <DocBlock title={tr({ zh: '供应商入口', en: 'Provider Links' })} desc={tr({ zh: '各供应商 API KEY 的申请入口：', en: 'Where to apply for each provider\'s API KEY:' })}>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                <th className="px-4 py-2.5 font-medium">{tr({ zh: '供应商', en: 'Provider' })}</th>
                <th className="px-4 py-2.5 font-medium">{tr({ zh: '官网 / 控制台', en: 'Website / Console' })}</th>
                <th className="px-4 py-2.5 font-medium">{tr({ zh: 'KEY 获取', en: 'Getting a KEY' })}</th>
              </tr>
            </thead>
            <tbody>
              {AI_PROVIDERS.map((p) => (
                <tr key={p.name} className="border-t border-gray-100">
                  <td className="px-4 py-2.5 text-gray-900 font-medium whitespace-nowrap">{p.name}</td>
                  <td className="px-4 py-2.5">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 break-all"
                    >
                      {p.url}
                    </a>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{tr(p.key)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '注意事项', en: 'Notes' })}>
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-[13px] text-amber-800 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: 'API KEY 仅保存在你自己的浏览器中，对话请求由浏览器直连你选择的供应商，本站不经手、不存储任何数据。', en: 'Your API KEY is stored only in your own browser; chat requests go directly from your browser to the provider — this site never touches or stores any data.' })}</li>
            <li>{tr({ zh: '对话记录按简历维度保存在本地浏览器，切换简历互不串扰，关闭窗口后重新打开可继续。', en: 'Chat history is saved locally per resume — switching resumes never mixes conversations, and reopening the window continues where you left off.' })}</li>
            <li>{tr({ zh: '部分供应商未开放浏览器跨域访问时「获取模型」会失败，此时可手动输入模型名称；对话请求不受影响。', en: 'If a provider doesn\'t allow browser cross-origin access, "Fetch Models" may fail — type the model name manually; chat requests are unaffected.' })}</li>
            <li>{tr({ zh: '生成中可点击「停止」中断；未配置模型时会给出明确提示。', en: 'Click "Stop" to interrupt while generating; a clear prompt appears if no model is configured.' })}</li>
          </ul>
        </div>
      </DocBlock>
    </>
  );
}

export function AIDocPage() {
  const tr = useTr();
  return (
    <DocsLayout>
      <DocSectionHeader
        no="05 · AI ASSISTANT"
        title={tr({ zh: 'AI 助手', en: 'AI Assistant' })}
        desc={tr({ zh: '点击编辑器顶栏「AI 助手」按钮，在预览右侧展开聊天窗口，对当前简历进行润色与分析。', en: 'Click "AI Assistant" on the editor toolbar to open the chat beside the preview and polish or analyze the current resume.' })}
      />
      <AIDocContent />
    </DocsLayout>
  );
}
