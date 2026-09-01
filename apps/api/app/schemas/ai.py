from typing import Literal

from pydantic import BaseModel, Field, HttpUrl

class AIPolishRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    context: str = "工作经历"

class AIModelsRequest(BaseModel):
    base_url: HttpUrl
    api_key: str = Field(..., min_length=1, max_length=200)

class AIKeywordsRequest(BaseModel):
    jd: str = Field(..., min_length=1, max_length=20000)
    resume: str = Field(..., min_length=1, max_length=20000)

class AIGenerateRequest(BaseModel):
    points: list[str] = Field(..., min_length=1, max_length=20)
    context: str = "项目经验"

class AIChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=20000)

class AIChatRequest(BaseModel):
    messages: list[AIChatMessage] = Field(..., min_length=1, max_length=50)
    # BYOK：用户在「设置 → AI」中配置的供应商信息（可选，缺省回退服务端配置）
    api_key: str = Field("", max_length=200)
    base_url: str = Field("", max_length=500)
    model: str = Field("", max_length=200)

class AIStreamResponse(BaseModel):
    delta: str
    done: bool = False


class AIHistoryMessage(BaseModel):
    """对话记录中的单条消息（含执行状态元信息）"""
    role: Literal["user", "assistant"]
    content: str = ""
    name: str | None = None
    time: str | None = None
    meta: dict | None = None


class AIHistorySaveRequest(BaseModel):
    """整段对话保存（按用户 + 简历覆盖式存储）"""
    resume_id: str = Field(..., min_length=1, max_length=64)
    messages: list[AIHistoryMessage] = Field(..., max_length=200)
