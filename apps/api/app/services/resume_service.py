from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ResumeModel, UserModel
from app.schemas import ResumeCreate, ResumeUpdate


class ResumeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: str, data: ResumeCreate) -> ResumeModel:
        resume = ResumeModel(
            user_id=user_id,
            title=data.title,
            markdown=data.markdown,
            template_id=data.template_id,
            theme_config=data.theme_config,
        )
        self.db.add(resume)
        await self.db.commit()
        await self.db.refresh(resume)
        return resume

    async def get_by_id(self, resume_id: str, user_id: str) -> ResumeModel | None:
        result = await self.db.execute(
            select(ResumeModel).where(
                ResumeModel.id == resume_id,
                ResumeModel.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: str, skip: int = 0, limit: int = 20) -> tuple[list[ResumeModel], int]:
        count_result = await self.db.execute(
            select(func.count()).where(ResumeModel.user_id == user_id)
        )
        total = count_result.scalar()

        result = await self.db.execute(
            select(ResumeModel)
            .where(ResumeModel.user_id == user_id)
            .order_by(ResumeModel.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = result.scalars().all()
        return list(items), total

    async def update(self, resume: ResumeModel, data: ResumeUpdate) -> ResumeModel:
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(resume, field, value)
        await self.db.commit()
        await self.db.refresh(resume)
        return resume

    async def delete(self, resume: ResumeModel) -> None:
        await self.db.delete(resume)
        await self.db.commit()
