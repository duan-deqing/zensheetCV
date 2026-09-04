/** 全站共享的示例简历内容（人设：沈亦南 · 后端工程师）
   完整版用于首页 Hero、模板展示区与模板卡片预览，全站内容同源；
   基本信息使用 :::left / :::mid / :::right 三栏语法，展示分栏排版能力
   英文版 SAMPLE_MARKDOWN_EN 与中文版结构/人设一致，供英文界面按语言选用 */

export const SAMPLE_MARKDOWN = `# ZENSHEET

icon:info AI · 2026 icon:github zensheet.dev

icon:phone 139-0000-0000 · icon:email zensheet@mail.com

## 专业技能

\`Python\` \`LLM\` \`Langchain\` \`RAG\` \`OpenAI\` \`LECL\` \`Docker\` \`SQLite\` 

## 工作经历

### 澜舟云科技 · 资深后端工程师

2025.06 - 至今

- 主导交易网关重构，QPS 峰值承载提升 5 倍，P99 延迟降至 45ms
- 设计多机房容灾方案，年度可用性达成 99.99%

### 启明数联 · 后端工程师

2015.07 - 2026.05

- 从 0 搭建物联网数据接入平台，日均处理 2 亿条设备消息
- 推动服务容器化迁移，部署效率提升 60%，资源成本下降 35%

## 项目经验

### 开源项目 gobridge

2025.03 - 至今

- 轻量级消息桥接框架，GitHub 3.2k Star，被 40+ 企业采用

## 教育背景

:::left
**东南大学**
:::

:::mid
软件工程
:::

:::right
**2021.09 - 2025.05**
:::
`;

/** 英文版示例简历：与 SAMPLE_MARKDOWN 同一人设与结构（公司/项目名意译） */
export const SAMPLE_MARKDOWN_EN = `# ZENSHEET

icon:info AI · 2026 icon:github zensheet.dev

icon:phone 139-0000-0000 · icon:email zensheet@mail.com

## Professional Skills

\`Python\` \`LLM\` \`Langchain\` \`RAG\` \`OpenAI\` \`LECL\` \`Docker\` \`SQLite\`

## Work Experience

### Lanboat Cloud · Senior Backend Engineer

2025.06 - Present

- Led the re-architecture of the trading gateway, raising peak QPS capacity 5x and cutting P99 latency to 45ms
- Designed a multi-datacenter failover solution, achieving 99.99% annual availability

### Enlightenment Link · Backend Engineer

2015.07 - 2026.05

- Built an IoT data ingestion platform from scratch, processing 200M device messages daily
- Drove the migration to containerized services, improving deployment efficiency by 60% and cutting resource costs by 35%

## Project Experience

### Open-source project gobridge

2025.03 - Present

- Lightweight message-bridging framework, 3.2k GitHub stars, adopted by 40+ companies

## Education

:::left
**Southeast University**
:::

:::mid
Software Engineering
:::

:::right
**2021.09 - 2025.05**
:::
`;

/** 按界面语言返回对应版本的示例简历内容 */
export function sampleMarkdown(lang: 'zh' | 'en'): string {
  return lang === 'en' ? SAMPLE_MARKDOWN_EN : SAMPLE_MARKDOWN;
}
