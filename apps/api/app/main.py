from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.v1 import resumes, templates, pdf, auth, ai
from app.services.pdf_service import PDFService

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    PDFService.cleanup_old_pdfs()
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    yield
    await engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(resumes.router, prefix="/api/v1")
app.include_router(templates.router, prefix="/api/v1")
app.include_router(pdf.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")

# 头像等上传文件的静态服务（挂载前确保目录存在）
avatars_dir = Path(settings.UPLOAD_DIR) / "avatars"
avatars_dir.mkdir(parents=True, exist_ok=True)
app.mount(
    "/api/v1/static/avatars",
    StaticFiles(directory=avatars_dir),
    name="avatars",
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
