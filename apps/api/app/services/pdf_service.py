import os
import re
import uuid
from pathlib import Path
from typing import Optional

from playwright.async_api import async_playwright, Browser

PDF_DIR = Path("./data/pdfs")
PDF_DIR.mkdir(parents=True, exist_ok=True)

class PDFService:
    _browser: Optional[Browser] = None

    @classmethod
    async def _get_browser(cls) -> Browser:
        if cls._browser is None or not cls._browser.is_connected():
            playwright = await async_playwright().start()
            cls._browser = await playwright.chromium.launch()
        return cls._browser

    @classmethod
    async def generate_pdf(cls, html: str, css: str) -> str:
        file_id = str(uuid.uuid4())
        pdf_path = PDF_DIR / f"{file_id}.pdf"
        browser = await cls._get_browser()
        page = await browser.new_page()

        full_html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>{css}</style></head>
<body>{html}</body>
</html>"""

        await page.set_content(full_html, wait_until="networkidle")
        await page.pdf(
            path=str(pdf_path),
            format="A4",
            print_background=True,
            margin={"top": "10mm", "right": "10mm", "bottom": "10mm", "left": "10mm"},
        )
        await page.close()
        return file_id

    @staticmethod
    def get_pdf_path(file_id: str) -> Path | None:
        if not re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', file_id, re.IGNORECASE):
            return None
        pdf_path = PDF_DIR / f"{file_id}.pdf"
        try:
            resolved = pdf_path.resolve()
            if not str(resolved).startswith(str(PDF_DIR.resolve())):
                return None
        except (OSError, ValueError):
            return None
        if pdf_path.exists():
            return pdf_path
        return None
