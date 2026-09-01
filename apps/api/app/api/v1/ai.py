import json
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user_id
from app.models.chat import ChatMessageModel
from app.schemas.ai import (
    AIPolishRequest,
    AIKeywordsRequest,
    AIGenerateRequest,
    AIModelsRequest,
    AIChatRequest,
    AIHistorySaveRequest,
)
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


@router.post("/chat")
async def chat_completion(data: AIChatRequest, user_id: str = Depends(get_current_user_id)):
    """AI 助手聊天窗口：多轮对话流式输出，BYOK 供应商配置随请求携带"""
    service = AIService()
    messages = [{"role": m.role, "content": m.content} for m in data.messages]
    return StreamingResponse(
        sse_stream(service.chat(messages, data.api_key, data.base_url, data.model)),
        media_type="text/event-stream",
    )


@router.get("/history")
async def get_history(
    resume_id: str = Query(..., min_length=1, max_length=64),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """读取当前用户在指定简历下的对话记录（按时间正序）"""
    result = await db.execute(
        select(ChatMessageModel)
        .where(ChatMessageModel.user_id == user_id, ChatMessageModel.resume_id == resume_id)
        .order_by(ChatMessageModel.id)
    )
    rows = result.scalars().all()
    return {
        "messages": [
            {"role": r.role, "content": r.content, "name": r.name, "time": r.time, "meta": r.meta}
            for r in rows
        ]
    }


@router.put("/history")
async def save_history(
    data: AIHistorySaveRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """覆盖式保存当前用户在指定简历下的整段对话"""
    await db.execute(
        delete(ChatMessageModel).where(
            ChatMessageModel.user_id == user_id, ChatMessageModel.resume_id == data.resume_id
        )
    )
    for m in data.messages:
        db.add(
            ChatMessageModel(
                user_id=user_id,
                resume_id=data.resume_id,
                role=m.role,
                content=m.content,
                name=m.name,
                time=m.time,
                meta=m.meta,
            )
        )
    await db.commit()
    return {"saved": len(data.messages)}


@router.delete("/history")
async def clear_history(
    resume_id: str = Query(..., min_length=1, max_length=64),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """清空当前用户在指定简历下的对话记录"""
    await db.execute(
        delete(ChatMessageModel).where(
            ChatMessageModel.user_id == user_id, ChatMessageModel.resume_id == resume_id
        )
    )
    await db.commit()
    return {"cleared": True}
