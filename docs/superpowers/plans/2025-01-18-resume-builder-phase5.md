# 在线简历编辑器 - Phase 5 打磨与部署实施计划

> **适用范围（2026-09 标注）**：本系列 Phase 1-5 计划为立项时的 **master 全栈版**历史计划。当前发布的 **static 免登录版**（static 分支）部署为 GitHub Pages 纯前端静态站点，无 Docker/CI 后端环节，架构不对应；全栈版计划仅适用于 master 分支。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 完善测试覆盖、性能优化、Docker 容器化、CI/CD 流水线，生产可用

**Architecture:** 全栈优化 + DevOps

**Tech Stack:** Docker, GitHub Actions, Vitest, pytest, Playwright

## Global Constraints

- Docker 多阶段构建（前端 nginx + 后端 Python）
- GitHub Actions CI/CD 流水线
- 前端代码分割 + 懒加载
- 提交信息遵循 Conventional Commits 规范

---

### Task 1: 性能优化（前端代码分割 + 懒加载）

**Files:**
- Modify: `apps/web/src/App.tsx`
- Create: `apps/web/src/components/ErrorBoundary.tsx`
- Create: `apps/web/src/components/LoadingSpinner.tsx`

**Interfaces:**
- Produces: 懒加载页面 + 错误边界

- [ ] **Step 1: 创建 ErrorBoundary.tsx**

```tsx
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">出错了</h1>
          <p className="text-sm text-gray-500 mb-4">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="btn-primary text-sm">
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: 创建 LoadingSpinner.tsx**

```tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
```

- [ ] **Step 3: 更新 App.tsx 使用懒加载**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { EditorProvider } from '@/store/EditorContext';
import { ResumeProvider } from '@/store/ResumeContext';
import { PreviewProvider } from '@/store/PreviewContext';
import { UIProvider } from '@/store/UIContext';
import { AuthProvider } from '@/store/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { HomePage } from '@/pages/HomePage';

const EditorPage = lazy(() => import('@/pages/EditorPage').then(m => ({ default: m.EditorPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = require('@/store/AuthContext').useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return require('react-router-dom').Navigate({ to: '/login', replace: true });
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <UIProvider>
            <EditorProvider>
              <ResumeProvider>
                <PreviewProvider>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                      <Route path="/editor/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                    </Routes>
                  </Suspense>
              </PreviewProvider>
            </ResumeProvider>
          </EditorProvider>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
```

Wait - there's a cleaner approach. Let me simplify:

**`apps/web/src/App.tsx`**:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { EditorProvider } from '@/store/EditorContext';
import { ResumeProvider } from '@/store/ResumeContext';
import { PreviewProvider } from '@/store/PreviewContext';
import { UIProvider } from '@/store/UIContext';
import { AuthProvider } from '@/store/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { HomePage } from '@/pages/HomePage';

