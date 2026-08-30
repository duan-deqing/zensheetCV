import os
import tempfile
import uuid

import pytest
from httpx import AsyncClient, ASGITransport

# 必须在导入 app 之前设置，确保测试使用独立的临时数据库，不污染开发库
_test_db_path = os.path.join(tempfile.gettempdir(), f"stylan_test_{uuid.uuid4().hex}.db")
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_test_db_path}"

from app.main import app  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import engine  # noqa: E402


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    await engine.dispose()
    try:
        os.remove(_test_db_path)
    except OSError:
        pass
