import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.schemas.ai import AIPolishRequest, AIKeywordsRequest, AIGenerateRequest
from app.services.ai_service import AIService
from app.services.auth_service import AuthService

router = APIRouter(prefix="/ai", tags=["ai"])
security = HTTPBearer()

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> str:
    service = AuthService(db)
    user = await service.get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user.id

@router.post("/polish")
async def polish_text(data: AIPolishRequest, user_id: str = Depends(get_current_user_id)):
    service = AIService()
    async def generate():
        async for delta in service.polish(data.text, data.context):
            yield f"data: {json.dumps({'delta': delta}, ensure_ascii=False)}\n\n"
        yield f"data: {json.dumps({'done': True}, ensure_ascii=False)}\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.post("/keywords")
async def analyze_keywords(data: AIKeywordsRequest, user_id: str = Depends(get_current_user_id)):
    service = AIService()
    result = await service.analyze_keywords(data.jd, data.resume)
    return result

@router.post("/generate")
async def generate_content(data: AIGenerateRequest, user_id: str = Depends(get_current_user_id)):
    service = AIService()
    async def generate():
        async for delta in service.generate_content(data.points, data.context):
            yield f"data: {json.dumps({'delta': delta}, ensure_ascii=False)}\n\n"
        yield f"data: {json.dumps({'done': True}, ensure_ascii=False)}\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream")
