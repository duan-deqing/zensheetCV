# ZENSHEET · 简历

<p align="center">
  <a href="https://github.com/duan-deqing/zensheetCV" target="_blank" rel="noopener noreferrer">
    <strong>ZENSHEET · 简历</strong>
  </a>
  <br />
  <em>静下心来，写好一份简历。</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/%E5%85%8D%E7%99%BB%E5%BD%95%E7%89%88-v0.6.0-2563EB?style=flat-square" alt="Login-free Version" />
  <img src="https://img.shields.io/badge/%E5%85%A8%E6%A0%88%E7%89%88-v0.12.0-7C3AED?style=flat-square" alt="Full-stack Version" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://github.com/duan-deqing/zensheetCV/actions/workflows/ci.yml/badge.svg" alt="CI" />
  <img src="https://github.com/duan-deqing/zensheetCV/actions/workflows/deploy-pages.yml/badge.svg" alt="Deploy Pages" />
</p>

<p align="center">
  简体中文 ｜ <a href="README_EN.md">English</a>
</p>

---

ZENSHEET · 简历是一款基于 Markdown 的在线简历编辑器：左侧书写 Markdown，右侧逐页实时预览 A4 纸面效果，8 套内置模板与细粒度主题配置自由组合，AI 辅助打磨表达。项目提供两种形态：

- **免登录在线版**（`static` 分支）：纯前端实现，无需注册登录，打开即用，数据保存在你自己的浏览器里
- **全栈版**（`master` 分支）：FastAPI + SQLite，支持多设备同步，服务端 Playwright 渲染导出 PDF

**免登录在线版已上线**：<https://duan-deqing.github.io/zensheetCV/>

## 目录

