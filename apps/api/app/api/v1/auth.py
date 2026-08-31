import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_current_user_id, get_db
from app.schemas import (
    UserCreate,
    LoginRequest,
    LoginResponse,
    UserSchema,
    ProfileUpdate,
    PasswordChange,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

# 头像上传限制
AVATAR_CONTENT_TYPES = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp"}
AVATAR_MAX_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        user = await service.register(data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        return await service.authenticate(data)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", response_model=UserSchema)
async def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    user = await service.get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user


@router.put("/me", response_model=UserSchema)
async def update_me(
    data: ProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """修改用户名/邮箱"""
    if data.name is None and data.email is None:
        raise HTTPException(status_code=400, detail="没有需要更新的内容")
    service = AuthService(db)
    try:
        user = await service.update_profile(user_id, data.name, data.email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user


@router.put("/password")
async def change_password(
    data: PasswordChange,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """修改密码（需校验原密码）"""
    if not data.new_password or len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="新密码至少需要 6 位")
    service = AuthService(db)
    try:
        ok = await service.change_password(user_id, data.old_password, data.new_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if ok is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"message": "密码已更新"}


@router.post("/avatar", response_model=UserSchema)
async def upload_avatar(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """上传头像（前端已完成裁剪）。保存文件并写入用户记录，返回更新后的用户"""
    ext = AVATAR_CONTENT_TYPES.get(file.content_type or "")
    if not ext:
        raise HTTPException(status_code=400, detail="仅支持 PNG / JPEG / WebP 图片")
    data = await file.read()
    if len(data) > AVATAR_MAX_SIZE:
        raise HTTPException(status_code=400, detail="图片不能超过 5MB")

    avatar_dir = Path(settings.UPLOAD_DIR) / "avatars"
    avatar_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
    (avatar_dir / filename).write_bytes(data)

    service = AuthService(db)
    user = await service.update_avatar(user_id, f"/api/v1/static/avatars/{filename}")
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user
