from pydantic import BaseModel


class TemplateSchema(BaseModel):
    id: str
    name: str
    description: str
    thumbnail: str
    css_styles: str
    block_mapping: dict[str, str]
    is_builtin: bool
    default_theme: dict[str, str]

    class Config:
        from_attributes = True
