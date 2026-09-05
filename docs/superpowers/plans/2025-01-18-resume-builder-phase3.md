# 在线简历编辑器 - Phase 3 用户系统实施计划

> **适用范围（2026-09 标注）**：本系列 Phase 1-5 计划为立项时的 **master 全栈版**历史计划。当前发布的 **static 免登录版**（static 分支）为纯前端实现，无用户系统（本地访客），架构不对应；全栈版计划仅适用于 master 分支。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 实现用户注册、登录、JWT 认证，简历与用户关联，以及路由守卫

**架构:** FastAPI JWT 认证 + React 路由守卫 + 用户上下文

**Tech Stack:** React 18, TypeScript 5, FastAPI, python-jose, passlib[bcrypt]

## Global Constraints

- JWT 使用 HS256 算法，密钥来自 settings.SECRET_KEY
- Token 有效期 7 天
- 密码使用 bcrypt 哈希
- 所有认证路由使用 HTTP Bearer Token
- 提交信息遵循 Conventional Commits 规范

---

### Task 1: 后端认证服务

**Files:**
- Create: `apps/api/app/services/auth_service.py`
- Modify: `apps/api/app/api/v1/auth.py`

**Interfaces:**
- Produces: `AuthService` 类
- Produces: `/api/v1/auth/{register,login,me}` 端点

- [ ] **Step 1: 创建 auth_service.py**

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from app.models import UserModel
from app.schemas import UserCreate, LoginRequest, LoginResponse, UserSchema
from app.core.security import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: UserCreate) -> UserModel:
        # Check if user exists
        result = await self.db.execute(
            select(UserModel).where(UserModel.email == data.email)
        )
        if result.scalar_one_or_none():
            raise ValueError("Email already registered")

        user = UserModel(
            email=data.email,
            name=data.name,
            hashed_password=pwd_context.hash(data.password),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def authenticate(self, data: LoginRequest) -> LoginResponse:
        result = await self.db.execute(
            select(UserModel).where(UserModel.email == data.email)
        )
        user = result.scalar_one_or_none()

        if not user or not pwd_context.verify(data.password, user.hashed_password):
            raise ValueError("Invalid email or password")

        access_token = create_access_token(subject=user.id)
        user_schema = UserSchema.model_validate(user)
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_schema,
        )

    async def get_current_user(self, token: str) -> UserModel | None:
        from app.core.security import verify_access_token
        payload = verify_access_token(token)
        if not payload:
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        return result.scalar_one_or_none()
```

- [ ] **Step 2: 创建/更新 auth.py 路由**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.schemas import UserCreate, LoginRequest, LoginResponse, UserSchema
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        user = await service.register(data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        return await service.authenticate(data)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", response_model=UserSchema)
async def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    user = await service.get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user
```

