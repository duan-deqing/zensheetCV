# 在线简历编辑器 - Phase 2 模板与体验实施计划

> **适用范围（2026-09 标注）**：本系列 Phase 1-5 计划为立项时的 **master 全栈版**历史计划。当前发布的 **static 免登录版**（static 分支）为纯前端实现，架构不对应；全栈版计划仅适用于 master 分支。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 完善模板系统、主题配置、简历管理和编辑器体验，使多模板切换体验流畅

**Architecture:** 在 Phase 1 基础上扩展模板定义、新增主题配置面板组件、简历列表侧边栏、增强工具栏

**Tech Stack:** React 18, TypeScript 5, Tailwind CSS 3, CodeMirror 6, FastAPI, Playwright

## Global Constraints

- 遵循 spec 第 12 节设计规范（Awwwards 标准）
- 设计令牌使用 spec 12.2 节的 CSS 变量系统
- 交互动效遵循 spec 12.4 节规范（时长 + 缓动函数）
- 所有新增组件必须有 TypeScript 类型
- 提交信息遵循 Conventional Commits 规范

---

## 文件结构变更概览

```
apps/web/src/
├── templates/
│   ├── index.ts              # 扩展：注册所有模板
│   ├── classic.ts             # 已有
│   ├── modern.ts             # 新增：现代设计模板
│   ├── elegant.ts            # 新增：优雅复古模板
│   └── tech.ts               # 新增：技术极简模板
├── components/
│   ├── ThemeConfigPanel.tsx  # 新增：主题配置面板
│   ├── ResumeList.tsx        # 新增：简历列表侧边栏
│   ├── SaveButton.tsx        # 新增：手动保存按钮
│   └── Toast.tsx             # 新增：保存提示
├── editor/
│   ├── MarkdownEditor.tsx    # 修改：集成工具栏增强
│   ├── Toolbar.tsx           # 修改：增强工具栏
│   └── shortcuts.ts           # 修改：实现快捷键
├── preview/
│   └── PreviewToolbar.tsx    # 修改：集成主题配置按钮
├── pages/
│   ├── EditorPage.tsx        # 修改：集成侧边栏 + 顶部栏
│   └── HomePage.tsx          # 修改：集成简历列表
├── hooks/
│   ├── useKeyboardShortcut.ts # 新增：快捷键 hook
│   └── useToast.ts           # 新增：Toast 提示 hook
└── store/
    └── UIContext.tsx         # 新增：UI 状态（侧边栏、Toast）
```

---

### Task 1: 新增 3 套简历模板

**Files:**
- Create: `apps/web/src/templates/modern.ts`
- Create: `apps/web/src/templates/elegant.ts`
- Create: `apps/web/src/templates/tech.ts`
- Modify: `apps/web/src/templates/index.ts`

**Interfaces:**
- Produces: `modernTemplate`, `elegantTemplate`, `techTemplate`
- Produces: 更新后的 `builtinTemplates` 数组（4 个模板）

- [ ] **Step 1: 创建 modern.ts**

```typescript
export const modernTemplate = {
  id: 'modern',
  name: '现代设计',
  description: '蓝色主调，现代感十足，适合互联网/科技公司',
  thumbnail: '/templates/modern-thumb.svg',
  blockMapping: {
    h1: 'name',
    h2: 'section-title',
    h3: 'item-title',
    ul: 'list',
    p: 'description',
    hr: 'divider',
  },
  css: `
    .resume-preview {
      font-family: 'Inter', 'Noto Sans SC', sans-serif;
      color: #1F2937;
      line-height: 1.6;
      padding: 2.5rem;
      background: linear-gradient(135deg, #FFFFFF 0%, #F0F7FF 100%);
    }
    .resume-preview h1 {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--resume-primary, #2563EB);
      letter-spacing: -0.02em;
    }
    .resume-preview h2 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-top: 1.75rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--resume-primary, #2563EB);
      color: var(--resume-primary, #2563EB);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .resume-preview h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-top: 1rem;
      margin-bottom: 0.25rem;
      color: #374151;
    }
    .resume-preview ul {
      padding-left: 1.25rem;
      list-style: none;
      margin-bottom: 0.5rem;
    }
    .resume-preview ul li {
      position: relative;
      padding-left: 1rem;
      margin-bottom: 0.375rem;
    }
    .resume-preview ul li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.6em;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--resume-primary, #2563EB);
    }
    .resume-preview p {
      margin-bottom: 0.5rem;
      color: #4B5563;
    }
  `,
  defaultTheme: {
    primaryColor: '#2563EB',
    fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
    fontSize: 'base',
    spacing: 'normal',
  },
};
```

