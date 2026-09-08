/** 全站共享的示例简历内容（人设：AI Agent 工程师）
   完整版用于首页 Hero、模板展示区与模板卡片预览，全站内容同源；
   工作经历/项目经验/教育背景使用 :::left / :::mid / :::right 三栏语法，展示分栏排版能力
   英文版 SAMPLE_MARKDOWN_EN 与中文版结构/人设一致，供英文界面按语言选用
   ⚠ 同步警示：中英两份为手工对照的完整字符串（未结构化），
   修改任一版本的章节/条目时，必须同步另一份的对应内容与顺序 */

export const SAMPLE_MARKDOWN = `# ZENSHEET

icon:info 男/2001.06 icon:phone 139-0000-0000 · icon:email zensheet@mail.com icon:github zensheetCV.dev

## 专业技能

- **AI Agent & LLM**：精通 Prompt Engineering、RAG 架构与 Function Calling；具备多步推理、工具动态调度与状态机管理落地经验。
- **大模型工程化**：熟练接入 OpenAI 兼容 API，精通 SSE 流式输出、JSON 结构化解析及异常兜底策略。
- **基础设施**：熟悉 Milvus/Qdrant 等向量数据库；熟练掌握 Docker/K8s 及 CI/CD，具备大模型服务容器化部署与成本优化经验。

## 工作经历

:::left
**澜舟云科技 · AI Agent 工程师**
:::

:::right
**2025.06 - 至今**
:::

- 设计 RAG 检索链路，优化分块与混合检索（BM25+Vector），Top-3 召回率提升至 **92%**。
- 优化推理网关，支持多供应商动态路由与降级，P99 延迟降低 **30%**，API 成本下降 **25%**。

## 项目经验

:::left
**ZENSHEET 简历编辑器**
:::

:::mid
**全栈开发工程师**
:::

:::right
**2026.08 – 至今**
:::

**技术栈**：\`OpenAI API\` \`Function Calling\` \`SSE\` \`Prompt工程\` \`React 18\` \`TypeScript\` \`IndexedDB\`

**项目介绍**：内嵌 BYOK AI 助手的在线编辑器，浏览器直连大模型实现流式对话、结构化改写与 Agent 工具调用，数据纯本地存储。

**核心职责**：

- 构建 SSE 流式管道：实现增量渲染、中断控制、异常兜底与会话本地持久化。
- 优化 Prompt 体系：精细化约束上下文长度，确保 JSON 结构化稳定输出。

**项目成果**：

- 兼容 DeepSeek/智谱等多供应商直连，无 CORS 场景优雅降级；全流程可视化，显著降低 Agent 不可控感。

## 教育背景

:::left
**ZENSHEET大学**
:::

:::mid
**软件工程 · 本科**
:::

:::right
**2021.09 - 2025.06**
:::

- **学业表现**：GPA 3.8/4.0，连续两年获得校级一等奖学金。

## 个人优势

> 专注 AI Agent 与大模型落地，兼具扎实后端工程能力与 AI 产品嗅觉。追求代码简洁与架构优雅。
`;

/** 英文版示例简历：与 SAMPLE_MARKDOWN 同一人设与结构（公司/项目名意译），改动需与中文版逐条同步 */
export const SAMPLE_MARKDOWN_EN = `# ZENSHEET

icon:info Male / 2001.06 icon:phone 139-0000-0000 · icon:email zensheet@mail.com icon:github zensheetCV.dev

## Professional Skills

- **AI Agent & LLM**: Proficient in Prompt Engineering, RAG architecture and Function Calling; hands-on experience with multi-step reasoning, dynamic tool orchestration and state-machine management.
- **LLM Engineering**: Skilled at integrating OpenAI-compatible APIs; expert in SSE streaming output, JSON structured parsing and exception fallback strategies.
- **Infrastructure**: Familiar with vector databases such as Milvus/Qdrant; proficient with Docker/K8s and CI/CD, with experience in containerized LLM service deployment and cost optimization.

## Work Experience

:::left
**Lanboat Cloud · AI Agent Engineer**
:::

:::right
**2025.06 - Present**
:::

- Designed the RAG retrieval pipeline with optimized chunking and hybrid retrieval (BM25+Vector), raising Top-3 recall to **92%**.
- Optimized the inference gateway with multi-provider dynamic routing and fallback, cutting P99 latency by **30%** and API cost by **25%**.

## Project Experience

:::left
**ZENSHEET Resume Editor**
:::

:::mid
**Full-stack Engineer**
:::

:::right
**2026.08 – Present**
:::

**Tech Stack**: \`OpenAI API\` \`Function Calling\` \`SSE\` \`Prompt Engineering\` \`React 18\` \`TypeScript\` \`IndexedDB\`

**Overview**: An online editor with a built-in BYOK AI assistant — the browser connects directly to LLMs for streaming chat, structured rewriting and Agent tool calling, with all data stored locally.

**Key Contributions**:

- Built the SSE streaming pipeline: incremental rendering, interruption control, exception fallback and local session persistence.
- Refined the Prompt system: fine-grained context-length constraints to ensure stable JSON structured output.

**Outcomes**:

- Compatible with multiple providers (DeepSeek/Zhipu) via direct browser connections, degrading gracefully when CORS is unavailable; end-to-end visualization greatly reduces Agent unpredictability.

## Education

:::left
**ZENSHEET University**
:::

:::mid
**Software Engineering · Bachelor**
:::

:::right
**2021.09 - 2025.06**
:::

- **Academic Performance**: GPA 3.8/4.0, university first-class scholarship for two consecutive years.

## Personal Strengths

> Focused on bringing AI Agents and LLMs to production, with solid backend engineering skills and a sharp product sense for AI. Committed to clean code and elegant architecture.
`;

/** 按界面语言返回对应版本的示例简历内容 */
export function sampleMarkdown(lang: 'zh' | 'en'): string {
  return lang === 'en' ? SAMPLE_MARKDOWN_EN : SAMPLE_MARKDOWN;
}
