# ZENSHEET（zensheetCV）开发文档

> 在线 Markdown 简历编辑器：左侧书写，右侧实时预览排版，内置多套模板。
> 纯前端应用，数据仅保存在用户本地浏览器，无需注册登录。
>
> 线上地址：<https://duan-deqing.github.io/zensheetCV/>

## 目录

- [技术栈](#技术栈)
- [仓库结构](#仓库结构)
- [本地开发](#本地开发)
- [分支模型](#分支模型)
- [发版流程](#发版流程)
- [部署说明](#部署说明)
- [版本发布约定](#版本发布约定)
- [代码约定](#代码约定)

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | React + TypeScript |
| 构建 | Vite（pnpm monorepo） |
| 样式 | Tailwind CSS + 全局动画样式 `src/styles/animations.css` |
| 编辑器 | CodeMirror 6（Markdown） |
| 渲染 | react-markdown + 自定义 remark/rehype 插件（分栏、图标、H2 文本包裹） |
| 数据 | IndexedDB（idb），隐私模式自动降级内存存储 |
| AI | 浏览器直连 OpenAI 兼容供应商（SSE），密钥仅存本地 |
| 测试 | Vitest + Testing Library（jsdom） |
| 部署 | GitHub Pages（Actions 工作流） |

## 仓库结构

```
├── apps/web/                # 前端应用（免登录版主体）
│   ├── src/
│   │   ├── components/      # 通用组件（topbar/ 子目录为顶栏拆分模块）
│   │   ├── pages/           # 页面（home/ 编辑器首页、docs/ 文档站）
│   │   ├── templates/       # 8 套简历模板定义（name/css/defaultTheme）
│   │   ├── preview/         # 预览渲染管线（分页引擎、共享样式）
│   │   ├── store/           # Context 状态（Editor/Resume/Preview/UI/Toast/Auth）
│   │   ├── hooks/           # usePDFExport、useModalClose 等
│   │   ├── storage/         # IndexedDB 封装
│   │   ├── i18n/            # 双语（中/英）LangContext
│   │   └── styles/          # animations.css 全局动画
│   └── tests/               # 单元测试与组件测试
├── packages/shared-types/   # 前后端共享类型（模板主题、简历数据结构）
├── docs/                    # 开发规格书（不入库，仅本地保留）
└── .github/workflows/       # deploy-pages.yml（Pages 部署）
```

## 本地开发

环境要求：Node.js ≥ 18、pnpm。

```bash
pnpm install          # 安装依赖
pnpm run dev          # 启动免登录版 http://localhost:5173
pnpm run test:web     # 运行全部测试（vitest）
pnpm run lint:web     # ESLint 检查
pnpm run build:web    # 类型检查 + 生产构建（apps/web/dist）
```

> 提交前建议三件套：`tsc --noEmit`、`eslint`、`vitest run` 全部通过。

## 分支模型

| 分支 | 角色 | push 行为 |
| --- | --- | --- |
| `static` | **日常开发分支**（免登录版） | 不触发部署 |
| `master` | **发布分支**（与 static 内容同步） | 自动部署 GitHub Pages |
| `fullstack` | 全栈版存档（FastAPI + SQLite + Playwright，后端代码仅在此分支） | 不触发部署 |

## 发版流程

日常开发全部在 `static` 分支进行，需要发布时把 static 合并到 master 即自动部署：

```bash
# 1. 在 static 上开发、提交并推送（不会触发部署）
git checkout static
git add <files> && git commit -m "..."
git push origin static

# 2. 发版：合并到 master 并推送（自动触发 GitHub Pages 部署）
git checkout master
git merge static
git push origin master

# 3. 切回开发分支
git checkout static
```

注意事项：

- `master` 对 `static` 是快进合并关系（master 不做独立开发），正常情况不会产生冲突；若在 master 上误提交，先同步回 static 再合并
- 部署进度可在 GitHub 仓库的 **Actions** 页查看「Deploy to GitHub Pages」运行
- 除 push master 外，也可在 Actions 页手动触发（`workflow_dispatch`）
- 发版前确认版本号与更新日志已同步（见下节）

## 部署说明

- 工作流：[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)，push master 触发
- 构建注入子路径 `VITE_BASE_PATH=/zensheetCV/`；路由使用 HashRouter，天然兼容 Pages 子路径
- 线上站点：<https://duan-deqing.github.io/zensheetCV/>

## 版本发布约定

免登录版版本号独立计数，发版时三处同步更新：

1. **更新日志**：[apps/web/src/pages/docs/data/changelog.ts](apps/web/src/pages/docs/data/changelog.ts) 的 `STATIC_CHANGELOG`（中英双语，条目与变更一一对应）
2. **关于页**：[apps/web/src/components/UserModal.tsx](apps/web/src/components/UserModal.tsx) 关于页显示的版本号
3. **README 徽章**：[README.md](README.md) 与 [README_EN.md](README_EN.md) 顶部的 shields.io 版本徽章

未正式发布的版本先挂在当天日期的条目下（如 `v0.7.0` 标注 unreleased），后续变更并入同一条目，不新增版本号。

## 代码约定

- **双语文案**：用户可见文案一律使用 `Bi = { zh, en }` + `useTr()`；代码注释保持中文；错误消息用 `getLang()` 分支
- **Context 性能**：setter 一律 `useCallback`、value 一律 `useMemo`；ResumeContext 不订阅会随击键变化的 markdown
- **动画统一**：所有弹窗/面板关闭动效走 `useModalClose`，动画定义收敛到 `src/styles/animations.css`，`prefers-reduced-motion` 用户自动跳过
- **提示样式**：操作提示统一为屏幕顶部中央深色胶囊（全局 ToastContext）
- **模板样式**：模板 CSS 以 `.resume-preview` 为作用域，支持主色 / 字号 / 行距 CSS 变量联动；预览、导出、首页画廊共用同一条渲染管线