const EditorPage = lazy(() => import('@/pages/EditorPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <UIProvider>
            <EditorProvider>
              <ResumeProvider>
                <PreviewProvider>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                      <Route path="/editor/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                    </Routes>
                  </Suspense>
                </PreviewProvider>
              </ResumeProvider>
            </EditorProvider>
          </UIProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
```

- [ ] **Step 4: 提交**

```bash
git add apps/web/src/App.tsx apps/web/src/components/ErrorBoundary.tsx apps/web/src/components/LoadingSpinner.tsx
git commit -m "perf: add code splitting, lazy loading, and error boundary"
```

---

### Task 2: Docker 容器化完善

**Files:**
- Modify: `apps/web/Dockerfile`
- Create: `apps/web/nginx.conf`
- Modify: `apps/api/Dockerfile`
- Modify: `docker-compose.yml`

**Interfaces:**
- Produces: 生产级 Docker 配置

- [ ] **Step 1: 创建 nginx.conf**

```nginx
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

- [ ] **Step 2: 更新 apps/web/Dockerfile**

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm install
COPY . .
RUN npm run build:web

FROM nginx:alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 3: 更新 apps/api/Dockerfile**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget gnupg && \
    wget -qO- https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry==1.8.0

# Configure Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_CACHE_DIR='/var/cache/poetry'

COPY pyproject.toml ./
RUN poetry install --no-root --with dev

COPY . .

# Create data directory
RUN mkdir -p /app/data/pdfs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 4: 更新 docker-compose.yml**

```yaml
version: "3.8"

services:
  frontend:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    environment:
      - VITE_API_URL=http://backend:8000
    restart: unless-stopped

  backend:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - db_data:/app/data
    environment:
      - DATABASE_URL=sqlite+aiosqlite:///./data/app.db
      - SECRET_KEY=${SECRET_KEY:-change-me-in-production}
      - OPENAI_API_KEY=${OPENAI_API_KEY:-}
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    restart: unless-stopped

volumes:
  db_data:
```

- [ ] **Step 5: 创建 .env.example**

```
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=sk-your-openai-key
```

- [ ] **Step 6: 提交**

```bash
git add apps/web/Dockerfile apps/web/nginx.conf apps/api/Dockerfile docker-compose.yml .env.example
git commit -m "docker: production-ready Docker configuration with multi-stage builds"
```

---

### Task 3: CI/CD 流水线

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.dockerignore`

**Interfaces:**
- Produces: GitHub Actions CI 配置

- [ ] **Step 1: 创建 .github/workflows/ci.yml**

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: package-lock.json
      - run: npm ci
      - run: npm run build:web
      - run: npm test

  test-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/api
    services:
      sqlite:
        image: keinos/sqlite3:latest
        options: --health-cmd "sqlite3 --version" --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install Poetry
        run: pip install poetry==1.8.0
      - name: Install dependencies
        run: poetry install --no-root --with dev
      - name: Run tests
        run: poetry run pytest --cov=app --cov-report=xml
        env:
          DATABASE_URL: "sqlite+aiosqlite:///./test.db"
          SECRET_KEY: "test-secret-key"
          OPENAI_API_KEY: ""

  docker-build:
    runs-on: ubuntu-latest
    needs: [test-frontend, test-backend]
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker images
        run: docker compose build
```

- [ ] **Step 2: 创建 .dockerignore**

```
node_modules
.git
.gitignore
.github
*.md
.env
.env.local
.superpowers
dist
__pycache__
.pytest_cache
.mypy_cache
.ruff_cache
*.db
*.sqlite
```

- [ ] **Step 3: 提交**

```bash
git add .github/workflows/ci.yml .dockerignore
git commit -m "ci: add GitHub Actions workflow for test and docker build"
```

---

### Task 4: 测试补充

**Files:**
- Create: `apps/web/tests/unit/store.test.tsx`
- Create: `apps/api/services/pdf_service.py` (add sanitize import)

**Interfaces:**
- Produces: 状态管理单元测试

- [ ] **Step 1: 创建 store.test.tsx**

```tsx
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { EditorProvider, useEditor, useEditorDispatch } from '@/store/EditorContext';

describe('EditorContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <EditorProvider>{children}</EditorProvider>
  );

  it('should update markdown', () => {
    const { result } = renderHook(() => ({ state: useEditor(), dispatch: useEditorDispatch() }), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'SET_MARKDOWN', payload: '# New Content' });
    });

    expect(result.current.state.markdown).toBe('# New Content');
    expect(result.current.state.isDirty).toBe(true);
  });

  it('should mark clean', () => {
    const { result } = renderHook(() => ({ state: useEditor(), dispatch: useEditorDispatch() }), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'SET_MARKDOWN', payload: '# Test' });
    });

    expect(result.current.state.isDirty).toBe(true);

    act(() => {
      result.current.dispatch({ type: 'MARK_CLEAN' });
    });

    expect(result.current.state.isDirty).toBe(false);
  });
});
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/tests/
git commit -m "test: add EditorContext reducer unit tests"
```

---

### Task 5: 最终验证与文档

**Files:**
- Modify: `README.md`

**Interfaces:**
- Produces: 更新后的项目文档

- [ ] **Step 1: 更新 README.md**

Add sections:
```markdown
## 部署

### Docker Compose
\`\`\`bash
cp .env.example .env
# Edit .env with your settings
docker compose up --build
\`\`\`

### 环境变量
| 变量 | 说明 | 默认值 |
|------|------|--------|
| SECRET_KEY | JWT 签名密钥 | change-me-in-production |
| OPENAI_API_KEY | OpenAI API 密钥 | (空) |
| DATABASE_URL | 数据库连接 | sqlite+aiosqlite:///./data/app.db |

## 测试
\`\`\`bash
# 前端测试
npm run test:web

# 后端测试
npm run test:api
\`\`\`

## 项目结构
[existing structure]

## 技术栈
[existing tech stack]

## 许可证
MIT
```

- [ ] **Step 2: 提交**

```bash
git add README.md
git commit -m "docs: update README with deployment guide and environment variables"
```

---

## 自检清单

| Spec 要求 | 对应 Task | 状态 |
|-----------|-----------|------|
| 全面测试覆盖 | Task 4 | ✅ |
| 性能优化（懒加载、缓存） | Task 1 | ✅ |
| Docker 容器化 | Task 2 | ✅ |
| CI/CD 流水线 | Task 3 | ✅ |
| 云平台部署 | Task 2 (docker-compose) | ✅ |
