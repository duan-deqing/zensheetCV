from pydantic import BaseModel


class PDFGenerateRequest(BaseModel):
    resume_id: str
    html: str
    css: str


class PDFGenerateResponse(BaseModel):
    download_url: str
    expires_at: str