- [ ] **Step 3: 更新 main.py**

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.v1 import resumes, templates, pdf, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(resumes.router, prefix="/api/v1")
app.include_router(templates.router, prefix="/api/v1")
app.include_router(pdf.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
```

- [ ] **Step 4: 更新 resumes.py 使用真实认证**

Replace `user_id: str = "temp-user-id"` in all resume routes with proper auth dependency:
```python
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.schemas import ResumeSchema, ResumeCreate, ResumeUpdate, ResumeListSchema
from app.services.resume_service import ResumeService
from app.services.auth_service import AuthService

router = APIRouter(prefix="/resumes", tags=["resumes"])
security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> str:
    service = AuthService(db)
    user = await service.get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user.id


@router.get("", response_model=ResumeListSchema)
async def list_resumes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = ResumeService(db)
    items, total = await service.list_by_user(user_id, skip, limit)
    return {"items": items, "total": total}


@router.post("", response_model=ResumeSchema, status_code=status.HTTP_201_CREATED)
async def create_resume(
    data: ResumeCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = ResumeService(db)
    resume = await service.create(user_id, data)
    return resume


@router.get("/{resume_id}", response_model=ResumeSchema)
async def get_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = ResumeService(db)
    resume = await service.get_by_id(resume_id, user_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.put("/{resume_id}", response_model=ResumeSchema)
async def update_resume(
    resume_id: str,
    data: ResumeUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = ResumeService(db)
    resume = await service.get_by_id(resume_id, user_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    updated = await service.update(resume, data)
    return updated


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    service = ResumeService(db)
    resume = await service.get_by_id(resume_id, user_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    await service.delete(resume)
```

Also update `pdf.py` with the same auth dependency (replace `user_id: str = "temp-user-id"` pattern if any).

- [ ] **Step 5: 提交**

```bash
git add apps/api/app/
git commit -m "feat(auth): add user registration, login, and JWT authentication"
```

---

### Task 2: 前端认证上下文与路由守卫

**Files:**
- Create: `apps/web/src/store/AuthContext.tsx`
- Create: `apps/web/src/components/ProtectedRoute.tsx`

**Interfaces:**
- Produces: `AuthProvider`, `useAuth` hook
- Produces: `ProtectedRoute` 组件

- [ ] **Step 1: 创建 AuthContext.tsx**

```tsx
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '@/api/client';
import type { User, LoginRequest, UserCreate } from '@stylan/shared-types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: UserCreate) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiClient.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    try {
      const res = await apiClient.post('/auth/login', data);
      const { access_token, user: userData } = res.data;
      localStorage.setItem('access_token', access_token);
      setUser(userData);
      return true;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (data: UserCreate) => {
    try {
      await apiClient.post('/auth/register', data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

- [ ] **Step 2: 创建 ProtectedRoute.tsx**

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/store/AuthContext.tsx apps/web/src/components/ProtectedRoute.tsx
git commit -m "feat(auth): add AuthContext and ProtectedRoute for frontend auth"
```

---

### Task 3: 登录与注册页面

**Files:**
- Create: `apps/web/src/pages/LoginPage.tsx`
- Create: `apps/web/src/pages/RegisterPage.tsx`

**Interfaces:**
- Produces: `LoginPage` 组件
- Produces: `RegisterPage` 组件

- [ ] **Step 1: 创建 LoginPage.tsx**

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login({ email, password });
    if (success) {
      navigate('/editor');
    } else {
      setError('邮箱或密码错误');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">登录</h1>
        <p className="text-sm text-gray-500 text-center mb-6">登录您的 Stylan Resume 账户</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          还没有账户？{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 RegisterPage.tsx**

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import type { UserCreate } from '@stylan/shared-types';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('密码至少需要 6 个字符');
      return;
    }
    setLoading(true);
    const success = await register({ name, email, password } as UserCreate);
    if (success) {
      navigate('/login');
    } else {
      setError('注册失败，该邮箱可能已被使用');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">注册</h1>
        <p className="text-sm text-gray-500 text-center mb-6">创建您的 Stylan Resume 账户</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="您的姓名"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="至少 6 个字符"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          已有账户？{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/pages/LoginPage.tsx apps/web/src/pages/RegisterPage.tsx
git commit -m "feat(auth): add LoginPage and RegisterPage components"
```

---

### Task 4: 前端路由集成与 App 更新

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/components/TopBar.tsx`

**Interfaces:**
- Produces: 更新后的 App 路由（含认证路由 + 受保护路由）

- [ ] **Step 1: 更新 App.tsx**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EditorProvider } from '@/store/EditorContext';
import { ResumeProvider } from '@/store/ResumeContext';
import { PreviewProvider } from '@/store/PreviewContext';
import { UIProvider } from '@/store/UIContext';
import { AuthProvider } from '@/store/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { EditorPage } from '@/pages/EditorPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <EditorProvider>
            <ResumeProvider>
              <PreviewProvider>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/editor"
                    element={<ProtectedRoute><EditorPage /></ProtectedRoute>}
                  />
                  <Route
                    path="/editor/:id"
                    element={<ProtectedRoute><EditorPage /></ProtectedRoute>}
                  />
                </Routes>
              </PreviewProvider>
            </ResumeProvider>
          </EditorProvider>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 2: 更新 TopBar.tsx 添加用户信息**

```tsx
import { useUI } from '@/store/UIContext';
import { useAuth } from '@/store/AuthContext';
import { SaveButton } from '@/components/SaveButton';
import { ThemeConfigPanel } from '@/components/ThemeConfigPanel';

export function TopBar() {
  const { toggleThemePanel, themePanelOpen } = useUI();
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 relative">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-gray-900">Stylan Resume</h1>
      </div>
      <div className="flex items-center gap-2">
        <SaveButton />
        <button
          onClick={toggleThemePanel}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            themePanelOpen
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎨 主题
        </button>
        <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          📄 导出 PDF
        </button>
        {user && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
            <span className="text-xs text-gray-600">{user.name}</span>
            <button
              onClick={logout}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              退出
            </button>
          </div>
        )}
      </div>
      <ThemeConfigPanel />
    </header>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/App.tsx apps/web/src/components/TopBar.tsx
git commit -m "feat(auth): integrate auth routes and update App with ProtectedRoute"
```

---

### Task 5: Phase 3 测试与验证

**Files:**
- Create: `apps/api/tests/integration/test_auth.py`
- Create: `apps/web/tests/integration/auth.test.tsx`

**Interfaces:**
- Produces: 认证集成测试

- [ ] **Step 1: 创建后端认证测试**

```python
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
    # First registration
    await client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "dup@example.com",
        "password": "password123",
    })
    # Duplicate
    response = await client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "dup@example.com",
        "password": "password123",
    })
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login(client):
    # Register first
    await client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "login@example.com",
        "password": "password123",
    })
    # Login
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
    # Register and get token
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

    # Get current user
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
```

- [ ] **Step 2: 提交测试**

```bash
git add apps/api/tests/
git commit -m "test(auth): add comprehensive auth integration tests"
```

---

## 自检清单

| Spec 要求 | 对应 Task | 状态 |
|-----------|-----------|------|
| 注册/登录/登出 | Task 1, 3 | ✅ |
| JWT 认证 | Task 1 | ✅ |
| 简历与用户关联 | Task 1 (resumes.py) | ✅ |
| 路由守卫 | Task 2, 4 | ✅ |
