# Stylan Resume - 在线简历编辑器

> 通过 Markdown 编辑简历，选择定制模板，导出高质量 PDF

## 功能

- Markdown 实时编辑与预览
- 多模板切换
- 主题配置
- 服务端 PDF 导出（Playwright）
- AI 辅助写作（Phase 4）

## 技术栈

- **前端:** React 18 + TypeScript + Vite + Tailwind CSS
- **后端:** Python + FastAPI + SQLAlchemy + SQLite
- **PDF:** Playwright

## 快速开始

### 前置要求
- Node.js ≥ 18
- Python ≥ 3.11
- Poetry (Python 包管理)

### 安装
```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd apps/api && poetry install
```

### 开发
```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:web      # 前端: http://localhost:5173
npm run dev:api      # 后端: http://localhost:8000
```

### API 文档
后端启动后访问: http://localhost:8000/docs

## 项目结构

```
stylan_resume/
├── apps/web/       # React 前端
├── apps/api/       # FastAPI 后端
├── packages/       # 共享包
└── docker-compose.yml
```
