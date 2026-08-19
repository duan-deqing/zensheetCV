import pytest


@pytest.mark.asyncio
async def test_list_templates(client):
    response = await client.get("/api/v1/templates")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["id"] == "classic"
