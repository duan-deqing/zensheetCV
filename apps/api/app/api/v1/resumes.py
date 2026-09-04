from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user_id
from app.schemas import ResumeSchema, ResumeCreate, ResumeUpdate, ResumeListSchema
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/resumes", tags=["resumes"])

# 每个用户最多可持有的简历份数（新建与复制共用该上限）
MAX_RESUMES_PER_USER = 15


@router.get("", response_model=ResumeListSchema)
async def list_resumes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = ResumeService(db)
    items, total = await service.list_by_user(user_id, skip, limit)
    return {"items": items, "total": total}


@router.post("", response_model=ResumeSchema, status_code=status.HTTP_201_CREATED)
async def create_resume(
    data: ResumeCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = ResumeService(db)
    if await service.count_by_user(user_id) >= MAX_RESUMES_PER_USER:
        raise HTTPException(
            status_code=400,
            detail=f"最多可创建 {MAX_RESUMES_PER_USER} 份简历，请删除不需要的简历后再试",
        )
    resume = await service.create(user_id, data)
    return resume


@router.get("/{resume_id}", response_model=ResumeSchema)
async def get_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = ResumeService(db)
    resume = await service.get_by_id(resume_id, user_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.put("/{resume_id}", response_model=ResumeSchema)
async def update_resume(
    resume_id: str,
    data: ResumeUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = ResumeService(db)
    resume = await service.get_by_id(resume_id, user_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    updated = await service.update(resume, data)
    return updated


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = ResumeService(db)
    resume = await service.get_by_id(resume_id, user_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    await service.delete(resume)
