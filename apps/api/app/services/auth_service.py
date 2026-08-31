from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from app.models import UserModel
from app.schemas import UserCreate, LoginRequest, LoginResponse, UserSchema
from app.core.security import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: UserCreate) -> UserModel:
        result = await self.db.execute(
            select(UserModel).where(UserModel.email == data.email)
        )
        if result.scalar_one_or_none():
            raise ValueError("Email already registered")
        user = UserModel(
            email=data.email,
            name=data.name,
            hashed_password=pwd_context.hash(data.password),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def authenticate(self, data: LoginRequest) -> LoginResponse:
        result = await self.db.execute(
            select(UserModel).where(UserModel.email == data.email)
        )
        user = result.scalar_one_or_none()
        if not user or not pwd_context.verify(data.password, user.hashed_password):
            raise ValueError("Invalid email or password")
        access_token = create_access_token(subject=user.id)
        user_schema = UserSchema.model_validate(user)
        return LoginResponse(access_token=access_token, token_type="bearer", user=user_schema)

    async def get_current_user(self, token: str) -> UserModel | None:
        from app.core.security import verify_access_token
        payload = verify_access_token(token)
        if not payload:
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        return result.scalar_one_or_none()

    async def update_avatar(self, user_id: str, avatar_url: str) -> UserModel | None:
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            return None
        user.avatar = avatar_url
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_profile(
        self, user_id: str, name: str | None = None, email: str | None = None
    ) -> UserModel | None:
        """更新用户名/邮箱，邮箱重复时抛 ValueError"""
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            return None
        if email and email != user.email:
            dup = await self.db.execute(
                select(UserModel).where(
                    UserModel.email == email, UserModel.id != user_id
                )
            )
            if dup.scalar_one_or_none():
                raise ValueError("该邮箱已被其他账号使用")
            user.email = email
        if name and name != user.name:
            user.name = name
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def change_password(
        self, user_id: str, old_password: str, new_password: str
    ) -> bool | None:
        """校验旧密码并更新；旧密码错误抛 ValueError；用户不存在返回 None"""
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            return None
        if not pwd_context.verify(old_password, user.hashed_password):
            raise ValueError("原密码不正确")
        user.hashed_password = pwd_context.hash(new_password)
        await self.db.commit()
        return True
