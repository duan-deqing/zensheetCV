# 在线简历编辑器 - 设计与技术规格

## 1. 项目概述

### 1.1 定位
个人学习/练手项目，目标是构建一个功能完整的在线简历制作平台。用户通过 Markdown 编辑简历内容，实时预览效果，选择定制模板，最终导出高质量 PDF 文件。后续阶段加入 AI 辅助写作能力。

### 1.2 参考项目
| 参考站点 | 核心特点 |
|---------|---------|
| [木及简历 mujicv.com](https://www.mujicv.com) | Markdown 编辑 + 实时预览 + 多模板 + PDF 导出，[开源](https://github.com/hua1995116/react-resume-site) |
| [老鱼简历 laoyujianli.com](https://www.laoyujianli.com) | AI 润色 + 关键词优化 + 多模板，[开源](https://github.com/liyupi/laoyujianli) |
| [lgdsunday.club](https://www.lgdsunday.club/) | 个人作品集风格参考 |

### 1.3 核心功能清单
- [ ] Markdown 编辑器（语法高亮、工具栏、快捷键）
- [ ] 实时预览（左右分栏，所见即所得）
- [ ] 多模板系统（内置模板 + 可扩展）
- [ ] 主题配置（颜色、字体、间距）
- [ ] PDF 导出（服务端高质量渲染）
- [ ] 用户系统（注册/登录/JWT）
- [ ] 简历管理（多份简历 CRUD）
- [ ] AI 内容润色
- [ ] AI 关键词优化
- [ ] AI 智能内容生成

---

## 2. 技术栈

### 2.1 前端技术栈

| 类别 | 技术 | 版本 | 选择理由 | 成熟度 | 应用广泛度 |
|------|------|------|---------|--------|-----------|
| 框架 | React | 18+ | 组件化开发，生态最丰富，Hooks 模式成熟 | ⭐⭐⭐⭐⭐ | 全球前端主导 |
| 语言 | TypeScript | 5+ | 类型安全，IDE 支持好，大中型项目标配 | ⭐⭐⭐⭐⭐ | 行业标配 |
| 构建工具 | Vite | 5+ | 启动极快，HMR 优秀，原生支持 TS | ⭐⭐⭐⭐⭐ | 新一代主流 |
| 样式方案 | Tailwind CSS | 3+ | 原子化 CSS，开发效率高，设计系统友好 | ⭐⭐⭐⭐⭐ | 增长最快 |
| Markdown 渲染 | react-markdown | 9+ | React 原生渲染，插件生态丰富 | ⭐⭐⭐⭐ | React 生态标准 |
| Markdown 插件 | remark-gfm | 4+ | GFM 支持（表格、删除线、任务列表） | ⭐⭐⭐⭐ | 广泛使用 |
| 代码编辑器 | CodeMirror 6 | 6+ | VS Code 同款核心，轻量可扩展 | ⭐⭐⭐⭐⭐ | 编辑器标准 |
| 路由 | react-router-dom | 6+ | React 路由标准方案 | ⭐⭐⭐⭐⭐ | React 标配 |
| 状态管理 | Context + useReducer | - | React 内置，无额外依赖，够用 | ⭐⭐⭐⭐⭐ | React 内置 |
| HTTP 客户端 | axios | - | 拦截器、请求取消、错误处理统一，TypeScript 友好 | ⭐⭐⭐⭐⭐ | 标准方案 |

**前端技术对比说明：**

| 决策点 | 选择 | 备选 | 对比结论 |
|--------|------|------|---------|
| 构建工具 | Vite | CRA / Webpack | Vite 开发体验远胜 CRA（已废弃），Webpack 配置复杂不适合学习项目 |
| CSS 方案 | Tailwind | CSS Modules / styled-components | Tailwind 开发最快，设计系统一致性好；CSS Modules 适合强隔离场景；styled-components 有运行时开销 |
| 编辑器 | CodeMirror 6 | Monaco / Slate | Monaco 太重（VS Code 级别），Slate 富文本框架学习成本高；CodeMirror 6 轻量够用 |
| 状态管理 | Context + useReducer | Zustand / Redux | 简历编辑器状态复杂度中等，Context 够用；后续复杂可无痛迁移到 Zustand |
| Markdown | react-markdown | marked / Showdown | react-markdown 与 React 生态最契合，支持组件映射 |

### 2.2 后端技术栈

| 类别 | 技术 | 版本 | 选择理由 | 成熟度 | 应用广泛度 |
|------|------|------|---------|--------|-----------|
| 语言 | Python | 3.11+ | AI/ML 生态最强，FastAPI 异步支持好 | ⭐⭐⭐⭐⭐ | 全球 Top 3 |
| Web 框架 | FastAPI | 0.110+ | 异步高性能，自动 OpenAPI 文档，类型注解 | ⭐⭐⭐⭐ | Python 最快框架 |
| ORM | SQLAlchemy | 2+ | Python ORM 标准，异步支持，查询灵活 | ⭐⭐⭐⭐⭐ | Python ORM 标准 |
| 数据库驱动 | aiosqlite | - | SQLite 异步驱动 | ⭐⭐⭐⭐ | 成熟稳定 |
| 数据验证 | Pydantic | 2+ | FastAPI 原生集成，类型安全 | ⭐⭐⭐⭐⭐ | Python 数据验证标准 |
| PDF 生成 | Playwright | 1.40+ | 渲染精确，CSS 支持完整，微软维护 | ⭐⭐⭐⭐⭐ | 测试/自动化标杆 |
| AI SDK | OpenAI SDK | 1+ | GPT 系列事实标准，生态最成熟 | ⭐⭐⭐⭐⭐ | LLM 领域标准 |
| 认证 | python-jose | - | JWT 签发与验证 | ⭐⭐⭐⭐ | 成熟稳定 |
| 密码哈希 | passlib[bcrypt] | - | 安全密码哈希 | ⭐⭐⭐⭐⭐ | 行业标准 |

**后端技术对比说明：**

| 决策点 | 选择 | 备选 | 对比结论 |
|--------|------|------|---------|
| Web 框架 | FastAPI | Flask / Django | FastAPI 异步性能远超 Flask，自动文档省去 Swagger 配置；Django 过重，学习曲线陡 |
| 数据库 | SQLite | PostgreSQL / MySQL | 学习项目够用，零配置，文件型便于备份；后续可迁移到 PostgreSQL |
| ORM | SQLAlchemy | Tortoise-ORM / Peewee | SQLAlchemy 生态最成熟，异步支持完善；Tortoise 更 Pythonic 但生态小 |
| PDF 引擎 | Playwright | Puppeteer / WeasyPrint | Playwright 跨浏览器支持好，API 现代；Puppeteer Chrome only；WeasyPrint CSS 支持差 |
| AI 接口 | OpenAI API | 国产模型 API | OpenAI 生态最成熟，文档完善；后续可抽象接口支持多提供商 |

### 2.3 测试技术栈

| 类别 | 工具 | 用途 |
|------|------|------|
| 前端单元/集成 | Vitest | Vite 原生测试框架，API 与 Jest 兼容 |
| 前端组件测试 | React Testing Library | 以用户视角测试组件 |
| API Mock | MSW (Mock Service Worker) | 拦截网络请求，前端集成测试 |
| E2E 测试 | Playwright | 端到端用户旅程测试 |
| 后端测试 | pytest | Python 测试标准框架 |
| 后端异步测试 | pytest-asyncio | 异步代码测试 |
| API 测试 | httpx.AsyncClient | FastAPI 异步测试客户端 |
| 代码覆盖 | coverage.py / vitest coverage | 测试覆盖率报告 |

### 2.4 部署与 DevOps

| 类别 | 技术 | 用途 |
|------|------|------|
| 容器化 | Docker | 应用容器化，环境一致性 |
| 编排 | docker-compose | 多容器编排（前端 + 后端） |
| CI/CD | GitHub Actions | 自动化测试与部署 |
| 云平台 | Railway / Vercel / 阿里云 | 应用部署（后续选择） |

---

## 3. 系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                     前端 (React + TS)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ 编辑器    │  │ 预览区    │  │ 模板选择  │  │ AI助手  │ │
│  │(CodeMirror)│ │(react-   │  │          │  │         │ │
│  │          │  │ markdown) │  │          │  │         │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                      Tailwind CSS                        │
│                     Vite 构建工具                         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / REST API
┌──────────────────────┴───────────────────────────────────┐
│                  后端 (Python + FastAPI)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ 简历CRUD  │  │ PDF生成   │  │ AI服务    │  │ 用户认证 │ │
│  │          │  │(Playwright)│ │(OpenAI)  │  │ (JWT)   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                  SQLAlchemy ORM                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                ┌──────┴──────┐
                │   SQLite    │
                │  (文件数据库) │
                └─────────────┘
```

### 3.2 Monorepo 目录结构

```
stylan_resume/
├── apps/
│   ├── web/                  # React 前端
│   │   ├── src/
│   │   │   ├── components/   # 通用 UI 组件
│   │   │   │   ├── ui/       # 基础 UI（Button, Input, Modal...）
│   │   │   │   └── layout/   # 布局组件
│   │   │   ├── editor/       # 编辑器模块
│   │   │   │   ├── MarkdownEditor.tsx
│   │   │   │   ├── Toolbar.tsx
│   │   │   │   └── shortcuts.ts
│   │   │   ├── preview/      # 预览模块
│   │   │   │   ├── ResumePreview.tsx
│   │   │   │   └── PreviewToolbar.tsx
│   │   │   ├── templates/    # 模板系统
│   │   │   │   ├── index.ts
│   │   │   │   ├── classic.ts
│   │   │   │   ├── modern.ts
│   │   │   │   ├── elegant.ts
│   │   │   │   └── tech.ts
│   │   │   ├── ai/           # AI 助手模块
│   │   │   │   ├── AIPanel.tsx
│   │   │   │   ├── useAI.ts
│   │   │   │   └── prompts.ts
│   │   │   ├── store/        # 状态管理
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── ResumeContext.tsx
│   │   │   │   ├── EditorContext.tsx
│   │   │   │   └── UIContext.tsx
│   │   │   ├── hooks/        # 自定义 Hooks
│   │   │   │   ├── useResume.ts
│   │   │   │   ├── useAutoSave.ts
│   │   │   │   ├── usePDFExport.ts
│   │   │   │   └── useKeyboardShortcut.ts
│   │   │   ├── types/        # TypeScript 类型定义
│   │   │   │   ├── resume.ts
│   │   │   │   ├── template.ts
│   │   │   │   └── user.ts
│   │   │   ├── utils/        # 工具函数
│   │   │   │   ├── debounce.ts
│   │   │   │   └── markdown.ts
│   │   │   ├── pages/        # 页面组件
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── EditorPage.tsx
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                  # FastAPI 后端
│       ├── app/
│       │   ├── main.py       # FastAPI 应用入口
│       │   ├── api/          # API 路由
│       │   │   └── v1/
│       │   │       ├── __init__.py
│       │   │       ├── resumes.py
│       │   │       ├── pdf.py
│       │   │       ├── ai.py
│       │   │       └── auth.py
│       │   ├── core/         # 核心配置
│       │   │   ├── config.py
│       │   │   ├── security.py
│       │   │   └── deps.py
│       │   ├── models/       # SQLAlchemy 模型
│       │   │   ├── user.py
│       │   │   └── resume.py
│       │   ├── schemas/      # Pydantic 请求/响应模型
│       │   │   ├── user.py
│       │   │   ├── resume.py
│       │   │   └── ai.py
│       │   ├── services/     # 业务逻辑层
│       │   │   ├── resume_service.py
│       │   │   ├── pdf_service.py
│       │   │   ├── ai_service.py
│       │   │   └── auth_service.py
│       │   └── db/           # 数据库连接
│       │       ├── base.py
│       │       └── session.py
│       ├── tests/
│       │   ├── unit/
│       │   └── integration/
│       ├── alembic/         # 数据库迁移
│       ├── pyproject.toml
│       └── Dockerfile
│
├── packages/
│   └── shared-types/         # 前后端共享类型定义
│       ├── src/
│       │   ├── resume.ts
│       │   ├── user.ts
│       │   └── api.ts
│       └── package.json
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
└── README.md
```

---

## 4. 数据模型设计

### 4.1 核心实体

```typescript
// 用户
interface User {
  id: string;               // UUID
  email: string;            // 唯一
  name: string;
  hashedPassword: string;
  avatar?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

// 简历
interface Resume {
  id: string;               // UUID
  userId: string;           // 外键 → User.id
  title: string;            // 简历名称
  markdown: string;         // Markdown 原文
  templateId: string;       // 当前模板 ID
  themeConfig: ThemeConfig; // 主题配置（JSON）
  createdAt: DateTime;
  updatedAt: DateTime;
}

// 主题配置
interface ThemeConfig {
  primaryColor: string;     // 主色调（HEX）
  fontFamily: string;       // 字体
  fontSize: string;         // 字号（sm/base/lg）
  spacing: string;          // 间距（compact/normal/relaxed）
}

// 模板（可硬编码或存数据库）
interface Template {
  id: string;
  name: string;             // 模板名称
  description: string;      // 模板描述
  thumbnail: string;        // 缩略图 URL
  cssStyles: string;        // 模板 CSS 内容
  blockMapping: Record<string, string>; // HTML 标签 → 简历区块映射
  isBuiltin: boolean;       // 是否内置模板
}
```

### 4.2 数据库 ER 图

```
┌──────────────┐       ┌──────────────┐
│    User      │       │   Resume     │
├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │
│ email (UQ)   │  │    │ userId (FK)  │
│ name         │  └───>│ title        │
│ hashedPass   │       │ markdown     │
│ avatar       │       │ templateId   │
│ createdAt    │       │ themeConfig  │
│ updatedAt    │       │ createdAt    │
└──────────────┘       │ updatedAt    │
                       └──────────────┘
```

---

## 5. API 设计

### 5.1 REST API 路由

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/v1/auth/register` | - | 用户注册 |
| POST | `/api/v1/auth/login` | - | 用户登录，返回 JWT |
| GET | `/api/v1/auth/me` | ✅ | 获取当前用户信息 |
| GET | `/api/v1/resumes` | ✅ | 获取当前用户所有简历 |
| POST | `/api/v1/resumes` | ✅ | 创建简历 |
| GET | `/api/v1/resumes/{id}` | ✅ | 获取简历详情 |
| PUT | `/api/v1/resumes/{id}` | ✅ | 更新简历 |
| DELETE | `/api/v1/resumes/{id}` | ✅ | 删除简历 |
| POST | `/api/v1/pdf/generate` | ✅ | 生成 PDF |
| GET | `/api/v1/pdf/download/{id}` | ✅ | 下载已生成 PDF |
| POST | `/api/v1/ai/polish` | ✅ | AI 内容润色 |
| POST | `/api/v1/ai/keywords` | ✅ | AI 关键词优化 |
| POST | `/api/v1/ai/generate` | ✅ | AI 智能内容生成 |
| GET | `/api/v1/templates` | - | 获取所有模板列表 |

### 5.2 关键请求/响应示例

**登录请求：**
```json
// POST /api/v1/auth/login
// Request
{ "email": "user@example.com", "password": "secure123" }

// Response 200
{ "access_token": "eyJ...", "token_type": "bearer", "user": { "id": "...", "email": "...", "name": "..." } }
```

**创建简历：**
```json
// POST /api/v1/resumes
// Request
{ "title": "我的简历", "markdown": "# 张三\n\n## 工作经历\n..." }

// Response 201
{ "id": "uuid", "title": "我的简历", "markdown": "...", "templateId": "classic", "themeConfig": { ... }, "createdAt": "...", "updatedAt": "..." }
```

**AI 润色（SSE 流式响应）：**
```json
// POST /api/v1/ai/polish
// Request
{ "text": "负责公司后端开发", "context": "工作经历" }

// Response (SSE)
data: {"delta": "负责公司后端架构设计与核心模块开发"}
data: {"delta": "，主导了微服务改造"}
data: {"delta": "，系统性能提升50%"}
data: {"done": true}
```

---

## 6. 前端组件设计

### 6.1 组件层级

```
App
├── Router
│   ├── Layout (导航栏 + 侧边栏)
│   │   ├── NavBar
│   │   │   ├── Logo
│   │   │   ├── TemplateSelector
│   │   │   ├── ThemeConfigPanel
│   │   │   ├── ExportButton
│   │   │   └── UserMenu
│   │   └── Sidebar
│   │       ├── ResumeList
│   │       └── NewResumeButton
│   │
│   ├── EditorPage (核心编辑页面)
│   │   ├── EditorPane (左栏)
│   │   │   ├── MarkdownEditor (CodeMirror)
│   │   │   │   ├── Toolbar (粗体/斜体/链接/列表等快捷按钮)
│   │   │   │   └── EditorArea
│   │   │   └── AIPolishPanel (AI 润色侧边面板)
│   │   │       ├── PolishInput
│   │   │       ├── PolishResult
│   │   │       └── ApplyButton
│   │   │
│   │   └── PreviewPane (右栏)
│   │       ├── PreviewToolbar (缩放/全屏)
│   │       └── PreviewCanvas
│   │           ├── ResumePreview (react-markdown 渲染)
│   │           └── 模板CSS注入
│   │
│   ├── LoginPage
│   ├── RegisterPage
│   └── HomePage (引导页)
```

### 6.2 核心自定义 Hooks

| Hook | 职责 | 依赖 |
|------|------|------|
| `useResume` | 简历 CRUD 操作，自动防抖保存 | ResumeContext, API |
| `useMarkdownParser` | Markdown → HTML 解析，支持自定义组件映射 | react-markdown |
| `useTemplate` | 模板加载、切换、主题配置应用 | PreviewContext |
| `usePDFExport` | PDF 生成请求、进度追踪、下载 | API |
| `useAI` | AI 润色/关键词/生成，流式响应处理 | SSE, API |
| `useAutoSave` | 自动保存逻辑（debounce + 后端同步） | useResume |
| `useKeyboardShortcut` | 编辑器快捷键绑定 | CodeMirror |

### 6.3 状态管理（Context + useReducer）

```
Store (React Context)
├── AuthContext        → 用户认证状态 + login/logout
├── ResumeContext      → 当前简历数据 + CRUD 操作
├── EditorContext      → 编辑器状态（内容、光标位置、脏标记）
├── PreviewContext     → 预览状态（当前模板、缩放比例）
└── UIContext          → 界面状态（侧边栏展开/折叠、模态框）
```

### 6.4 模板系统架构

```typescript
// 模板定义接口
interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  
  // 模板将 Markdown HTML 映射到简历区块
  blockMapping: {
    h1: 'name';           // 一级标题 → 姓名
    h2: 'section-title';  // 二级标题 → 区块标题
    h3: 'item-title';     // 三级标题 → 项目标题
    ul: 'list';           // 无序列表 → 列表项
    p: 'description';     // 段落 → 描述文本
    hr: 'divider';        // 分隔线
  };
  
  // 模板样式
  css: string;           // 完整 CSS 样式
  defaultTheme: ThemeConfig;
}

// 内置模板
const builtinTemplates: TemplateDefinition[] = [
  { id: 'classic', name: '经典简洁', ... },
  { id: 'modern', name: '现代设计', ... },
  { id: 'elegant', name: '优雅复古', ... },
  { id: 'tech', name: '技术极简', ... },
];
```

---

## 7. PDF 生成方案

### 7.1 生成流程

```
┌──────────────────────────────────────────────────┐
│                  PDF 生成服务                      │
│                                                    │
│  1. 接收简历 HTML + 模板 CSS                        │
│              │                                     │
│              ▼                                     │
│  2. 构建完整 HTML 文档（注入样式 + 字体）             │
│              │                                     │
│              ▼                                     │
│  3. Playwright 启动无头浏览器                        │
│              │                                     │
│              ▼                                     │
│  4. setContent(html) → 等待渲染完成                  │
│              │                                     │
│              ▼                                     │
│  5. page.pdf({                                     │
│       format: 'A4',                                 │
│       printBackground: true,                        │
│       margin: { top: '10mm', right: '10mm',         │
│                bottom: '10mm', left: '10mm' }      │
│     })                                             │
│              │                                     │
│              ▼                                     │
│  6. 返回 PDF 字节流 / 保存到磁盘                      │
│                                                    │
└──────────────────────────────────────────────────┘
```

### 7.2 PDF 技术对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Playwright** | 渲染精确，CSS 支持完整，可截图 | 启动稍慢（~200ms） | ⭐⭐⭐⭐⭐ |
| Puppeteer | 同上，生态更成熟 | Chrome only，更重 | ⭐⭐⭐⭐ |
| WeasyPrint | Python 原生，速度快 | CSS 支持不完整 | ⭐⭐⭐ |
| wkhtmltopdf | 轻量 | 渲染引擎老旧，CSS3 支持差 | ⭐⭐ |

### 7.3 性能优化
- **浏览器实例复用**：维护 Playwright 浏览器池，避免每次请求冷启动
- **页面缓存**：同一简历短时间重复导出使用缓存
- **超时控制**：单次生成设置 30s 超时
- **资源限制**：限制单用户并发导出数量

---

## 8. AI 功能设计

### 8.1 AI 服务架构

```
┌─────────────────────────────────────────────┐
│                 AI 服务模块                    │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 内容润色  │  │ 关键词优化 │  │ 内容生成  │  │
│  │          │  │          │  │          │  │
│  │ 输入:原文 │  │ 输入:JD  │  │ 输入:要点 │  │
│  │ 输出:润色 │  │ 输出:关键词│  │ 输出:描述 │  │
│  │ 后文本   │  │ + 匹配度  │  │ 文本     │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                              │
│  统一接口: POST /api/v1/ai/{action}          │
│  流式输出: SSE (Server-Sent Events)           │
│  LLM: OpenAI GPT-4o / GPT-4o-mini            │
└─────────────────────────────────────────────┘
```

### 8.2 AI 功能 Prompt 设计

| 功能 | System Prompt | 输入 | 输出 |
|------|--------------|------|------|
| 润色 | "你是资深简历优化专家。用户会提供一段简历内容，你需要：1) 使用更专业、有力的动词替换平淡表述；2) 尽可能加入量化成果（如用户提供了数据）；3) 保持原意不变；4) 输出简体中文。每次只优化一段，保持简洁。" | 原始经历描述（1-3 句） | 优化后的描述（1-3 句） |
| 关键词 | "你是求职顾问。用户提供目标职位描述(JD)和其简历内容。你需要：1) 从 JD 提取 5-10 个核心关键词/技能词；2. 标出简历中已包含和缺失的关键词；3. 给出 3 条具体的改进建议。输出 JSON 格式。" | JD 文本 + 简历 Markdown | `{ matched: string[], missing: string[], suggestions: string[] }` |
| 生成 | "你擅长帮技术人员撰写项目描述。用户提供项目要点列表，你需要按 STAR 情境(Situation)→任务(Task)→行动(Action)→结果(Result) 格式扩展成流畅的 2-3 段描述，使用专业术语，尽量量化成果。" | 项目要点列表（3-5 个短句） | STAR 格式的完整项目描述 |

### 8.3 AI 接口抽象
设计 AI Provider 接口，支持多 LLM 后端切换：
```python
class AIProvider(Protocol):
    async def polish(self, text: str, context: str) -> AsyncIterator[str]: ...
    async def analyze_keywords(self, jd: str, resume: str) -> dict: ...
    async def generate_content(self, points: list[str], context: str) -> AsyncIterator[str]: ...
```

---

## 9. 测试策略

### 9.1 测试金字塔

```
              ┌──────┐
              │ E2E  │  ← Playwright（关键用户旅程）
              │ 10%  │
            ┌─┴──────┴─┐
            │ 集成测试  │  ← Vitest + MSW（API 集成）
            │   20%    │
          ┌─┴──────────┴─┐
          │   单元测试     │  ← Vitest + pytest
          │    70%       │
          └──────────────┘
```

### 9.2 前端测试

| 类型 | 工具 | 覆盖目标 |
|------|------|---------|
| 单元测试 | Vitest + React Testing Library | 组件渲染、Hooks、工具函数 |
| 集成测试 | Vitest + MSW | API 调用、状态管理 |
| E2E 测试 | Playwright | 编辑→预览→导出完整流程 |

### 9.3 后端测试

| 类型 | 工具 | 覆盖目标 |
|------|------|---------|
| 单元测试 | pytest | 服务层、工具函数 |
| 集成测试 | pytest + httpx.AsyncClient | API 路由、数据库操作 |

---

## 10. 部署方案

### 10.1 容器化

```yaml
# docker-compose.yml
version: "3.8"
services:
  frontend:
    build: ./apps/web
    ports: ["3000:3000"]
    depends_on: [backend]
  backend:
    build: ./apps/api
    ports: ["8000:8000"]
    volumes:
      - db_data:/app/data
    environment:
      - DATABASE_URL=sqlite+aiosqlite:///./data/app.db
      - OPENAI_API_KEY=${OPENAI_API_KEY}
volumes:
  db_data:
```

### 10.2 CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test Frontend
        run: cd apps/web && npm ci && npm test
      - name: Test Backend
        run: cd apps/api && pip install -e . && pytest
```

---

## 11. 分阶段实施计划

```
Phase 1: 核心骨架（1-2 周）
├── 项目初始化（Monorepo + Vite + FastAPI）
├── 基础编辑器（CodeMirror + react-markdown 预览）
├── 左右分栏布局 + 一个基础模板
├── 后端 CRUD API + SQLite 存储
└── 基础 PDF 导出（Playwright）
    🎯 里程碑：能编辑 Markdown → 预览 → 导出 PDF

Phase 2: 模板与体验（1-2 周）
├── 内置 3-5 套模板 + 模板切换
├── 主题配置面板（颜色、字体、间距）
├── 自动保存 + 手动保存
├── 简历列表管理（多份简历）
└── 编辑器工具栏 + 快捷键
    🎯 里程碑：多模板切换体验流畅

Phase 3: 用户系统（1 周）
├── 注册/登录/登出
├── JWT 认证
├── 简历与用户关联
└── 路由守卫
    🎯 里程碑：支持多用户

Phase 4: AI 功能（1-2 周）
├── AI 内容润色
├── 关键词优化
├── AI 内容生成
├── SSE 流式输出
└── AI 使用限额管理
    🎯 里程碑：AI 辅助写作完整可用

Phase 5: 打磨与部署（1 周）
├── 全面测试覆盖
├── 性能优化（懒加载、缓存）
├── Docker 容器化
├── CI/CD 流水线
└── 云平台部署
    🎯 里程碑：生产可用，公网访问
```

---

## 12. 设计规范（Awwwards 标准）

### 12.1 设计原则

本项目视觉与交互设计参考 [Awwwards](https://www.awwwards.com) 获奖站点标准，核心设计原则如下：

| 原则 | 说明 | 实现方式 |
|------|------|---------|
| **极简主义** | 内容为王，去除一切多余装饰 | 大量留白、克制的配色、无冗余元素 |
| **排版驱动** | 字体本身就是设计元素 | 精心选择的字体层级、字重对比、行高优化 |
| **微交互** | 每个操作都有流畅的反馈 | 按钮悬停态、加载动画、过渡缓动 |
| **呼吸感** | 节奏明快，疏密有致 | 段落间距、模块间距形成韵律 |
| **一致性** | 全站视觉语言统一 | 设计令牌（颜色/间距/圆角/阴影） |

### 12.2 设计令牌（Design Tokens）

```css
/* 颜色系统 */
--color-primary: #2563EB;        /* 主色调：科技蓝 */
--color-primary-light: #3B82F6;  /* 浅主色 */
--color-primary-dark: #1D4ED8;   /* 深主色 */
--color-accent: #F59E0B;         /* 强调色：琥珀 */
--color-text-primary: #111827;   /* 主文本：深灰黑 */
--color-text-secondary: #6B7280; /* 副文本：中灰 */
--color-text-muted: #9CA3AF;      /* 弱化文本：浅灰 */
--color-bg-primary: #FFFFFF;     /* 主背景：白 */
--color-bg-secondary: #F9FAFB;   /* 副背景：浅灰 */
--color-border: #E5E7EB;         /* 边框 */

/* 间距系统（8px 基准） */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;

/* 字体 */
--font-sans: 'Inter', 'Noto Sans SC', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* 圆角 */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;

/* 阴影 */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);

/* 过渡 */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
```

### 12.3 字体方案

| 用途 | 字体 | 备选 | 加载方式 |
|------|------|------|---------|
| 标题 | Inter | Poppins | Google Fonts |
| 正文 | Inter | Noto Sans SC | Google Fonts |
| 代码/Markdown | JetBrains Mono | Fira Code | Google Fonts |

**字体层级：**
- H1: 30px / 700 / -0.02em
- H2: 24px / 600 / -0.01em
- H3: 20px / 600
- Body: 16px / 400 / 1.6 line-height
- Small: 14px / 400
- XS: 12px / 400

### 12.4 交互动效规范

| 场景 | 动效 | 时长 | 缓动函数 |
|------|------|------|---------|
| 按钮悬停 | 背景色微变 + 轻微上移 | 150ms | ease-out |
| 卡片悬停 | 阴影加深 + 微缩放 | 250ms | ease-out |
| 页面切换 | 淡入淡出 + 微滑动 | 300ms | ease-in-out |
| 模态框 | 缩放 + 淡入 | 200ms | spring |
| 模板切换 | 交叉淡入 | 400ms | ease-in-out |
| 内容保存 | 顶部 toast 滑入 | 300ms | ease-out |
| 加载状态 | 骨架屏 shimmer | 循环 | linear |

### 12.5 响应式断点

| 断点 | 宽度 | 布局调整 |
|------|------|---------|
| 桌面大屏 | ≥1440px | 编辑/预览可扩展到更宽区域 |
| 桌面 | ≥1024px | 左右分栏，各 50% |
| 平板 | ≥768px | 左右分栏，编辑 45% / 预览 55% |
| 手机 | <768px | 上下堆叠，可切换编辑/预览 |

### 12.6 无障碍（Accessibility）

| 要求 | 实现 |
|------|------|
| 色彩对比度 | 文本与背景对比度 ≥ 4.5:1（WCAG AA） |
| 键盘导航 | 所有交互元素可 Tab 聚焦，可见 focus ring |
| ARIA 标签 | 图标按钮、工具栏、模态框均有 aria-label |
| 语义化 HTML | 正确使用 header/main/nav/section/button |
| 减少动画 | 尊重 `prefers-reduced-motion` 媒体查询 |

### 12.7 关键页面线框示意

**编辑器页面（核心）：**
```
┌──────────────────────────────────────────────────────────┐
│  [Logo]  模板:[经典▼]  主题:[🔵]    [AI助手] [导出PDF] [👤] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │  ┌───────────────┐  │  │                         │   │
│  │  │  B I U  H 🔗 │  │  │   实时预览              │   │
│  │  └───────────────┘  │  │                         │   │
│  │                     │  │   ┌─────────────────┐   │   │
│  │  # 张三             │  │   │  张三          │   │   │
│  │                     │  │   │  前端工程师     │   │   │
│  │  ## 工作经历        │  │   │  ─────────────  │   │   │
│  │                     │  │   │                 │   │   │
│  │  ### ABC公司        │  │   │  ABC公司        │   │   │
│  │  - 负责前端开发     │  │   │  负责前端开发   │   │   │
│  │  - 优化性能提升50%  │  │   │  优化性能提升50%│   │   │
│  │                     │  │   │                 │   │   │
│  │  ## 项目经验        │  │   │  ─────────────  │   │   │
│  │  ...                │  │   │  ...            │   │   │
│  │                     │  │   │                 │   │   │
│  └─────────────────────┘  └─────────────────────────┘   │
│       编辑区                      预览区                  │
└──────────────────────────────────────────────────────────┘
```

---

## 13. 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| Playwright 冷启动慢 | 高 | 中 | 浏览器池复用、预热 |
| OpenAI API 成本 | 中 | 低 | 使用 GPT-4o-mini、缓存结果、限额 |
| CSS 样式 PDF 渲染差异 | 中 | 中 | Playwright 打印 CSS 专项测试 |
| 跨域问题 | 低 | 低 | FastAPI CORS 中间件、开发代理 |

---

## 14. 技术栈总览

| 层级 | 技术 | 成熟度 | 应用广泛度 |
|------|------|--------|-----------|
| **前端** | | | |
| 框架 | React 18 | ⭐⭐⭐⭐⭐ | 全球前端主导 |
| 语言 | TypeScript 5 | ⭐⭐⭐⭐⭐ | 大中型项目标配 |
| 构建 | Vite 5 | ⭐⭐⭐⭐⭐ | 新一代主流 |
| 样式 | Tailwind CSS 3 | ⭐⭐⭐⭐⭐ | 增长最快 |
| Markdown | react-markdown 9 | ⭐⭐⭐⭐ | React 生态标准 |
| 编辑器 | CodeMirror 6 | ⭐⭐⭐⭐⭐ | VS Code 同款核心 |
| 路由 | react-router-dom 6 | ⭐⭐⭐⭐⭐ | React 标配 |
| 状态 | Context + useReducer | ⭐⭐⭐⭐⭐ | React 内置 |
| **后端** | | | |
| 语言 | Python 3.11 | ⭐⭐⭐⭐⭐ | 全球 Top 3 |
| 框架 | FastAPI | ⭐⭐⭐⭐ | Python 最快框架 |
| ORM | SQLAlchemy 2 | ⭐⭐⭐⭐⭐ | Python ORM 标准 |
| 数据库 | SQLite | ⭐⭐⭐⭐⭐ | 嵌入式数据库之王 |
| PDF | Playwright | ⭐⭐⭐⭐⭐ | 微软开源标杆 |
| AI | OpenAI API | ⭐⭐⭐⭐⭐ | LLM 事实标准 |
| **测试** | | | |
| 前端测试 | Vitest | ⭐⭐⭐⭐ | Vite 原生 |
| E2E | Playwright | ⭐⭐⭐⭐⭐ | 行业标杆 |
| 后端测试 | pytest | ⭐⭐⭐⭐⭐ | Python 标准 |
| **DevOps** | | | |
| 容器 | Docker | ⭐⭐⭐⭐⭐ | 行业标准 |
| CI/CD | GitHub Actions | ⭐⭐⭐⭐⭐ | 最主流 |
