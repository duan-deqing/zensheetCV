from pydantic import BaseModel, Field
from datetime import datetime
from typing import Any


class ThemeConfigSchema(BaseModel):
    primaryColor: str = "#2563EB"
    fontFamily: str = "'Inter', 'Noto Sans SC', sans-serif"
    fontSize: str = "base"
    spacing: str = "normal"


class ResumeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    markdown: str = ""


class ResumeCreate(ResumeBase):
    template_id: str = "classic"
    theme_config: dict[str, Any] = {}


class ResumeUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    markdown: str | None = None
    template_id: str | None = None
    theme_config: dict[str, Any] | None = None


class ResumeSchema(ResumeBase):
    id: str
    user_id: str
    template_id: str
    theme_config: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResumeListSchema(BaseModel):
    items: list[ResumeSchema]
    total: int
