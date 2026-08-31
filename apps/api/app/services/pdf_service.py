import asyncio
import os
import re
import sys
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Optional

# 若项目内存在 Playwright 浏览器目录，则优先使用（默认用户目录安装受限时的回退方案）
_LOCAL_BROWSERS_DIR = Path(__file__).resolve().parents[2] / ".playwright-browsers"
if _LOCAL_BROWSERS_DIR.exists():
    os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", str(_LOCAL_BROWSERS_DIR))

from playwright.async_api import async_playwright  # noqa: E402

PDF_DIR = Path("./data/pdfs")
PDF_DIR.mkdir(parents=True, exist_ok=True)


class PDFService:
    _executor: Optional[ThreadPoolExecutor] = None

    @classmethod
    def _get_executor(cls) -> ThreadPoolExecutor:
        # 单线程池：PDF 生成串行执行，避免并发启动多个 Chromium
        if cls._executor is None:
            cls._executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="pdf")
        return cls._executor

    @classmethod
    def _make_loop(cls) -> asyncio.AbstractEventLoop:
        # Windows 上 uvicorn 的事件循环为 SelectorEventLoop，不支持子进程；
        # Playwright 需要 ProactorEventLoop 才能启动 Chromium 子进程
        if sys.platform == "win32":
            return asyncio.ProactorEventLoop()
        return asyncio.new_event_loop()

    @classmethod
    def _generate_in_thread(cls, html: str, css: str, margin_x_mm: float = 0, margin_y_mm: float = 0) -> str:
        loop = cls._make_loop()
        try:
            asyncio.set_event_loop(loop)
            return loop.run_until_complete(cls._generate_pdf(html, css, margin_x_mm, margin_y_mm))
        finally:
            asyncio.set_event_loop(None)
            loop.close()

    @classmethod
    async def generate_pdf(cls, html: str, css: str, margin_x_mm: float = 0, margin_y_mm: float = 0) -> str:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            cls._get_executor(), cls._generate_in_thread, html, css, margin_x_mm, margin_y_mm
        )

    @classmethod
    async def _generate_pdf(cls, html: str, css: str, margin_x_mm: float = 0, margin_y_mm: float = 0) -> str:
        file_id = str(uuid.uuid4())
        pdf_path = PDF_DIR / f"{file_id}.pdf"

        full_html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>html, body {{ margin: 0; padding: 0; }}</style><style>{css}</style></head>
<body>{html}</body>
</html>"""

        async with async_playwright() as p:
            browser = await p.chromium.launch()
            try:
                page = await browser.new_page()
                await page.set_content(full_html, wait_until="networkidle")
                await page.pdf(
                    path=str(pdf_path),
                    format="A4",
                    print_background=True,
                    # 页边距由前端主题设置传入（与预览内边距一致）：
                    # margin_x_mm → 左右，margin_y_mm → 上下；
                    # 内容容器宽度已在导出时收窄，正文宽度与预览保持相同
                    margin={
                        "top": f"{margin_y_mm}mm",
                        "right": f"{margin_x_mm}mm",
                        "bottom": f"{margin_y_mm}mm",
                        "left": f"{margin_x_mm}mm",
                    },
                )
                await page.close()
            finally:
                await browser.close()
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

    @staticmethod
    def cleanup_old_pdfs(max_age_hours: int = 24) -> int:
        """Remove PDF files older than max_age_hours. Returns count of removed files."""
        now = time.time()
        removed = 0
        for pdf_file in PDF_DIR.glob("*.pdf"):
            if now - pdf_file.stat().st_mtime > max_age_hours * 3600:
                pdf_file.unlink()
                removed += 1
        return removed
