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
        title={tr({ zh: '深度工作流', en: 'Deep Workflows' })}
        desc={tr({ zh: '聊天窗输入区上方提供两个一键工作流按钮，按固定步骤串行执行，每一步的执行状态实时展示：', en: 'Two one-click workflow buttons sit above the chat input, running fixed serial pipelines with live per-step status:' })}
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              t: { zh: '全文润色', en: 'Polish All' },
              d: {
                zh: '诊断 → 起草 → 本地自查 → 修订 四步流水线：先给出整体诊断，再起草改写；本地校验每条建议能否唯一定位到原文（找不到或多处命中的条目自动回炉重试），最后修订输出',
                en: 'A four-step pipeline: diagnose → draft → local self-check → revise. Each suggestion is locally verified against the original text (entries that cannot be located or are ambiguous are retried), then revised into the final output',
              },
            },
            {
              t: { zh: 'JD 对齐', en: 'JD Match' },
              d: {
                zh: '粘贴职位描述后运行：提取关键词 → 计算简历覆盖率 → 针对缺口改写。诚实约束内置——只调整表述与强调，绝不编造简历未提及的经历',
                en: 'Run with a pasted job description: extract keywords → compute resume coverage → rewrite around the gaps. An honesty constraint is built in — rephrase and re-emphasize only, never fabricate experience',
              },
            },
          ].map((item) => (
            <div key={tr(item.t)} className="rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900 text-sm">{tr(item.t)}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(item.d)}</p>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock
        title={tr({ zh: '结构化改写建议（确认式）', en: 'Structured Edit Suggestions (Confirmation-based)' })}
        desc={tr({ zh: '当 AI 涉及修改简历内容时，每条改动以「建议卡片」呈现，AI 永远不直接修改你的文档：', en: 'Whenever the AI proposes resume changes, each edit appears as a suggestion card — the AI never edits your document directly:' })}
      >
        <ol className="flex flex-col gap-3">
          {[
            { zh: '上下对照：卡片同时显示「原文」与「替换内容」，长片段可展开折叠区域查看完整对照。', en: 'Side-by-side diff: each card shows the original text and its replacement; long fragments can be expanded to view the full comparison.' },
            { zh: '确认应用：逐条「应用」或「全部应用」；应用后自动保存，右侧预览实时更新。', en: 'Confirm to apply: apply entries one by one or all at once; applying auto-saves and updates the preview live.' },
            { zh: '一键撤销：误应用时可「撤销本轮」，整批回到应用前的简历快照。', en: 'One-click undo: "Undo round" reverts the whole batch to the resume snapshot taken before applying.' },
            { zh: '失败标红：无法定位的条目（找不到或多处命中）标红注明原因，不影响其余条目。', en: 'Failed entries flagged: entries that cannot be located (not found or ambiguous) are marked red with the reason, without affecting the rest.' },
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

      <DocBlock
        title={tr({ zh: 'Agent 模式（实验）', en: 'Agent Mode (Experimental)' })}
        desc={tr({ zh: '聊天窗输入区上方开启「Agent 模式」后，发送的消息将进入 function calling 循环，AI 可自主调用工具完成多轮探索：', en: 'With "Agent mode" enabled above the chat input, messages enter a function-calling loop where the AI calls tools autonomously over multiple rounds:' })}
      >
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                <th className="px-4 py-2.5 font-medium">{tr({ zh: '工具', en: 'Tool' })}</th>
                <th className="px-4 py-2.5 font-medium">{tr({ zh: '作用', en: 'Purpose' })}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { t: 'read_resume', d: { zh: '读取完整简历 Markdown', en: 'Read the full resume Markdown' } },
                { t: 'read_section', d: { zh: '按标题读取某一小节', en: 'Read a single section by heading' } },
                { t: 'get_page_count', d: { zh: '查询当前渲染页数', en: 'Query the rendered page count' } },
                { t: 'get_template_info', d: { zh: '查询当前模板与主题信息', en: 'Query current template and theme info' } },
                { t: 'propose_edit', d: { zh: '逐条提交修改建议（在卡片上确认后生效）', en: 'Submit edit suggestions one by one (effective after card confirmation)' } },
              ].map((row) => (
                <tr key={row.t} className="border-t border-gray-100">
                  <td className="px-4 py-2.5 font-mono text-primary-600 whitespace-nowrap">{row.t}</td>
                  <td className="px-4 py-2.5 text-gray-500">{tr(row.d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[13px] text-gray-500 leading-relaxed mt-3">
          {tr({
            zh: 'AI 每轮的工具调用都会记录在「AI 执行」面板中；提出的修改仍以建议卡片呈现，需你逐条确认。供应商不支持工具调用时自动降级为建议块模式，无需额外设置。',
            en: 'Every tool call is recorded in the "AI Trace" panel; proposed changes still appear as suggestion cards awaiting your confirmation. Providers without tool-calling support automatically fall back to suggestion-block mode — no extra setup needed.',
          })}
        </p>
      </DocBlock>

      <DocBlock
        title={tr({ zh: 'AI 执行面板', en: 'AI Trace Panel' })}
        desc={tr({ zh: '每条 AI 回复上方有一条「AI 执行（AI RUN）」状态行，点击可反复展开 / 收起：', en: 'Each AI reply has an "AI Trace (AI RUN)" status row above it that can be expanded and collapsed repeatedly:' })}
      >
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: '面板顶部显示步骤总数：普通聊天为固定 4 步（读取模型配置 / 组装上下文 / 连接推理服务 / 流式生成回复），深度工作流与 Agent 模式为动态步骤列表。', en: 'The panel opens with a step count: regular chat shows the fixed 4 steps (read model config / build context / connect to inference service / stream response), while deep workflows and Agent mode show a dynamic step list.' })}</li>
            <li>{tr({ zh: '每个步骤行由序号、状态点、步骤名与状态耗时组成：蓝色脉冲 = 执行中，绿色 = 完成，红色 = 失败，琥珀色 = 已跳过。', en: 'Each step row shows an index, a status dot, the step name and its status/timing: pulsing blue = running, green = done, red = failed, amber = skipped.' })}</li>
            <li>{tr({ zh: '有详情的步骤可独立展开 / 收起，查看完整执行细节（工具调用的参数与结果摘要、工作流中间步输出）；多个步骤可同时展开，展开状态在流式更新与重新展开后均保持。', en: 'Steps with details expand / collapse independently to reveal their full execution detail (tool call arguments & result previews, workflow intermediate output); multiple steps can be open at once, and expansion state survives streaming updates and panel re-opening.' })}</li>
            <li>{tr({ zh: '执行失败时，面板底部浅红底块展示完整错误详情，便于排查网络、密钥或供应商侧问题。', en: 'On failure, a light-red block at the panel bottom shows the full error detail — handy for diagnosing network, key or provider-side issues.' })}</li>
          </ul>
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
            { zh: '保存并测试：回到 AI 聊天窗发送消息即可；消息上方的「AI 执行」面板可反复展开，逐步骤查看执行细节与错误详情。', en: 'Save and test: send a message in the AI chat window. The "AI Trace" panel above a message can be expanded repeatedly to inspect step-by-step execution details and errors.' },
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
            <li>{tr({ zh: '深度工作流与 Agent 模式按步骤发起多次请求，token 消耗高于普通聊天，建议在需要深度修改时使用。', en: 'Deep workflows and Agent mode issue several requests per run, consuming more tokens than regular chat — best saved for deep revisions.' })}</li>
            <li>{tr({ zh: 'Agent 模式需要供应商支持 function calling（工具调用）；不支持时自动降级为建议块模式，无需额外设置。', en: 'Agent mode requires provider support for function calling (tool use); providers without it automatically fall back to suggestion-block mode — no extra setup needed.' })}</li>
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
