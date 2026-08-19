from pydantic import BaseModel


class AIPolishRequest(BaseModel):
    text: str
    context: str = "工作经历"


class AIKeywordsRequest(BaseModel):
    jd: str
    resume: str


class AIGenerateRequest(BaseModel):
    points: list[str]
    context: str = "项目经验"


class AIStreamResponse(BaseModel):
    delta: str
    done: bool = False
