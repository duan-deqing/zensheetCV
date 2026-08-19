import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.ai import *
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/polish")
async def polish_text(data: AIPolishRequest):
    service = AIService()

    async def generate():
        async for delta in service.polish(data.text, data.context):
            yield f"data: {json.dumps({'delta': delta}, ensure_ascii=False)}\n\n"
        yield f"data: {json.dumps({'done': True}, ensure_ascii=False)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/keywords")
async def analyze_keywords(data: AIKeywordsRequest):
    service = AIService()
    result = await service.analyze_keywords(data.jd, data.resume)
    return result


@router.post("/generate")
async def generate_content(data: AIGenerateRequest):
    service = AIService()

    async def generate():
        async for delta in service.generate_content(data.points, data.context):
            yield f"data: {json.dumps({'delta': delta}, ensure_ascii=False)}\n\n"
        yield f"data: {json.dumps({'done': True}, ensure_ascii=False)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
