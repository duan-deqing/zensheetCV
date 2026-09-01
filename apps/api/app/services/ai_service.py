import json
from collections.abc import AsyncIterator

from openai import AsyncOpenAI

from app.core.config import settings


class AIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    async def polish(self, text: str, context: str) -> AsyncIterator[str]:
        if not self.client:
            yield "[错误] OpenAI API Key 未配置"
            return

        prompt = f"""你是资深简历优化专家。用户会提供一段简历内容，你需要：
1. 使用更专业、有力的动词替换平淡表述
2. 尽可能加入量化成果（如用户提供了数据）
3. 保持原意不变
4. 输出简体中文
5. 每次只优化一段，保持简洁

原文：{text}"""

        stream = await self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            stream=True,
            max_tokens=500,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def analyze_keywords(self, jd: str, resume: str) -> dict:
        if not self.client:
            return {"matched": [], "missing": [], "suggestions": ["OpenAI API Key 未配置"]}

        prompt = f"""你是求职顾问。用户提供目标职位描述(JD)和其简历内容。你需要：
1. 从 JD 提取 5-10 个核心关键词/技能词
2. 标出简历中已包含和缺失的关键词
3. 给出 3 条具体的改进建议
4. 严格输出 JSON 格式：{{"matched": [...], "missing": [...], "suggestions": [...]}}

JD：{jd}

简历：{resume}"""

        response = await self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            response_format={"type": "json_object"},
        )

        try:
            content = response.choices[0].message.content
            return json.loads(content)
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            return {"matched": [], "missing": [], "suggestions": [f"解析 AI 响应失败: {str(e)}"]}

    async def generate_content(self, points: list[str], context: str) -> AsyncIterator[str]:
        if not self.client:
            yield "[错误] OpenAI API Key 未配置"
            return

        points_text = "\n".join(f"- {p}" for p in points)
        prompt = f"""你擅长帮技术人员撰写项目描述。用户提供项目要点列表，你需要按 STAR 格式扩展成流畅的 2-3 段描述：
- Situation（情境）：项目背景
- Task（任务）：你的职责
- Action（行动）：具体行动
- Result（结果）：量化成果

项目要点：
{points_text}

上下文：{context}"""

        stream = await self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            stream=True,
            max_tokens=1000,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def chat(
        self,
        messages: list[dict],
        api_key: str = "",
        base_url: str = "",
        model: str = "",
    ) -> AsyncIterator[str]:
        """通用对话（AI 助手聊天窗口）。BYOK 优先：请求携带供应商配置时使用之，
        否则回退服务端配置的 OPENAI_API_KEY / OPENAI_MODEL"""
        if api_key and base_url and model:
            client = AsyncOpenAI(api_key=api_key, base_url=base_url)
            use_model = model
        elif self.client:
            client = self.client
            use_model = settings.OPENAI_MODEL
        else:
            yield "[错误] 未配置 AI 模型，请点击右上角用户名，在「设置 → AI」中配置供应商与 API KEY"
            return

        system_prompt = """你是 ZENSHEET 简历编辑器内置的简历顾问助手。你需要：
1. 帮助用户润色简历表述、分析职位描述关键词、撰写项目与经历描述
2. 回答求职与简历排版相关问题
3. 使用简体中文，回复简洁、结构化，适当使用 Markdown 列表
4. 用户可能随消息附带其当前简历 Markdown 内容，作为上下文参考"""
        full_messages = [{"role": "system", "content": system_prompt}, *messages]

        stream = await client.chat.completions.create(
            model=use_model,
            messages=full_messages,
            stream=True,
            max_tokens=1500,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
