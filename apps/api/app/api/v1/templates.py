from fastapi import APIRouter

from app.schemas import TemplateSchema

router = APIRouter(prefix="/templates", tags=["templates"])

BUILTIN_TEMPLATES = [
    {
        "id": "classic",
        "name": "经典简洁",
        "description": "经典黑白设计，适合正式求职场景",
        "thumbnail": "/templates/classic-thumb.svg",
        "css_styles": "/* classic template css */",
        "block_mapping": {"h1": "name", "h2": "section-title", "h3": "item-title", "ul": "list", "p": "description"},
        "is_builtin": True,
        "default_theme": {"primaryColor": "#111827", "fontFamily": "serif", "fontSize": "base", "spacing": "normal"},
    },
    {
        "id": "modern",
        "name": "现代设计",
        "description": "蓝色主调，现代感十足，适合互联网/科技公司",
        "thumbnail": "/templates/modern-thumb.svg",
        "css_styles": "/* modern template css */",
        "block_mapping": {"h1": "name", "h2": "section-title", "h3": "item-title", "ul": "list", "p": "description"},
        "is_builtin": True,
        "default_theme": {"primaryColor": "#2563EB", "fontFamily": "sans-serif", "fontSize": "base", "spacing": "normal"},
    },
    {
        "id": "elegant",
        "name": "优雅复古",
        "description": "优雅复古设计，适合设计/创意/教育行业",
        "thumbnail": "/templates/elegant-thumb.svg",
        "css_styles": "/* elegant template css */",
        "block_mapping": {"h1": "name", "h2": "section-title", "h3": "item-title", "ul": "list", "p": "description"},
        "is_builtin": True,
        "default_theme": {"primaryColor": "#78350F", "fontFamily": "serif", "fontSize": "base", "spacing": "relaxed"},
    },
    {
        "id": "tech",
        "name": "技术极简",
        "description": "极简技术风格，适合技术/开源/开发者",
        "thumbnail": "/templates/tech-thumb.svg",
        "css_styles": "/* tech template css */",
        "block_mapping": {"h1": "name", "h2": "section-title", "h3": "item-title", "ul": "list", "p": "description"},
        "is_builtin": True,
        "default_theme": {"primaryColor": "#10B981", "fontFamily": "monospace", "fontSize": "sm", "spacing": "compact"},
    },
]


@router.get("", response_model=list[TemplateSchema])
async def list_templates():
    return BUILTIN_TEMPLATES
