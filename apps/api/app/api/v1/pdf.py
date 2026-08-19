import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.schemas.pdf import PDFGenerateRequest, PDFGenerateResponse
from app.services.pdf_service import PDFService
from app.services.auth_service import AuthService

router = APIRouter(prefix="/pdf", tags=["pdf"])
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

pdf_service = PDFService()

@router.post("/generate", response_model=PDFGenerateResponse)
async def generate_pdf(data: PDFGenerateRequest, user_id: str = Depends(get_current_user_id)):
    file_id = await pdf_service.generate_pdf(data.html, data.css)
    return {"download_url": f"/api/v1/pdf/download/{file_id}", "expires_at": ""}

@router.get("/download/{file_id}")
async def download_pdf(file_id: str, user_id: str = Depends(get_current_user_id)):
    pdf_path = pdf_service.get_pdf_path(file_id)
    if not pdf_path:
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(path=str(pdf_path), media_type="application/pdf", filename="resume.pdf")
