import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.core.deps import get_current_user_id
from app.schemas.ai import AIPolishRequest, AIKeywordsRequest, AIGenerateRequest
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
