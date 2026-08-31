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
        "id": "carbon",
        "name": "碳黑章标",
        "description": "灰底章节条 + 左侧竖标，黑白灰商务风，适合正式求职与国企/事业单位",
        "thumbnail": "/templates/carbon-thumb.svg",
        "css_styles": "/* carbon template css */",
        "block_mapping": {"h1": "name", "h2": "section-title", "h3": "item-title", "ul": "list", "p": "description"},
        "is_builtin": True,
        "default_theme": {"primaryColor": "#1A1A1A", "fontFamily": "sans-serif", "fontSize": "base", "spacing": "normal"},
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
    {
        "id": "muji",
        "name": "墨纸极简",
        "description": "深色题头横幅 + 居中胶囊标题，黑白灰沉稳耐看",
        "thumbnail": "/templates/muji-thumb.svg",
        "css_styles": "/* muji template css */",
        "block_mapping": {"h1": "name", "h2": "section-title", "h3": "item-title", "ul": "list", "p": "description"},
        "is_builtin": True,
        "default_theme": {"primaryColor": "#39393A", "fontFamily": "sans-serif", "fontSize": "base", "spacing": "normal"},
    },
    {
        "id": "azure",
        "name": "青线极简",
        "description": "主题色细线标题 + 灰阶正文，留白克制、素净轻盈",
        "thumbnail": "/templates/azure-thumb.svg",
        "css_styles": "/* azure template css */",
        "block_mapping": {"h1": "name", "h2": "section-title", "h3": "item-title", "ul": "list", "p": "description"},
        "is_builtin": True,
        "default_theme": {"primaryColor": "#5974D4", "fontFamily": "sans-serif", "fontSize": "base", "spacing": "normal"},
    },
    {
        "id": "sunrise",
        "name": "朝阳暖橙",
        "description": "暖橙渐变题头 + 主题色标题线，明快有活力",
        "thumbnail": "/templates/sunrise-thumb.svg",
        "css_styles": "/* sunrise template css */",
        "block_mapping": {"h1": "name", "h2": "section-title", "h3": "item-title", "ul": "list", "p": "description"},
        "is_builtin": True,
        "default_theme": {"primaryColor": "#F9855D", "fontFamily": "sans-serif", "fontSize": "base", "spacing": "normal"},
    },
]


@router.get("", response_model=list[TemplateSchema])
async def list_templates():
    return BUILTIN_TEMPLATES
