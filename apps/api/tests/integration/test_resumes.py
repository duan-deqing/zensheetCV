import pytest


@pytest.mark.asyncio
async def test_create_resume(client):
    response = await client.post("/api/v1/resumes", json={
        "title": "测试简历",
        "markdown": "# 测试\n\n## 经历\n",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "测试简历"
    assert data["id"] is not None


@pytest.mark.asyncio
async def test_list_resumes(client):
    response = await client.get("/api/v1/resumes")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