- [ ] **Step 2: 创建 elegant.ts**

```typescript
export const elegantTemplate = {
  id: 'elegant',
  name: '优雅复古',
  description: '优雅复古设计，适合设计/创意/教育行业',
  thumbnail: '/templates/elegant-thumb.svg',
  blockMapping: {
    h1: 'name',
    h2: 'section-title',
    h3: 'item-title',
    ul: 'list',
    p: 'description',
    hr: 'divider',
  },
  css: `
    .resume-preview {
      font-family: 'Georgia', 'Noto Serif SC', serif;
      color: #2C2C2C;
      line-height: 1.7;
      padding: 3rem;
      background: #FDFBF7;
    }
    .resume-preview h1 {
      font-size: 2.5rem;
      font-weight: 400;
      margin-bottom: 0.25rem;
      color: var(--resume-primary, #78350F);
      font-style: italic;
      letter-spacing: 0.02em;
    }
    .resume-preview h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
      color: var(--resume-primary, #78350F);
      border-bottom: 1px solid #D4A574;
      padding-bottom: 0.375rem;
    }
    .resume-preview h3 {
      font-size: 1.0625rem;
      font-weight: 600;
      margin-top: 1rem;
      margin-bottom: 0.25rem;
      color: #44403C;
    }
    .resume-preview ul {
      padding-left: 1.5rem;
      list-style: square;
      margin-bottom: 0.5rem;
    }
    .resume-preview li {
      margin-bottom: 0.375rem;
    }
    .resume-preview p {
      margin-bottom: 0.625rem;
    }
  `,
  defaultTheme: {
    primaryColor: '#78350F',
    fontFamily: "'Georgia', 'Noto Serif SC', serif",
    fontSize: 'base',
    spacing: 'relaxed',
  },
};
```

- [ ] **Step 3: 创建 tech.ts**

```typescript
export const techTemplate = {
  id: 'tech',
  name: '技术极简',
  description: '极简技术风格，适合技术/开源/开发者',
  thumbnail: '/templates/tech-thumb.svg',
  blockMapping: {
    h1: 'name',
    h2: 'section-title',
    h3: 'item-title',
    ul: 'list',
    p: 'description',
    hr: 'divider',
  },
  css: `
    .resume-preview {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      color: #E5E7EB;
      line-height: 1.6;
      padding: 2rem;
      background: #111827;
    }
    .resume-preview h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--resume-primary, #10B981);
    }
    .resume-preview h2 {
      font-size: 0.875rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      color: var(--resume-primary, #10B981);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid #374151;
      padding-bottom: 0.375rem;
    }
    .resume-preview h3 {
      font-size: 0.9375rem;
      font-weight: 600;
      margin-top: 0.75rem;
      margin-bottom: 0.25rem;
      color: #D1D5DB;
    }
    .resume-preview ul {
      padding-left: 1rem;
      list-style: none;
      margin-bottom: 0.5rem;
    }
    .resume-preview ul li {
      position: relative;
      padding-left: 1rem;
      margin-bottom: 0.25rem;
      color: #9CA3AF;
    }
    .resume-preview ul li::before {
      content: '>';
      position: absolute;
      left: 0;
      color: var(--resume-primary, #10B981);
    }
    .resume-preview p {
      margin-bottom: 0.5rem;
      color: #9CA3AF;
    }
  `,
  defaultTheme: {
    primaryColor: '#10B981',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 'sm',
    spacing: 'compact',
  },
};
```

- [ ] **Step 4: 更新 templates/index.ts**

```typescript
import { classicTemplate } from './classic';
import { modernTemplate } from './modern';
import { elegantTemplate } from './elegant';
import { techTemplate } from './tech';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  blockMapping: Record<string, string>;
  css: string;
  defaultTheme: {
    primaryColor: string;
    fontFamily: string;
    fontSize: string;
    spacing: string;
  };
}

export const builtinTemplates: TemplateDefinition[] = [
  classicTemplate,
  modernTemplate,
  elegantTemplate,
  techTemplate,
];

export function getTemplateById(id: string): TemplateDefinition {
  return builtinTemplates.find((t) => t.id === id) || classicTemplate;
}

export function getTemplateCss(templateId: string): string {
  const template = getTemplateById(templateId);
  return template.css;
}
```

- [ ] **Step 5: 提交**

```bash
git add apps/web/src/templates/
git commit -m "feat(templates): add modern, elegant, and tech resume templates"
```

---

### Task 2: UI 状态管理与 Toast 组件

**Files:**
- Create: `apps/web/src/store/UIContext.tsx`
- Create: `apps/web/src/components/Toast.tsx`
- Create: `apps/web/src/hooks/useToast.ts`

**Interfaces:**
- Produces: `UIProvider`, `useUI` hook
- Produces: `Toast` 组件
- Produces: `useToast` hook

- [ ] **Step 1: 创建 UIContext.tsx**

```tsx
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIContextType {
  sidebarOpen: boolean;
  themePanelOpen: boolean;
  toasts: ToastMessage[];
  toggleSidebar: () => void;
  toggleThemePanel: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), []);
  const toggleThemePanel = useCallback(() => setThemePanelOpen((p) => !p), []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <UIContext.Provider
      value={{ sidebarOpen, themePanelOpen, toasts, toggleSidebar, toggleThemePanel, addToast, removeToast }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}
```

- [ ] **Step 2: 创建 Toast.tsx**

```tsx
import { useUI } from '@/store/UIContext';

export function Toast() {
  const { toasts, removeToast } = useUI();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 animate-slide-in ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : toast.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 创建 useToast.ts**

```typescript
import { useUI } from '@/store/UIContext';

export function useToast() {
  const { addToast } = useUI();
  return addToast;
}
```

- [ ] **Step 4: 提交**

```bash
git add apps/web/src/store/UIContext.tsx apps/web/src/components/Toast.tsx apps/web/src/hooks/useToast.ts
git commit -m "feat(ui): add UI context, Toast component, and useToast hook"
```

---

### Task 3: 主题配置面板

**Files:**
- Create: `apps/web/src/components/ThemeConfigPanel.tsx`

**Interfaces:**
- Produces: `ThemeConfigPanel` 组件

- [ ] **Step 1: 创建 ThemeConfigPanel.tsx**

```tsx
import { usePreview } from '@/store/PreviewContext';
import { useUI } from '@/store/UIContext';
import type { ThemeConfig } from '@stylan/shared-types';

const colorPresets = [
  { label: '科技蓝', value: '#2563EB' },
  { label: '翡翠绿', value: '#10B981' },
  { label: '琥珀橙', value: '#F59E0B' },
  { label: '玫瑰红', value: '#E11D48' },
  { label: '紫罗兰', value: '#7C3AED' },
  { label: '石墨黑', value: '#111827' },
];

const fontPresets = [
  { label: '无衬线', value: "'Inter', 'Noto Sans SC', sans-serif" },
  { label: '衬线', value: "'Georgia', 'Noto Serif SC', serif" },
  { label: '等宽', value: "'JetBrains Mono', 'Fira Code', monospace" },
];

export function ThemeConfigPanel() {
  const { themeConfig, setThemeConfig } = usePreview();
  const { themePanelOpen } = useUI();

  if (!themePanelOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-40">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">主题配置</h3>

      {/* 主色调 */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-2 block">主色调</label>
        <div className="grid grid-cols-6 gap-2">
          {colorPresets.map((color) => (
            <button
              key={color.value}
              onClick={() => setThemeConfig({ ...themeConfig, primaryColor: color.value })}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                themeConfig.primaryColor === color.value ? 'border-gray-900 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* 字体 */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-2 block">字体</label>
        <div className="flex flex-col gap-1">
          {fontPresets.map((font) => (
            <button
              key={font.value}
              onClick={() => setThemeConfig({ ...themeConfig, fontFamily: font.value })}
              className={`text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                themeConfig.fontFamily === font.value
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      {/* 字号 */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-2 block">字号</label>
        <div className="flex gap-2">
          {(['sm', 'base', 'lg'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setThemeConfig({ ...themeConfig, fontSize: size })}
              className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
                themeConfig.fontSize === size
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {size === 'sm' ? '小' : size === 'base' ? '中' : '大'}
            </button>
          ))}
        </div>
      </div>

      {/* 间距 */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">间距</label>
        <div className="flex gap-2">
          {(['compact', 'normal', 'relaxed'] as const).map((spacing) => (
            <button
              key={spacing}
              onClick={() => setThemeConfig({ ...themeConfig, spacing })}
              className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
                themeConfig.spacing === spacing
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {spacing === 'compact' ? '紧凑' : spacing === 'normal' ? '标准' : '宽松'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/components/ThemeConfigPanel.tsx
git commit -m "feat(ui): add ThemeConfigPanel with color, font, size, spacing controls"
```

---

### Task 4: 简历列表侧边栏

**Files:**
- Create: `apps/web/src/components/ResumeList.tsx`

**Interfaces:**
- Produces: `ResumeList` 组件

- [ ] **Step 1: 创建 ResumeList.tsx**

```tsx
import { useEffect } from 'react';
import { useResumeStore } from '@/store/ResumeContext';
import { useResume } from '@/hooks/useResume';
import { useUI } from '@/store/UIContext';

export function ResumeList() {
  const { resumes, currentResume, setCurrentResume, isLoading } = useResumeStore();
  const { fetchResumes } = useResume();
  const { sidebarOpen } = useUI();

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  if (!sidebarOpen) return null;

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">我的简历</h2>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-8">暂无简历，点击下方创建</p>
        ) : (
          <div className="flex flex-col gap-1">
            {resumes.map((resume) => (
              <button
                key={resume.id}
                onClick={() => setCurrentResume(resume)}
                className={`text-left px-3 py-2.5 rounded-lg transition-colors ${
                  currentResume?.id === resume.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="text-sm font-medium text-gray-900 truncate">{resume.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(resume.updated_at).toLocaleDateString('zh-CN')}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 border-t border-gray-200">
        <button className="w-full btn-secondary text-xs py-2">
          + 新建简历
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/components/ResumeList.tsx
git commit -m "feat(ui): add ResumeList sidebar component"
```

---

### Task 5: 增强工具栏与快捷键

**Files:**
- Modify: `apps/web/src/editor/Toolbar.tsx`
- Modify: `apps/web/src/editor/shortcuts.ts`
- Create: `apps/web/src/hooks/useKeyboardShortcut.ts`

**Interfaces:**
- Produces: 增强版 `Toolbar` 组件
- Produces: `useKeyboardShortcut` hook

- [ ] **Step 1: 更新 Toolbar.tsx**

```tsx
import { useEditor, useEditorDispatch } from '@/store/EditorContext';

export function Toolbar() {
  const { markdown: doc, cursorPosition } = useEditor();
  const dispatch = useEditorDispatch();

  const insertText = (before: string, after: string = '') => {
    const lines = doc.split('\n');
    const line = lines[cursorPosition.line - 1] || '';
    const beforeText = line.slice(0, cursorPosition.ch);
    const afterText = line.slice(cursorPosition.ch);
    lines[cursorPosition.line - 1] = beforeText + before + after + afterText;
    dispatch({ type: 'SET_MARKDOWN', payload: lines.join('\n') });
  };

  const buttons = [
    { label: 'B', title: '粗体 (Ctrl+B)', action: () => insertText('**', '**'), fontWeight: 'bold' as const },
    { label: 'I', title: '斜体 (Ctrl+I)', action: () => insertText('*', '*'), fontStyle: 'italic' as const },
    { label: 'H1', title: '标题1', action: () => insertText('# ') },
    { label: 'H2', title: '标题2', action: () => insertText('## ') },
    { label: 'H3', title: '标题3', action: () => insertText('### ') },
    { label: '•', title: '列表', action: () => insertText('- ') },
    { label: '🔗', title: '链接', action: () => insertText('[', '](url)') },
    { label: '📷', title: '图片', action: () => insertText('![alt](', ')') },
    { label: '```', title: '代码块', action: () => insertText('```\n', '\n```') },
  ];

  return (
    <div className="flex items-center gap-0.5 px-3 py-2 bg-gray-800 border-b border-gray-700">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.action}
          title={btn.title}
          className="px-2 py-1 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
          style={{ fontWeight: btn.fontWeight, fontStyle: btn.fontStyle }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 更新 shortcuts.ts**

```typescript
export interface ShortcutMap {
  [key: string]: () => void;
}

export const editorShortcuts: ShortcutMap = {
  'Ctrl-b': () => {},
  'Ctrl-i': () => {},
  'Ctrl-s': () => {},
  'Ctrl-k': () => {},
};
```

- [ ] **Step 3: 创建 useKeyboardShortcut.ts**

```typescript
import { useEffect } from 'react';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';

export function useKeyboardShortcut() {
  const { markdown: doc, cursorPosition } = useEditor();
  const dispatch = useEditorDispatch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            insertText('**', '**');
            break;
          case 'i':
            e.preventDefault();
            insertText('*', '*');
            break;
          case 's':
            e.preventDefault();
            // Trigger save - handled by parent
            break;
        }
      }
    };

    const insertText = (before: string, after: string) => {
      const lines = doc.split('\n');
      const line = lines[cursorPosition.line - 1] || '';
      const beforeText = line.slice(0, cursorPosition.ch);
      const afterText = line.slice(cursorPosition.ch);
      lines[cursorPosition.line - 1] = beforeText + before + after + afterText;
      dispatch({ type: 'SET_MARKDOWN', payload: lines.join('\n') });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [doc, cursorPosition, dispatch]);
}
```

- [ ] **Step 4: 提交**

```bash
git add apps/web/src/editor/ apps/web/src/hooks/useKeyboardShortcut.ts
git commit -m "feat(editor): enhance toolbar with more formatting options and keyboard shortcuts"
```

---

### Task 6: 手动保存按钮与顶部栏

**Files:**
- Create: `apps/web/src/components/SaveButton.tsx`
- Create: `apps/web/src/components/TopBar.tsx`

**Interfaces:**
- Produces: `SaveButton` 组件
- Produces: `TopBar` 组件

- [ ] **Step 1: 创建 SaveButton.tsx**

```tsx
import { useState } from 'react';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useResume } from '@/hooks/useResume';
import { useToast } from '@/hooks/useToast';

export function SaveButton() {
  const { markdown, isDirty } = useEditor();
  const dispatch = useEditorDispatch();
  const { currentResume } = useResumeStore();
  const { updateResume } = useResume();
  const addToast = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentResume) {
      addToast('请先创建简历', 'error');
      return;
    }
    setSaving(true);
    const result = await updateResume(currentResume.id, { markdown });
    if (result) {
      dispatch({ type: 'MARK_CLEAN' });
      addToast('保存成功', 'success');
    } else {
      addToast('保存失败', 'error');
    }
    setSaving(false);
  };

  return (
    <button
      onClick={handleSave}
      disabled={!isDirty || saving}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
        isDirty
          ? 'bg-primary-600 text-white hover:bg-primary-700'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {saving ? '保存中...' : isDirty ? '保存' : '已保存'}
    </button>
  );
}
```

- [ ] **Step 2: 创建 TopBar.tsx**

```tsx
import { useUI } from '@/store/UIContext';
import { SaveButton } from '@/components/SaveButton';
import { ThemeConfigPanel } from '@/components/ThemeConfigPanel';

export function TopBar() {
  const { toggleThemePanel, themePanelOpen } = useUI();

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
      </div>
      <ThemeConfigPanel />
    </header>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/components/SaveButton.tsx apps/web/src/components/TopBar.tsx
git commit -m "feat(ui): add TopBar and SaveButton components"
```

---

### Task 7: 集成页面布局

**Files:**
- Modify: `apps/web/src/pages/EditorPage.tsx`
- Modify: `apps/web/src/App.tsx`

**Interfaces:**
- Produces: 更新后的编辑器页面（集成侧边栏 + 顶部栏）

- [ ] **Step 1: 更新 EditorPage.tsx**

```tsx
import { MarkdownEditor } from '@/editor/MarkdownEditor';
import { ResumePreview } from '@/preview/ResumePreview';
import { ResumeList } from '@/components/ResumeList';
import { TopBar } from '@/components/TopBar';
import { Toast } from '@/components/Toast';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export function EditorPage() {
  useAutoSave();
  useKeyboardShortcut();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <ResumeList />
        <div className="flex flex-1">
          <div className="w-1/2 p-3">
            <MarkdownEditor />
          </div>
          <div className="w-1/2 p-3">
            <ResumePreview />
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}
```

- [ ] **Step 2: 更新 App.tsx**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EditorProvider } from '@/store/EditorContext';
import { ResumeProvider } from '@/store/ResumeContext';
import { PreviewProvider } from '@/store/PreviewContext';
import { UIProvider } from '@/store/UIContext';
import { EditorPage } from '@/pages/EditorPage';
import { HomePage } from '@/pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <EditorProvider>
          <ResumeProvider>
            <PreviewProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/editor/:id" element={<EditorPage />} />
              </Routes>
            </PreviewProvider>
          </ResumeProvider>
        </EditorProvider>
      </UIProvider>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/pages/EditorPage.tsx apps/web/src/App.tsx
git commit -m "feat(editor): integrate sidebar, topbar, and toast into editor layout"
```

---

### Task 8: 后端模板数据同步

**Files:**
- Modify: `apps/api/app/api/v1/templates.py`

**Interfaces:**
- Produces: 更新后的模板列表端点（返回 4 个模板）

- [ ] **Step 1: 更新 templates.py**

```python
from fastapi import APIRouter

from app.schemas import TemplateSchema

router = APIRouter(prefix="/templates", tags=["templates"])

BUILTIN_TEMPLATES = [
    {
        "id": "classic",
        "name": "经典简洁",
        "description": "经典黑白设计，适合正式求职场景",
        "thumbnail": "/templates/classic-thumb.svg",
        "css_styles": "/* classic template css */",
        "block_mapping": {"h1": "name", "h2": "section-title", "h3": "item-title", "ul": "list", "p": "description"},
        "is_builtin": True,
        "default_theme": {"primaryColor": "#111827", "fontFamily": "serif", "fontSize": "base", "spacing": "normal"},
    },
    {
        "id": "modern",
        "name": "现代设计",
        "description": "蓝色主调，现代感十足，适合互联网/科技公司",
        "thumbnail": "/templates/modern-thumb.svg",
        "css_styles": "/* modern template css */",
        "block_mapping": {"h1": "name", "h2": "section-title", "h3": "item-title", "ul": "list", "p": "description"},
        "is_builtin": True,
        "default_theme": {"primaryColor": "#2563EB", "fontFamily": "sans-serif", "fontSize": "base", "spacing": "normal"},
    },
    {
        "id": "elegant",
        "name": "优雅复古",
        "description": "优雅复古设计，适合设计/创意/教育行业",
        "thumbnail": "/templates/elegant-thumb.svg",
        "css_styles": "/* elegant template css */",
        "block_mapping": {"h1": "name", "h2": "section-title", "h3": "item-title", "ul": "list", "p": "description"},
        "is_builtin": True,
        "default_theme": {"primaryColor": "#78350F", "fontFamily": "serif", "fontSize": "base", "spacing": "relaxed"},
    },
    {
        "id": "tech",
        "name": "技术极简",
        "description": "极简技术风格，适合技术/开源/开发者",
        "thumbnail": "/templates/tech-thumb.svg",
        "css_styles": "/* tech template css */",
        "block_mapping": {"h1": "name", "h2": "section-title", "h3": "item-title", "ul": "list", "p": "description"},
        "is_builtin": True,
        "default_theme": {"primaryColor": "#10B981", "fontFamily": "monospace", "fontSize": "sm", "spacing": "compact"},
    },
]


@router.get("", response_model=list[TemplateSchema])
async def list_templates():
    return BUILTIN_TEMPLATES
```

- [ ] **Step 2: 提交**

```bash
git add apps/api/app/api/v1/templates.py
git commit -m "feat(api): sync backend template list with 4 built-in templates"
```

---

## 自检清单

| Spec 要求 | 对应 Task | 状态 |
|-----------|-----------|------|
| 内置 3-5 套模板 | Task 1, 8 | ✅ |
| 模板切换 | Task 1, 7 | ✅ |
| 主题配置面板 | Task 3 | ✅ |
| 自动保存 + 手动保存 | Task 6 | ✅ |
| 简历列表管理 | Task 4 | ✅ |
| 编辑器工具栏 + 快捷键 | Task 5 | ✅ |
| 设计令牌遵循 | Task 1, 3 | ✅ |
| 交互动效规范 | Task 2 (Toast) | ✅ |
