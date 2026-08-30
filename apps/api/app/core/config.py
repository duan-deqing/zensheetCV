import secrets
import warnings

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Stylan Resume API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"
    SECRET_KEY: str = ""  # 未设置时将生成临时随机密钥，重启后登录会话失效
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    def model_post_init(self, __context) -> None:
        if not self.SECRET_KEY:
            warnings.warn(
                "SECRET_KEY 未设置，已生成临时随机密钥；后端重启后所有登录会话将失效。"
                "请在 .env 中设置固定的 SECRET_KEY。"
            )
            self.SECRET_KEY = secrets.token_urlsafe(32)

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