- [版本形态对比](#版本形态对比)
- [免登录在线版（static 分支）](#免登录在线版static-分支)
- [全栈版（master 分支）](#全栈版master-分支)
- [项目结构](#项目结构)
- [相关文档](#相关文档)
- [参与贡献](#参与贡献)
- [交流与反馈](#交流与反馈)
- [许可证](#许可证)

## 版本形态对比

|                | 免登录在线版（static）                  | 全栈版（master）                |
| -------------- | --------------------------------------- | ------------------------------- |
| 使用方式       | 打开即用，无需注册登录                  | 注册 / 登录（JWT）              |
| 数据存储       | 浏览器 IndexedDB（隐私模式降级为内存）  | 服务端 SQLite                   |
| PDF 导出       | 浏览器打印「另存为 PDF」，移动端智能降级 | 服务端 Playwright 渲染          |
| AI 辅助        | 浏览器直连 OpenAI 兼容供应商（BYOK）    | 服务端代理转发（规避 CORS）     |
| 多设备同步     | 不支持（数据仅在本机浏览器）            | 支持                            |
| 中英文界面     | 支持（全站双语切换）                    | 中文                            |
| 移动端         | 全面适配（编辑器单列切换 + 折叠导航）   | 响应式布局                      |
| 部署           | 纯静态托管（GitHub Pages 已上线）       | 前后端分离部署（反向代理组网）  |
| 在线地址       | <https://duan-deqing.github.io/zensheetCV/> | 自行部署                    |

## 免登录在线版（static 分支）

### 功能特性

#### 编辑与预览

- **Markdown 实时编辑**：CodeMirror 6 编辑器，工具栏与快捷键齐全，选中文字时浮现上下文工具栏
- **逐页实时预览**：A4 纸面逐页分页渲染，块级贪心分页永不在条目中间断页；分页引擎移植自开源项目 MujiCV
- **分栏布局语法**：`:::left / :::mid / :::right` 容器实现页眉三栏排版
- **图标系统**：Markdown 中以 `icon:名称` 引用内置图标，提供图标库弹窗浏览与一键复制
- **滚动自适应**：预览滚动条按缩放后的视觉宽度自动出现 / 隐藏，纸张始终居中

#### 模板与主题

- **8 套内置模板**：经典简洁 / 现代蓝调 / 优雅酒红 / 科技墨绿 / 墨纸极简 / 青线极简 / 朝阳暖橙 / 碳黑章标
- **主题配置面板**：主色调（预设色板 + 自定义调色盘）、正文字体、分类字号（H1 ~ H5 / 段落 / 列表）、行距、页边距与内容边距
- **模板联动**：多数模板的强调色、章节条、列表符号随主色调自动变化
- **照片排版**：简历照片上传与圆形裁剪，页眉或正文任意位置自由摆放

#### AI 辅助写作（BYOK）

- **经历润色 / 关键词匹配 / 要点成段**：独立聊天窗，SSE 流式回复，Markdown 渲染
- **自带 API Key**：浏览器直连 OpenAI / DeepSeek / GLM / Qwen / LongCat / 自定义端点等 OpenAI 兼容供应商，密钥仅保存在本地浏览器
- **对话持久化**：聊天历史保存在浏览器 IndexedDB，可继续历史话题

#### 本地化与体验

- **数据本地化**：简历与对话历史全部保存在浏览器 IndexedDB，隐私模式自动降级为内存存储；单个浏览器最多保存 15 份简历
- **PDF 导出**：桌面与主流手机浏览器调起打印窗口「另存为 PDF」，逐页排版与预览完全一致；微信 / QQ 等内置浏览器与部分手机浏览器自动降级为截图合成 PDF，可直接下载或唤起系统分享（超长简历自动降低截图精度）
- **全站双语**：中 / EN 一键切换，界面、文档、示例简历、错误提示全部双语，语言偏好本地保存
- **移动端适配**：编辑器单列切换（编辑 / 预览）、导航与功能折叠菜单、全部弹窗小屏适配
- **文档中心**：使用指南 / Markdown 教程 / 主题配置 / 图标库 / AI 助手 / 更新日志

### 技术栈

| 层级     | 技术                                                         |
| -------- | ------------------------------------------------------------ |
| 前端     | React 18 + TypeScript + Vite + Tailwind CSS + CodeMirror 6   |
| 数据存储 | IndexedDB（idb，隐私模式降级内存）                           |
| AI       | OpenAI 兼容协议（浏览器直连，BYOK）                          |
| 国际化   | React Context 双语方案（zh / EN）                            |
| 包管理   | pnpm                                                         |
| CI / CD  | GitHub Actions（CI + GitHub Pages 自动部署）                 |

### 本地开发

```bash
# 克隆并切换到 static 分支
git clone https://github.com/duan-deqing/zensheetCV.git
cd zensheetCV
git checkout static

# 安装依赖（monorepo 根目录）
pnpm install

# 启动开发服务器
pnpm run dev:web        # http://localhost:5173

# 运行测试 / 代码检查
pnpm run test:web       # Vitest
pnpm run lint:web       # ESLint
```

无需任何环境变量与后端服务，AI 功能在界面内配置即可使用。

### 构建与部署

```bash
pnpm run build:web
# 产物输出到 apps/web/dist，可托管到任意静态文件服务器
```

GitHub Pages 自动部署：push 到 `static` 分支后，`.github/workflows/deploy-pages.yml` 自动构建并发布到 <https://duan-deqing.github.io/zensheetCV/>（`vite.config.ts` 通过 `VITE_BASE_PATH=/zensheetCV/` 注入子路径 base，路由使用 HashRouter 天然兼容）。

## 全栈版（master 分支）

### 功能特性

在免登录版全部简历能力之上，额外提供：

- **账号系统**：注册 / 登录（JWT）、头像裁剪上传、资料与安全设置
- **多设备同步**：简历数据存于服务端 SQLite，跨设备访问
- **服务端 PDF 渲染**：Playwright 渲染，分页、字距与预览严格一致
- **AI 服务端代理**：可选服务端默认密钥，代理转发规避供应商 CORS 限制

### 技术栈

| 层级     | 技术                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 前端     | React 18 + TypeScript + Vite + Tailwind CSS + CodeMirror 6               |
| 后端     | Python + FastAPI + SQLAlchemy (async) + Pydantic v2                      |
| 数据库   | SQLite (aiosqlite)                                                       |
| PDF 渲染 | Playwright + Jinja2                                                      |
| AI       | OpenAI 兼容协议（OpenAI / DeepSeek / GLM / Qwen / LongCat / 自定义）     |
| 认证     | JWT (python-jose) + bcrypt                                               |
| 包管理   | pnpm (前端) + Poetry (后端)                                              |
| CI       | GitHub Actions                                                           |

### 快速开始

前置要求：Node.js >= 18、pnpm >= 9.0、Python >= 3.11、Poetry >= 1.8

```bash
# 克隆仓库（全栈版在 master 分支）
git clone https://github.com/duan-deqing/zensheetCV.git
cd zensheetCV
git checkout master

# 安装前端依赖（monorepo 根目录）
pnpm install

# 安装后端依赖
cd apps/api && poetry install
```

启动开发：

```bash
# 同时启动前后端（项目根目录）
pnpm run dev

# 或分别启动
pnpm run dev:web      # 前端: http://localhost:5173
pnpm run dev:api      # 后端: http://localhost:8000
```

启动后访问 <http://localhost:5173> 注册账号即可使用。

后端交互式 API 文档：

- Swagger UI: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>

### 环境变量

后端通过 `pydantic-settings` 从 `apps/api/.env` 读取配置（或直接在部署环境中导出变量）。

| 变量                            | 说明                                      | 默认值                                              | 必填             |
| ------------------------------- | ----------------------------------------- | --------------------------------------------------- | ---------------- |
| `APP_NAME`                      | 应用名称                                  | `Zensheet API · 简历`                               | 否               |
| `APP_VERSION`                   | 应用版本                                  | `0.7.0`                                             | 否               |
| `DEBUG`                         | 调试模式                                  | `True`                                              | 否               |
| `DATABASE_URL`                  | 数据库连接字符串                          | `sqlite+aiosqlite:///./app.db`                      | 否               |
| `SECRET_KEY`                    | JWT 签名密钥（生产环境必须修改）          | `change-me-in-production`                           | **是**           |
| `ACCESS_TOKEN_EXPIRE_MINUTES`   | Token 过期时间（分钟）                    | `10080`（7 天）                                     | 否               |
| `OPENAI_API_KEY`                | 服务端默认 OpenAI 兼容 API 密钥（AI 功能）| （空）                                              | **是**（AI 功能）|
| `OPENAI_MODEL`                  | 服务端默认模型                            | `gpt-4o-mini`                                       | 否               |
| `UPLOAD_DIR`                    | 上传文件目录（头像等）                    | `uploads`                                           | 否               |
| `CORS_ORIGINS`                  | 允许的 CORS 来源（JSON 数组）             | `["http://localhost:5173","http://localhost:3000"]` | 否               |

> 除服务端默认密钥外，AI 功能支持用户在「设置 → AI」中为不同供应商单独配置 API Key（BYOK），密钥仅存储于用户浏览器本地，不经过服务端持久化。

最小生产配置示例（`apps/api/.env`）：

```env
SECRET_KEY=your-strong-random-secret-key
OPENAI_API_KEY=sk-your-openai-api-key
DEBUG=False
CORS_ORIGINS=["https://your-domain.com"]
```

### 测试

```bash
# 前端测试（Vitest）
pnpm run test:web

# 前端代码检查（ESLint）
pnpm run lint:web

# 后端测试（Pytest + pytest-asyncio）
pnpm run test:api
```

CI 流水线（`.github/workflows/ci.yml`）在每次 push / PR 时自动运行前端构建与后端测试（含覆盖率）。

### 构建与部署

**前端构建：**

```bash
pnpm run build:web
# 产物输出到 apps/web/dist，可托管到任意静态文件服务器
```

**后端启动：**

```bash
cd apps/api
poetry install --no-root
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

> 部署前请确保已正确配置环境变量（见[环境变量](#环境变量)），并将前端静态资源与后端 API 通过反向代理（Nginx 等）组合到同一域名下。

### API 概览

所有 API 前缀为 `/api/v1`，完整定义以后端 Swagger 文档为准。

| 模块 | 路由                          | 说明                                         |
| ---- | ----------------------------- | -------------------------------------------- |
| 认证 | `POST /auth/register`         | 用户注册                                     |
|      | `POST /auth/login`            | 用户登录，返回 JWT                           |
|      | `GET /auth/me`                | 获取当前用户信息                             |
|      | `PUT /auth/me`                | 更新用户名 / 邮箱                            |
|      | `PUT /auth/password`          | 修改密码                                     |
|      | `POST /auth/avatar`           | 上传头像                                     |
| 简历 | `GET /resumes`                | 获取当前用户简历列表（分页）                 |
|      | `POST /resumes`               | 创建简历（单用户上限 15 份）                 |
|      | `GET /resumes/{id}`           | 获取简历详情                                 |
|      | `PUT /resumes/{id}`           | 更新简历                                     |
|      | `DELETE /resumes/{id}`        | 删除简历                                     |
| 模板 | `GET /templates`              | 获取内置模板列表                             |
| PDF  | `POST /pdf/generate`          | 生成 PDF（返回下载链接）                     |
|      | `GET /pdf/download/{file_id}` | 下载生成的 PDF                               |
| AI   | `POST /ai/polish`             | 润色文本（SSE 流式）                         |
|      | `POST /ai/keywords`           | 分析 JD 关键词匹配                           |
|      | `POST /ai/generate`           | 智能生成内容（SSE 流式）                     |
|      | `POST /ai/models`             | 拉取供应商可用模型列表（代理转发，规避 CORS）|

## 项目结构

```
zensheetCV/
├── apps/
│   ├── web/                       # React 前端 (Vite)
│   │   ├── src/
│   │   │   ├── api/               # API 客户端（全栈版 axios；免登录版流式对话客户端）
│   │   │   ├── components/        # 通用 UI 组件
│   │   │   │   ├── AIWindow.tsx           # AI 聊天窗
│   │   │   │   ├── AvatarCropModal.tsx    # 头像裁剪上传弹窗
│   │   │   │   ├── BrowserHint.tsx        # 浏览器导出提示弹窗（WebView 自动弹出）
│   │   │   │   ├── CoffeeModal.tsx        # 请作者喝杯咖啡弹窗
│   │   │   │   ├── HoverTip.tsx           # 全站悬停提示
│   │   │   │   ├── IconModal.tsx          # 图标库弹窗
│   │   │   │   ├── Navbar.tsx             # 全局导航栏（含移动端折叠菜单）
│   │   │   │   ├── PhotoModal.tsx         # 照片上传弹窗
│   │   │   │   ├── TemplateModal.tsx      # 模板库弹窗
│   │   │   │   ├── TemplatePreview.tsx    # 模板预览卡片
│   │   │   │   ├── ThemeConfigPanel.tsx   # 主题配置面板
│   │   │   │   ├── TopBar.tsx             # 编辑器顶栏（含移动端折叠菜单）
│   │   │   │   ├── UserModal.tsx          # 设置窗口（账号 / AI / 安全 / 关于）
│   │   │   │   └── ...
│   │   │   ├── editor/            # Markdown 编辑器模块
│   │   │   ├── i18n/              # 国际化（免登录版：LangContext 中英双语）
│   │   │   ├── pages/             # 页面组件
│   │   │   │   ├── docs/                  # 文档中心（多子页面 + 更新日志）
│   │   │   │   ├── EditorPage.tsx
│   │   │   │   ├── HomePage.tsx
│   │   │   │   └── ResumesPage.tsx
│   │   │   ├── preview/           # 简历预览模块（分页 / 图标 / 分栏 / 字号）
│   │   │   ├── settings/          # AI 供应商与密钥设置（浏览器本地存储）
│   │   │   ├── storage/           # 免登录版 IndexedDB 存储层
│   │   │   ├── store/             # 状态管理 (React Context)
│   │   │   └── templates/         # 8 套简历模板定义
│   │   └── tests/                 # Vitest 测试
│   │
│   └── api/                       # FastAPI 后端（全栈版 master 分支）
│       ├── app/
│       │   ├── api/v1/            # API 路由层（auth / resumes / templates / pdf / ai）
│       │   ├── core/              # 核心配置
│       │   ├── db/                # 数据库
│       │   ├── models/            # SQLAlchemy 模型
│       │   ├── schemas/           # Pydantic 模型
│       │   ├── services/          # 业务逻辑
│       │   └── main.py            # FastAPI 应用入口
│       ├── tests/                 # Pytest 集成测试
│       └── pyproject.toml
│
├── packages/
│   └── shared-types/              # 前后端共享类型定义
│
├── docs/                          # 设计规格与实施文档
│
├── .github/workflows/             # CI（ci.yml）与 Pages 部署（deploy-pages.yml）
├── pnpm-workspace.yaml            # pnpm workspace 配置
└── package.json                   # Monorepo 根配置
```

> 注：`apps/api`、`storage/`、`i18n/` 等目录按分支存在——免登录在线版（static）无后端目录，全栈版（master）无 IndexedDB 存储层与国际化模块。

## 相关文档

- 免登录在线版：<https://duan-deqing.github.io/zensheetCV/>（文档中心 `/#/docs`，更新日志 `/#/docs/changelog`）
- 应用内文档中心：使用指南 / Markdown 教程 / 主题配置 / 图标库 / AI 助手 / 更新日志

## 参与贡献

欢迎提交 Issue 与 Pull Request：

1. Fork 本仓库并创建特性分支（`git checkout -b feature/your-feature`）
2. 提交前请确保 `pnpm run lint:web`、`pnpm run test:web`（全栈版还需 `pnpm run test:api`）通过
3. 提交 Pull Request 并描述变更内容与动机

## 交流与反馈

欢迎加入 QQ 交流群：

<p align="left">
  <img src="apps/web/public/QR-Code.png" alt="QQ 群二维码" width="120" />
</p>

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

<p align="center">
  由 <a href="https://duan-deqing.github.io/" target="_blank" rel="noopener noreferrer">STYLAN</a> &amp; GLM-5.3-flash 打造
</p>
