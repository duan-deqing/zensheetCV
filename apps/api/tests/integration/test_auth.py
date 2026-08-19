import pytest


@pytest.mark.asyncio
async def test_register(client):
    response = await client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    await client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "dup@example.com",
        "password": "password123",
    })
    response = await client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "dup@example.com",
        "password": "password123",
    })
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login(client):
    await client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "login@example.com",
        "password": "password123",
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "password123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login@example.com"


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "wrong@example.com",
        "password": "password123",
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client):
    await client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "me@example.com",
        "password": "password123",
    })
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "me@example.com",
        "password": "password123",
    })
    token = login_res.json()["access_token"]
    response = await client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"


@pytest.mark.asyncio
async def test_resume_user_isolation(client):
    # Create user 1
    await client.post("/api/v1/auth/register", json={
        "name": "User 1",
        "email": "user1@example.com",
        "password": "password123",
    })
    login1 = await client.post("/api/v1/auth/login", json={
        "email": "user1@example.com", "password": "password123",
    })
    token1 = login1.json()["access_token"]

    # Create user 2
    await client.post("/api/v1/auth/register", json={
        "name": "User 2",
        "email": "user2@example.com",
        "password": "password123",
    })
    login2 = await client.post("/api/v1/auth/login", json={
        "email": "user2@example.com", "password": "password123",
    })
    token2 = login2.json()["access_token"]

    # User 1 creates a resume
    res = await client.post("/api/v1/resumes",
        json={"title": "User 1 Resume", "markdown": "# Test"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert res.status_code == 201
    resume_id = res.json()["id"]

    # User 2 cannot access it
    res2 = await client.get(f"/api/v1/resumes/{resume_id}",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert res2.status_code == 404
