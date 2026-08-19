import os
import uuid
from pathlib import Path

from playwright.async_api import async_playwright

PDF_DIR = Path("./data/pdfs")
PDF_DIR.mkdir(parents=True, exist_ok=True)


class PDFService:
    @staticmethod
    async def generate_pdf(html: str, css: str) -> str:
        """Generate PDF from HTML+CSS, return file_id"""
        file_id = str(uuid.uuid4())
        pdf_path = PDF_DIR / f"{file_id}.pdf"

        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()

            full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>{css}</style>
</head>
<body>{html}</body>
</html>"""

            await page.set_content(full_html, wait_until="networkidle")
            await page.pdf(
                path=str(pdf_path),
                format="A4",
                print_background=True,
                margin={"top": "10mm", "right": "10mm", "bottom": "10mm", "left": "10mm"},
            )
            await browser.close()

        return file_id

    @staticmethod
    def get_pdf_path(file_id: str) -> Path | None:
        pdf_path = PDF_DIR / f"{file_id}.pdf"
        if pdf_path.exists():
            return pdf_path
        return None
