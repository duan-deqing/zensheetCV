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

        prompt = f"""你是资深简历优化专家。用户会提供一段简历{content}内容，你需要：
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
