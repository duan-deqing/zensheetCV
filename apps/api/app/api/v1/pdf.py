from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.deps import get_current_user_id
from app.schemas.pdf import PDFGenerateRequest, PDFGenerateResponse
from app.services.pdf_service import PDFService

router = APIRouter(prefix="/pdf", tags=["pdf"])

pdf_service = PDFService()


@router.post("/generate", response_model=PDFGenerateResponse)
async def generate_pdf(data: PDFGenerateRequest, user_id: str = Depends(get_current_user_id)):
    file_id = await pdf_service.generate_pdf(data.html, data.css, data.margin_x_mm, data.margin_y_mm)
    return {"download_url": f"/api/v1/pdf/download/{file_id}", "expires_at": ""}


@router.get("/download/{file_id}")
async def download_pdf(file_id: str, user_id: str = Depends(get_current_user_id)):
    pdf_path = pdf_service.get_pdf_path(file_id)
    if not pdf_path:
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(path=str(pdf_path), media_type="application/pdf", filename="resume.pdf")
