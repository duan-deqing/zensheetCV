import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI

from app.core.deps import get_current_user_id
from app.schemas.ai import AIPolishRequest, AIKeywordsRequest, AIGenerateRequest, AIModelsRequest
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])


def sse_event(payload: dict) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


async def sse_stream(stream):
    try:
        async for delta in stream:
            yield sse_event({"delta": delta})
        yield sse_event({"done": True})
    except Exception as e:
        yield sse_event({"error": f"AI 服务异常: {str(e)}"})


@router.post("/models")
async def list_models(data: AIModelsRequest, user_id: str = Depends(get_current_user_id)):
    """代理转发供应商 GET /models（OpenAI 兼容协议），避免浏览器直连被 CORS 拦截"""
    client = AsyncOpenAI(api_key=data.api_key, base_url=str(data.base_url), timeout=15.0)
    try:
        page = await client.models.list()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"无法获取模型列表: {e}") from e
    return {"models": [m.id for m in page.data]}


@router.post("/polish")
async def polish_text(data: AIPolishRequest, user_id: str = Depends(get_current_user_id)):
    service = AIService()
    return StreamingResponse(
        sse_stream(service.polish(data.text, data.context)),
        media_type="text/event-stream",
    )


@router.post("/keywords")
async def analyze_keywords(data: AIKeywordsRequest, user_id: str = Depends(get_current_user_id)):
    service = AIService()
    result = await service.analyze_keywords(data.jd, data.resume)
    return result


@router.post("/generate")
async def generate_content(data: AIGenerateRequest, user_id: str = Depends(get_current_user_id)):
    service = AIService()
    return StreamingResponse(
        sse_stream(service.generate_content(data.points, data.context)),
        media_type="text/event-stream",
    )
