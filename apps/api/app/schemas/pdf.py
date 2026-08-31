from pydantic import BaseModel, Field


class PDFGenerateRequest(BaseModel):
    resume_id: str
    html: str
    css: str
    # 页边距 mm，与前端主题设置一致；0 保持旧版无边距行为
    margin_x_mm: float = Field(default=0, ge=0, le=30)
    margin_y_mm: float = Field(default=0, ge=0, le=30)


class PDFGenerateResponse(BaseModel):
    download_url: str
    expires_at: str
