# Stylan Resume - 在线简历编辑器

> 通过 Markdown 编辑简历，选择定制模板，导出高质量 PDF

## 功能

- Markdown 实时编辑与预览（左右分栏，所见即所得）
- 4 套精美简历模板（经典 / 现代 / 优雅 / 技术）
- 主题配置（颜色、字体、字号、间距自定义）
- 服务端 PDF 导出（Playwright 高质量渲染）
- 用户系统（注册 / 登录 / JWT 认证）
- AI 辅助写作（内容润色 / 关键词优化 / 智能生成，基于 OpenAI GPT-4o-mini）
- 多简历管理（CRUD、分页）
- 响应式布局

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18 + TypeScript + Vite + Tailwind CSS + CodeMirror |
| **后端** | Python + FastAPI + SQLAlchemy (async) + Pydantic v2 |
| **数据库** | SQLite (aiosqlite) |
| **PDF** | Playwright + Jinja2 |
| **AI** | OpenAI GPT-4o-mini |
| **认证** | JWT (python-jose) + bcrypt |
| **部署** | Docker + Docker Compose |
| **CI** | GitHub Actions |

## 快速开始

### 前置要求

- Node.js ≥ 18
- Python ≥ 3.11
- Poetry ≥ 1.8

### 安装

```bash
# 安装前端依赖 (monorepo root)
npm install

# 安装后端依赖
cd apps/api && poetry install
```

### 开发

```bash
# 同时启动前后端 (从项目根目录)
npm run dev

# 或分别启动
npm run dev:web      # 前端: http://localhost:5173
npm run dev:api      # 后端: http://localhost:8000
```

### API 文档

后端启动后访问: <http://localhost:8000/docs> (Swagger UI)
ReDoc: <http://localhost:8000/redoc>

---

## 部署

### Docker Compose (推荐)

```bash
# 1. 复制并编辑环境变量
cp .env.example .env
# 编辑 .env 配置你的 SECRET_KEY 和 OPENAI_API_KEY

# 2. 构建并启动
docker compose up --build

# 服务地址
# 前端: http://localhost:3000
# 后端: http://localhost:8000
```

**容器说明:**

| 服务 | 端口 | 说明 |
|------|------|------|
| `frontend` | 3000 | Vite 生产构建，Nginx 静态托管 |
| `backend` | 8000 | FastAPI + Uvicorn |

后端挂载卷 `db_data` 持久化 SQLite 数据库，并配置了健康检查 (`/health`)。

### 手动部署

**前端构建:**

```bash
npm run build:web
# 产物输出到 apps/web/dist，可托管到任意静态文件服务器
```

**后端启动:**

```bash
cd apps/api
poetry install --no-root
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

> 部署前请确保已正确配置环境变量 (见下方)。

---

## 环境变量

后端通过 `pydantic-settings` 从 `.env` 文件读取配置。创建 `apps/api/.env` 或在部署环境中导出变量。

| 变量 | 说明 | 默认值 | 必填 |
|------|------|--------|------|
| `APP_NAME` | 应用名称 | `Stylan Resume API` | 否 |
| `APP_VERSION` | 应用版本 | `0.1.0` | 否 |
| `DEBUG` | 调试模式 | `True` | 否 |
| `DATABASE_URL` | 数据库连接字符串 | `sqlite+aiosqlite:///./app.db` | 否 |
| `SECRET_KEY` | JWT 签名密钥 (生产环境必须修改) | `change-me-in-production` | **是** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token 过期时间 (分钟) | `10080` (7 天) | 否 |
| `OPENAI_API_KEY` | OpenAI API 密钥 | (空) | **是** (AI 功能) |
| `OPENAI_MODEL` | OpenAI 模型 | `gpt-4o-mini` | 否 |
| `CORS_ORIGINS` | 允许的 CORS 来源 (JSON 数组) | `["http://localhost:5173","http://localhost:3000"]` | 否 |

**最小生产配置 (`.env`):**

```env
SECRET_KEY=your-strong-random-secret-key
OPENAI_API_KEY=sk-your-openai-api-key
DEBUG=False
CORS_ORIGINS=["https://your-domain.com"]
```

---

## 测试

```bash
# 前端测试 (Vitest)
npm run test:web

# 后端测试 (Pytest + pytest-asyncio)
npm run test:api

# 前端代码检查
npm run lint:web
```

CI 流水线 (`.github/workflows/ci.yml`) 在每次 push / PR 时自动运行前端构建、后端测试 (含覆盖率) 以及 Docker 镜像构建验证。

---

## API 路由

所有 API 前缀为 `/api/v1`。

