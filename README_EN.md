# ZENSHEET Resume

<p align="center">
  <a href="https://github.com/duan-deqing/zensheetCV" target="_blank" rel="noopener noreferrer">
    <strong>ZENSHEET Resume</strong>
  </a>
  <br />
  <em>Calm down and craft a great resume.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Login--free-v0.6.0-2563EB?style=flat-square" alt="Login-free Version" />
  <img src="https://img.shields.io/badge/Full--stack-v0.12.0-7C3AED?style=flat-square" alt="Full-stack Version" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://github.com/duan-deqing/zensheetCV/actions/workflows/ci.yml/badge.svg" alt="CI" />
  <img src="https://github.com/duan-deqing/zensheetCV/actions/workflows/deploy-pages.yml/badge.svg" alt="Deploy Pages" />
</p>

<p align="center">
  <a href="README.md">简体中文</a> ｜ English
</p>

---

ZENSHEET Resume is a Markdown-based online resume builder: write Markdown on the left, watch a page-by-page A4 preview update in real time on the right, combine 8 built-in templates with fine-grained theme settings, and polish your wording with AI assistance. The project ships in two editions:

- **Login-free Web Edition** (`static` branch): pure frontend — no sign-up, open and use, your data stays in your own browser
- **Full-stack Edition** (`master` branch): FastAPI + SQLite with cross-device sync and server-side Playwright PDF rendering

**The login-free edition is live**: <https://duan-deqing.github.io/zensheetCV/>

## Table of Contents

