import pytest


async def _register_and_login(client, email: str) -> dict:
    await client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": "password123",
    })
    login = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "password123",
    })
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


@pytest.mark.asyncio
async def test_create_resume(client):
    headers = await _register_and_login(client, "create-resume@example.com")
    response = await client.post("/api/v1/resumes", json={
        "title": "测试简历",
        "markdown": "# 测试\n\n## 经历\n",
    }, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "测试简历"
    assert data["id"] is not None


@pytest.mark.asyncio
async def test_create_resume_limit(client):
    """每个用户最多创建 15 份简历：第 16 份返回 400"""
    headers = await _register_and_login(client, "limit-resume@example.com")
    for i in range(15):
        resp = await client.post("/api/v1/resumes", json={
            "title": f"简历 {i + 1}",
            "markdown": "# 测试\n",
        }, headers=headers)
        assert resp.status_code == 201
    resp = await client.post("/api/v1/resumes", json={
        "title": "第 16 份",
        "markdown": "# 测试\n",
    }, headers=headers)
    assert resp.status_code == 400
    assert "15" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_list_resumes(client):
    headers = await _register_and_login(client, "list-resumes@example.com")
    response = await client.get("/api/v1/resumes", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_resumes_require_auth(client):
    response = await client.get("/api/v1/resumes")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
