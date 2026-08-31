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

class AIStreamResponse(BaseModel):
    delta: str
    done: bool = False