- [Edition Comparison](#edition-comparison)
- [Login-free Web Edition (static branch)](#login-free-web-edition-static-branch)
- [Full-stack Edition (master branch)](#full-stack-edition-master-branch)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Community & Feedback](#community--feedback)
- [License](#license)

## Edition Comparison

|                   | Login-free (static)                            | Full-stack (master)                       |
| ----------------- | ---------------------------------------------- | ----------------------------------------- |
| Getting started   | Open and use, no sign-up                       | Register / log in (JWT)                   |
| Data storage      | Browser IndexedDB (in-memory in private mode)  | Server-side SQLite                        |
| PDF export        | Browser print → "Save as PDF"; smart mobile fallback | Server-side Playwright rendering          |
| AI assistance     | Browser connects directly to OpenAI-compatible providers (BYOK) | Server-side proxy (CORS-free) |
| Cross-device sync | Not supported (data stays in the local browser)| Supported                                 |
| UI language       | Bilingual (site-wide 中文 / EN toggle)         | Chinese                                   |
| Mobile            | Fully adapted (single-column editor + folding nav) | Responsive layout                     |
| Hosting           | Pure static (live on GitHub Pages)             | Separate frontend + backend behind a reverse proxy |
| Live URL          | <https://duan-deqing.github.io/zensheetCV/>    | Self-hosted                               |

## Login-free Web Edition (static branch)

### Features

#### Editing & Preview

- **Live Markdown editing**: CodeMirror 6 editor with a full toolbar and keyboard shortcuts, plus a floating context toolbar for selected text
- **Page-by-page live preview**: A4 sheets paginated in real time; block-level greedy pagination never breaks an item across pages — engine ported from the open-source MujiCV project
- **Column layout syntax**: `:::left / :::mid / :::right` containers for three-column headers
- **Icon system**: reference built-in icons in Markdown via `icon:name`; browse them in the icon library modal with one-click copy
- **Adaptive scrolling**: preview scrollbars appear / hide based on the visually scaled width, keeping the sheet centered at all times

#### Templates & Themes

- **8 built-in templates**: Classic / Modern Blue / Elegant Wine / Tech Green / Ink Minimal / Teal Line / Sunrise Orange / Carbon Stamp
- **Theme settings panel**: primary color (preset palette + custom picker), body font, per-level font sizes (H1–H5 / paragraph / list), line height, page margins and content padding
- **Template theming**: most templates derive accent colors, section bars and list markers from the primary color
- **Photo layout**: upload with circular cropping, place freely in the header or body

#### AI Writing Assistance (BYOK)

- **Experience polishing / keyword matching / bullet expansion**: dedicated chat window with SSE streaming replies rendered as Markdown
- **Bring your own key**: the browser connects directly to OpenAI-compatible providers — OpenAI / DeepSeek / GLM / Qwen / LongCat / custom endpoints; keys are stored only in your local browser
- **Chat history**: conversations persist in browser IndexedDB so you can continue past topics

#### Localization & Experience

- **Local-first data**: resumes and chat history live in browser IndexedDB, falling back to in-memory storage in private mode; up to 15 resumes per browser
- **PDF export**: on desktop and mainstream mobile browsers, opens the print dialog — choose "Save as PDF"; page layout matches the preview exactly. In-app browsers (WeChat / QQ) and some mobile browsers fall back automatically to assembling a PDF from page snapshots, ready to download or share (snapshot precision is reduced automatically for very long resumes)
- **Bilingual UI**: one-tap 中文 / EN toggle covering the interface, docs, sample resume and error messages, with the preference saved locally
- **Mobile support**: single-column editor (Edit / Preview toggle), folding navigation and action menus, and mobile-friendly modals throughout
- **Documentation center**: user guide / Markdown tutorial / theme settings / icon library / AI assistant / changelog

### Tech Stack

| Layer      | Technology                                                  |
| ---------- | ----------------------------------------------------------- |
| Frontend   | React 18 + TypeScript + Vite + Tailwind CSS + CodeMirror 6  |
| Storage    | IndexedDB (idb, in-memory fallback in private mode)         |
| AI         | OpenAI-compatible protocol (browser direct, BYOK)           |
| i18n       | React Context bilingual solution (zh / EN)                  |
| Packaging  | pnpm                                                        |
| CI / CD    | GitHub Actions (CI + automatic GitHub Pages deployment)     |

### Local Development

```bash
# Clone and switch to the static branch
git clone https://github.com/duan-deqing/zensheetCV.git
cd zensheetCV
git checkout static

# Install dependencies (from the monorepo root)
pnpm install

# Start the dev server
pnpm run dev:web        # http://localhost:5173

# Run tests / lint
pnpm run test:web       # Vitest
pnpm run lint:web       # ESLint
```

No environment variables or backend required — AI features are configured in the UI.

### Build & Deployment

```bash
pnpm run build:web
# Output goes to apps/web/dist, hostable on any static file server
```

GitHub Pages auto-deployment: pushing to the `static` branch triggers `.github/workflows/deploy-pages.yml`, which builds and publishes to <https://duan-deqing.github.io/zensheetCV/> (`vite.config.ts` injects the sub-path base via `VITE_BASE_PATH=/zensheetCV/`; HashRouter keeps routing sub-path friendly).

## Full-stack Edition (master branch)

### Features

Everything in the login-free edition, plus:

- **Account system**: register / log in (JWT), avatar cropping and upload, profile and security settings
- **Cross-device sync**: resumes stored in server-side SQLite, accessible from any device
- **Server-side PDF rendering**: Playwright rendering with pagination and kerning exactly matching the preview
- **Server-side AI proxy**: optional server default key, proxying requests to bypass provider CORS restrictions

### Tech Stack

| Layer      | Technology                                                               |
| ---------- | ------------------------------------------------------------------------ |
| Frontend   | React 18 + TypeScript + Vite + Tailwind CSS + CodeMirror 6               |
| Backend    | Python + FastAPI + SQLAlchemy (async) + Pydantic v2                      |
| Database   | SQLite (aiosqlite)                                                       |
| PDF engine | Playwright + Jinja2                                                      |
| AI         | OpenAI-compatible protocol (OpenAI / DeepSeek / GLM / Qwen / LongCat / custom) |
| Auth       | JWT (python-jose) + bcrypt                                               |
| Packaging  | pnpm (frontend) + Poetry (backend)                                       |
| CI         | GitHub Actions                                                           |

### Quick Start

Prerequisites: Node.js >= 18, pnpm >= 9.0, Python >= 3.11, Poetry >= 1.8

```bash
# Clone the repository (full-stack edition lives on master)
git clone https://github.com/duan-deqing/zensheetCV.git
cd zensheetCV
git checkout master

# Install frontend dependencies (from the monorepo root)
pnpm install

# Install backend dependencies
cd apps/api && poetry install
```

Start development:

```bash
# Start both frontend and backend (from the project root)
pnpm run dev

# Or start them separately
pnpm run dev:web      # Frontend: http://localhost:5173
pnpm run dev:api      # Backend:  http://localhost:8000
```

Visit <http://localhost:5173> and register an account to get started.

Interactive backend API docs:

- Swagger UI: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>

### Environment Variables

The backend reads configuration from `apps/api/.env` via `pydantic-settings` (or export the variables directly in your deployment environment).

| Variable                        | Description                                     | Default                                             | Required           |
| ------------------------------- | ----------------------------------------------- | --------------------------------------------------- | ------------------ |
| `APP_NAME`                      | Application name                                | `Zensheet API · 简历`                               | No                 |
| `APP_VERSION`                   | Application version                             | `0.7.0`                                             | No                 |
| `DEBUG`                         | Debug mode                                      | `True`                                              | No                 |
| `DATABASE_URL`                  | Database connection string                      | `sqlite+aiosqlite:///./app.db`                      | No                 |
| `SECRET_KEY`                    | JWT signing secret (must change in production)  | `change-me-in-production`                           | **Yes**            |
| `ACCESS_TOKEN_EXPIRE_MINUTES`   | Token expiration (minutes)                      | `10080` (7 days)                                    | No                 |
| `OPENAI_API_KEY`                | Server-default OpenAI-compatible API key (AI)   | (empty)                                             | **Yes** (for AI)   |
| `OPENAI_MODEL`                  | Server-default model                            | `gpt-4o-mini`                                       | No                 |
| `UPLOAD_DIR`                    | Upload directory (avatars, etc.)                | `uploads`                                           | No                 |
| `CORS_ORIGINS`                  | Allowed CORS origins (JSON array)               | `["http://localhost:5173","http://localhost:3000"]` | No                 |

> Besides the server-default key, AI features support per-provider API keys configured by each user in "Settings → AI" (BYOK). Keys are stored only in the user's browser and never persisted on the server.

Minimal production configuration (`apps/api/.env`):

```env
SECRET_KEY=your-strong-random-secret-key
OPENAI_API_KEY=sk-your-openai-api-key
DEBUG=False
CORS_ORIGINS=["https://your-domain.com"]
```

### Testing

```bash
# Frontend tests (Vitest)
pnpm run test:web

# Frontend lint (ESLint)
pnpm run lint:web

# Backend tests (Pytest + pytest-asyncio)
pnpm run test:api
```

The CI pipeline (`.github/workflows/ci.yml`) runs frontend build and backend tests (with coverage) on every push / PR.

### Build & Deployment

**Frontend build:**

```bash
pnpm run build:web
# Output goes to apps/web/dist, hostable on any static file server
```

**Backend:**

```bash
cd apps/api
poetry install --no-root
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

> Before deploying, make sure the environment variables are set (see [Environment Variables](#environment-variables)) and serve the frontend assets and backend API under the same domain via a reverse proxy (Nginx, etc.).

### API Overview

All APIs are prefixed with `/api/v1`; the backend Swagger docs are the source of truth.

| Module | Route                         | Description                                        |
| ------ | ----------------------------- | -------------------------------------------------- |
| Auth   | `POST /auth/register`         | Register a user                                    |
|        | `POST /auth/login`            | Log in, returns a JWT                              |
|        | `GET /auth/me`                | Get the current user                               |
|        | `PUT /auth/me`                | Update username / email                            |
|        | `PUT /auth/password`          | Change password                                    |
|        | `POST /auth/avatar`           | Upload avatar                                      |
| Resume | `GET /resumes`                | List the current user's resumes (paginated)        |
|        | `POST /resumes`               | Create a resume (max 15 per user)                  |
|        | `GET /resumes/{id}`           | Get resume details                                 |
|        | `PUT /resumes/{id}`           | Update a resume                                    |
|        | `DELETE /resumes/{id}`        | Delete a resume                                    |
| Template | `GET /templates`            | List built-in templates                            |
| PDF    | `POST /pdf/generate`          | Generate a PDF (returns a download link)           |
|        | `GET /pdf/download/{file_id}` | Download a generated PDF                           |
| AI     | `POST /ai/polish`             | Polish text (SSE streaming)                        |
|        | `POST /ai/keywords`           | Match JD keywords                                  |
|        | `POST /ai/generate`           | Generate content (SSE streaming)                   |
|        | `POST /ai/models`             | List provider models (server proxy, CORS-free)     |

## Project Structure

```
zensheetCV/
├── apps/
│   ├── web/                       # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── api/               # API clients (axios on full-stack; streaming chat client on login-free)
│   │   │   ├── components/        # Shared UI components
│   │   │   │   ├── AIWindow.tsx           # AI chat window
│   │   │   │   ├── AvatarCropModal.tsx    # Avatar crop & upload modal
│   │   │   │   ├── BrowserHint.tsx        # Browser export hint modal (auto-opens in WebViews)
│   │   │   │   ├── CoffeeModal.tsx        # Buy-me-a-coffee modal
│   │   │   │   ├── HoverTip.tsx           # Site-wide hover tooltip
│   │   │   │   ├── IconModal.tsx          # Icon library modal
│   │   │   │   ├── Navbar.tsx             # Global navbar (with mobile folding menu)
│   │   │   │   ├── PhotoModal.tsx         # Photo upload modal
│   │   │   │   ├── TemplateModal.tsx      # Template library modal
│   │   │   │   ├── TemplatePreview.tsx    # Template preview card
│   │   │   │   ├── ThemeConfigPanel.tsx   # Theme settings panel
│   │   │   │   ├── TopBar.tsx             # Editor top bar (with mobile folding menu)
│   │   │   │   ├── UserModal.tsx          # Settings window (account / AI / security / about)
│   │   │   │   └── ...
│   │   │   ├── editor/            # Markdown editor module
│   │   │   ├── i18n/              # Internationalization (login-free: zh / EN LangContext)
│   │   │   ├── pages/             # Page components
│   │   │   │   ├── docs/                  # Documentation center (sub-pages + changelog)
│   │   │   │   ├── EditorPage.tsx
│   │   │   │   ├── HomePage.tsx
│   │   │   │   └── ResumesPage.tsx
│   │   │   ├── preview/           # Resume preview (pagination / icons / columns / font sizes)
│   │   │   ├── settings/          # AI provider & key settings (browser local storage)
│   │   │   ├── storage/           # Login-free IndexedDB storage layer
│   │   │   ├── store/             # State management (React Context)
│   │   │   └── templates/         # 8 resume template definitions
│   │   └── tests/                 # Vitest tests
│   │
│   └── api/                       # FastAPI backend (full-stack, master branch)
│       ├── app/
│       │   ├── api/v1/            # API routes (auth / resumes / templates / pdf / ai)
│       │   ├── core/              # Core configuration
│       │   ├── db/                # Database
│       │   ├── models/            # SQLAlchemy models
│       │   ├── schemas/           # Pydantic schemas
│       │   ├── services/          # Business logic
│       │   └── main.py            # FastAPI entry point
│       ├── tests/                 # Pytest integration tests
│       └── pyproject.toml
│
├── packages/
│   └── shared-types/              # Shared type definitions
│
├── docs/                          # Design specs & implementation docs
│
├── .github/workflows/             # CI (ci.yml) and Pages deployment (deploy-pages.yml)
├── pnpm-workspace.yaml            # pnpm workspace config
└── package.json                   # Monorepo root config
```

> Note: some directories are branch-specific — the login-free edition (static) has no backend (`apps/api`), while the full-stack edition (master) has no IndexedDB storage layer or i18n module.

## Documentation

- Login-free edition: <https://duan-deqing.github.io/zensheetCV/> (docs center at `/#/docs`, changelog at `/#/docs/changelog`)
- In-app documentation center: user guide / Markdown tutorial / theme settings / icon library / AI assistant / changelog

## Contributing

Issues and pull requests are welcome:

1. Fork the repository and create a feature branch (`git checkout -b feature/your-feature`)
2. Make sure `pnpm run lint:web` and `pnpm run test:web` pass before submitting (plus `pnpm run test:api` for the full-stack edition)
3. Open a pull request describing what changed and why

## Community & Feedback

Join our QQ group:

<p align="left">
  <img src="apps/web/public/QR-Code.png" alt="QQ group QR code" width="120" />
</p>

## License

This project is open-sourced under the [MIT License](LICENSE).

---

<p align="center">
  Built by <a href="https://duan-deqing.github.io/" target="_blank" rel="noopener noreferrer">STYLAN</a> &amp; GLM-5.3-flash
</p>