| 模块 | 路由 | 说明 |
|------|------|------|
| **认证** | `POST /auth/register` | 用户注册 |
| | `POST /auth/login` | 用户登录，返回 JWT |
| | `GET /auth/me` | 获取当前用户信息 |
| **简历** | `GET /resumes` | 获取当前用户简历列表 (分页) |
| | `POST /resumes` | 创建简历 |
| | `GET /resumes/{id}` | 获取简历详情 |
| | `PUT /resumes/{id}` | 更新简历 |
| | `DELETE /resumes/{id}` | 删除简历 |
| **模板** | `GET /templates` | 获取内置模板列表 |
| **PDF** | `POST /pdf/generate` | 生成 PDF (返回下载链接) |
| | `GET /pdf/download/{file_id}` | 下载生成的 PDF |
| **AI** | `POST /ai/polish` | 润色文本 (SSE 流式) |
| | `POST /ai/keywords` | 分析 JD 关键词匹配 |
| | `POST /ai/generate` | 智能生成内容 (SSE 流式) |

---

## 项目结构

```
stylan_resume/
├── apps/
│   ├── web/                       # React 前端 (Vite)
│   │   ├── src/
│   │   │   ├── api/               # API 请求客户端 (axios)
│   │   │   ├── components/        # 通用 UI 组件
│   │   │   │   ├── AIPanel.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── ResumeList.tsx
│   │   │   │   ├── SaveButton.tsx
│   │   │   │   ├── ThemeConfigPanel.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── TopBar.tsx
│   │   │   ├── editor/            # Markdown 编辑器模块
│   │   │   │   ├── MarkdownEditor.tsx
│   │   │   │   ├── Toolbar.tsx
│   │   │   │   └── shortcuts.ts
│   │   │   ├── hooks/             # 自定义 Hooks
│   │   │   │   ├── useAI.ts
│   │   │   │   ├── useAutoSave.ts
│   │   │   │   ├── useKeyboardShortcut.ts
│   │   │   │   ├── usePDFExport.ts
│   │   │   │   ├── useResume.ts
│   │   │   │   └── useToast.ts
│   │   │   ├── pages/             # 页面组件
│   │   │   │   ├── EditorPage.tsx
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── preview/           # 简历预览模块
│   │   │   │   ├── PreviewToolbar.tsx
│   │   │   │   └── ResumePreview.tsx
│   │   │   ├── store/             # 状态管理 (React Context)
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── EditorContext.tsx
│   │   │   │   ├── PreviewContext.tsx
│   │   │   │   ├── ResumeContext.tsx
│   │   │   │   └── UIContext.tsx
│   │   │   ├── templates/         # 简历模板定义
│   │   │   │   ├── classic.ts
│   │   │   │   ├── elegant.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── modern.ts
│   │   │   │   └── tech.ts
│   │   │   ├── App.tsx            # 应用入口与路由
│   │   │   ├── main.tsx           # React DOM 挂载
│   │   │   └── vite-env.d.ts
│   │   ├── tests/
│   │   │   ├── setup.ts
│   │   │   └── unit/
│   │   │       ├── MarkdownEditor.test.tsx
│   │   │       └── store.test.tsx
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   └── vite.config.ts
│   │
│   └── api/                       # FastAPI 后端
│       ├── app/
│       │   ├── api/v1/            # API 路由层
│       │   │   ├── ai.py          # AI 辅助写作接口
│       │   │   ├── auth.py        # 认证接口
│       │   │   ├── pdf.py         # PDF 生成接口
│       │   │   ├── resumes.py     # 简历 CRUD 接口
│       │   │   └── templates.py   # 模板接口
│       │   ├── core/              # 核心配置
│       │   │   ├── config.py      # Pydantic Settings
│       │   │   ├── deps.py        # 依赖注入 (get_db)
│       │   │   └── security.py    # JWT / 密码工具
│       │   ├── db/                # 数据库
│       │   │   ├── base.py        # SQLAlchemy Base
│       │   │   └── session.py      # 异步引擎 / Session
│       │   ├── models/            # SQLAlchemy 模型
│       │   │   ├── resume.py
│       │   │   └── user.py
│       │   ├── schemas/           # Pydantic 模型
│       │   │   ├── ai.py
│       │   │   ├── pdf.py
│       │   │   ├── resume.py
│       │   │   ├── template.py
│       │   │   └── user.py
│       │   ├── services/          # 业务逻辑
│       │   │   ├── ai_service.py
│       │   │   ├── auth_service.py
│       │   │   ├── pdf_service.py
│       │   │   └── resume_service.py
│       │   └── main.py            # FastAPI 应用入口
│       ├── tests/
│       │   ├── conftest.py
│       │   └── integration/
│       │       ├── test_ai.py
│       │       ├── test_auth.py
│       │       ├── test_resumes.py
│       │       └── test_templates.py
│       └── pyproject.toml
│
├── packages/
│   └── shared-types/              # 前后端共享类型
│       ├── src/
│       │   ├── api.ts
│       │   ├── index.ts
│       │   ├── resume.ts
│       │   └── user.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   └── superpowers/
│       ├── plans/                 # 各阶段实施计划
│       └── specs/                 # 设计规格
│
├── .github/workflows/ci.yml       # CI 配置
├── .env.example                   # 环境变量模板
├── docker-compose.yml             # Docker 编排
├── package.json                   # Monorepo 根配置
└── README.md
```

## 许可证

MIT
