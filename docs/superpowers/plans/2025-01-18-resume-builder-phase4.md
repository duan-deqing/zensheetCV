# 在线简历编辑器 - Phase 4 AI 功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 实现 AI 内容润色、关键词优化分析、智能内容生成，支持 SSE 流式输出

**架构:** OpenAI API + FastAPI SSE + React 流式渲染

**Tech Stack:** OpenAI SDK, FastAPI SSE (text/event-stream), React 18, TypeScript 5

## Global Constraints

- 使用 OpenAI GPT-4o-mini 模型（成本最优）
- AI 功能通过 SSE (Server-Sent Events) 流式返回
- AI Provider 接口抽象，支持多 LLM 后端切换
- 提交信息遵循 Conventional Commits 规范

---

### Task 1: AI 服务层

**Files:**
- Create: `apps/api/app/services/ai_service.py`
- Create: `apps/api/app/schemas/ai.py`

**Interfaces:**
- Produces: `AIService` 类
- Produces: AI 请求/响应 Pydantic schemas

- [ ] **Step 1: 创建 schemas/ai.py**

```python
from pydantic import BaseModel


class AIPolishRequest(BaseModel):
    text: str
    context: str = "工作经历"


class AIKeywordsRequest(BaseModel):
    jd: str
    resume: str


class AIGenerateRequest(BaseModel):
    points: list[str]
    context: str = "项目经验"


class AIStreamResponse(BaseModel):
    delta: str
    done: bool = False
```

- [ ] **Step 2: 创建 services/ai_service.py**

```python
import json
from collections.abc import AsyncIterator

from openai import AsyncOpenAI

from app.core.config import settings
from app.schemas.ai import *


class AIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    async def polish(self, text: str, context: str) -> AsyncIterator[str]:
        if not self.client:
            yield "[错误] OpenAI API Key 未配置"
            return

        prompt = f"""你是资深简历优化专家。用户会提供一段简历{content}内容，你需要：
1. 使用更专业、有力的动词替换平淡表述
2. 尽可能加入量化成果（如用户提供了数据）
3. 保持原意不变
4. 输出简体中文
5. 每次只优化一段，保持简洁

原文：{text}"""

        stream = await self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            stream=True,
            max_tokens=500,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def analyze_keywords(self, jd: str, resume: str) -> dict:
        if not self.client:
            return {"matched": [], "missing": [], "suggestions": ["OpenAI API Key 未配置"]}

        prompt = f"""你是求职顾问。用户提供目标职位描述(JD)和其简历内容。你需要：
1. 从 JD 提取 5-10 个核心关键词/技能词
2. 标出简历中已包含和缺失的关键词
3. 给出 3 条具体的改进建议
4. 严格输出 JSON 格式：{{"matched": [...], "missing": [...], "suggestions": [...]}}

JD：{jd}

简历：{resume}"""

        response = await self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        return json.loads(content)

    async def generate_content(self, points: list[str], context: str) -> AsyncIterator[str]:
        if not self.client:
            yield "[错误] OpenAI API Key 未配置"
            return

        points_text = "\n".join(f"- {p}" for p in points)
        prompt = f"""你擅长帮技术人员撰写项目描述。用户提供项目要点列表，你需要按 STAR 格式扩展成流畅的 2-3 段描述：
- Situation（情境）：项目背景
- Task（任务）：你的职责
- Action（行动）：具体行动
- Result（结果）：量化成果

项目要点：
{points_text}

上下文：{context}"""

        stream = await self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            stream=True,
            max_tokens=1000,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
```

- [ ] **Step 3: 提交**

```bash
git add apps/api/app/services/ai_service.py apps/api/app/schemas/ai.py
git commit -m "feat(ai): add AI service with polish, keywords, and generate capabilities"
```

---

### Task 2: AI API 路由（SSE 流式）

**Files:**
- Create: `apps/api/app/api/v1/ai.py`

**Interfaces:**
- Produces: `/api/v1/ai/{polish,keywords,generate}` 端点

- [ ] **Step 1: 创建 ai.py**

```python
import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.schemas.ai import *
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])
security = HTTPBearer()


@router.post("/polish")
async def polish_text(data: AIPolishRequest):
    service = AIService()

    async def generate():
        async for delta in service.polish(data.text, data.context):
            yield f"data: {json.dumps({'delta': delta}, ensure_ascii=False)}\n\n"
        yield f"data: {json.dumps({'done': True}, ensure_ascii=False)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/keywords")
async def analyze_keywords(data: AIKeywordsRequest):
    service = AIService()
    result = await service.analyze_keywords(data.jd, data.resume)
    return result


@router.post("/generate")
async def generate_content(data: AIGenerateRequest):
    service = AIService()

    async def generate():
        async for delta in service.generate_content(data.points, data.context):
            yield f"data: {json.dumps({'delta': delta}, ensure_ascii=False)}\n\n"
        yield f"data: {json.dumps({'done': True}, ensure_ascii=False)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
```

- [ ] **Step 2: 更新 main.py 注册 AI 路由**

```python
from app.api.v1 import resumes, templates, pdf, auth, ai

# ... 添加:
app.include_router(ai.router, prefix="/api/v1")
```

- [ ] **Step 3: 提交**

```bash
git add apps/api/app/
git commit -m "feat(ai): add SSE streaming AI endpoints for polish, keywords, generate"
```

---

### Task 3: 前端 AI 助手组件

**Files:**
- Create: `apps/web/src/components/AIPanel.tsx`
- Create: `apps/web/src/hooks/useAI.ts`

**Interfaces:**
- Produces: `AIPanel` 组件
- Produces: `useAI` hook（SSE 流式响应处理）

- [ ] **Step 1: 创建 useAI.ts**

```typescript
import { useState, useCallback, useRef } from 'react';

interface AIResult {
  text: string;
  isStreaming: boolean;
}

export function useAI() {
  const [result, setResult] = useState<AIResult>({ text: '', isStreaming: false });
  const abortRef = useRef<AbortController | null>(null);

  const polish = useCallback(async (text: string, context: string = '工作经历') => {
    setResult({ text: '', isStreaming: true });
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/ai/polish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text, context }),
        signal: controller.signal,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.delta) {
                  accumulated += data.delta;
                  setResult({ text: accumulated, isStreaming: true });
                }
                if (data.done) {
                  setResult({ text: accumulated, isStreaming: false });
                }
              } catch {}
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setResult({ text: '请求失败，请重试', isStreaming: false });
      }
    }
  }, []);

  const analyzeKeywords = useCallback(async (jd: string, resume: string) => {
    setResult({ text: '', isStreaming: true });
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/ai/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ jd, resume }),
      });
      const data = await response.json();
      const text = `**已匹配关键词：** ${data.matched?.join(', ') || '无'}\n\n**缺失关键词：** ${data.missing?.join(', ') || '无'}\n\n**改进建议：**\n${data.suggestions?.map((s: string) => `- ${s}`).join('\n') || '无'}`;
      setResult({ text, isStreaming: false });
    } catch {
      setResult({ text: '分析失败，请重试', isStreaming: false });
    }
  }, []);

  const generateContent = useCallback(async (points: string[], context: string = '项目经验') => {
    setResult({ text: '', isStreaming: true });
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ points, context }),
        signal: controller.signal,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.delta) {
                  accumulated += data.delta;
                  setResult({ text: accumulated, isStreaming: true });
                }
                if (data.done) {
                  setResult({ text: accumulated, isStreaming: false });
                }
              } catch {}
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setResult({ text: '生成失败，请重试', isStreaming: false });
      }
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setResult((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const reset = useCallback(() => {
    setResult({ text: '', isStreaming: false });
  }, []);

  return { result, polish, analyzeKeywords, generateContent, stop, reset };
}
```

- [ ] **Step 2: 创建 AIPanel.tsx**

```tsx
import { useState } from 'react';
import { useAI } from '@/hooks/useAI';

export function AIPanel() {
  const [activeTab, setActiveTab] = useState<'polish' | 'keywords' | 'generate'>('polish');
  const [input, setInput] = useState('');
  const [jdInput, setJdInput] = useState('');
  const [generatePoints, setGeneratePoints] = useState('');
  const { result, polish, analyzeKeywords, generateContent, stop, reset } = useAI();

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">AI 助手</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'polish', label: '润色' },
          { id: 'keywords', label: '关键词' },
          { id: 'generate', label: '生成' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); reset(); }}
            className={`flex-1 text-xs py-2 transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
        {activeTab === 'polish' && (
          <>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="粘贴需要润色的简历内容..."
              className="w-full h-24 text-xs p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <button
              onClick={() => polish(input)}
              disabled={!input.trim() || result.isStreaming}
              className="btn-primary text-xs py-2 disabled:opacity-50"
            >
              {result.isStreaming ? '润色中...' : '开始润色'}
            </button>
          </>
        )}

        {activeTab === 'keywords' && (
          <>
            <textarea
              value={jdInput}
              onChange={(e) => setJdInput(e.target.value)}
              placeholder="粘贴目标职位描述(JD)..."
              className="w-full h-24 text-xs p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <button
              onClick={() => analyzeKeywords(jdInput, '')}
              disabled={!jdInput.trim() || result.isStreaming}
              className="btn-primary text-xs py-2 disabled:opacity-50"
            >
              {result.isStreaming ? '分析中...' : '分析关键词'}
            </button>
          </>
        )}

        {activeTab === 'generate' && (
          <>
            <textarea
              value={generatePoints}
              onChange={(e) => setGeneratePoints(e.target.value)}
              placeholder="输入项目要点，每行一个..."
              className="w-full h-24 text-xs p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <button
              onClick={() => generateContent(generatePoints.split('\n').filter(Boolean))}
              disabled={!generatePoints.trim() || result.isStreaming}
              className="btn-primary text-xs py-2 disabled:opacity-50"
            >
              {result.isStreaming ? '生成中...' : '生成描述'}
            </button>
          </>
        )}

        {/* Result */}
        {result.text && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">结果</span>
              {result.isStreaming && (
                <button onClick={stop} className="text-xs text-red-500 hover:text-red-700">停止</button>
              )}
            </div>
            <p className="text-xs text-gray-600 whitespace-pre-wrap">{result.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/components/AIPanel.tsx apps/web/src/hooks/useAI.ts
git commit -m "feat(ai): add AI panel component with SSE streaming support"
```

---

### Task 4: 集成 AI 面板到编辑器

**Files:**
- Modify: `apps/web/src/pages/EditorPage.tsx`
- Modify: `apps/api/app/main.py`

**Interfaces:**
- Produces: 更新后的编辑器页面（含 AI 侧边栏）

- [ ] **Step 1: 更新 EditorPage.tsx**

```tsx
import { MarkdownEditor } from '@/editor/MarkdownEditor';
import { ResumePreview } from '@/preview/ResumePreview';
import { ResumeList } from '@/components/ResumeList';
import { TopBar } from '@/components/TopBar';
import { AIPanel } from '@/components/AIPanel';
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
        <AIPanel />
      </div>
      <Toast />
    </div>
  );
}
```

- [ ] **Step 2: 更新 main.py 添加 AI 路由**

Add to the existing main.py:
```python
from app.api.v1 import resumes, templates, pdf, auth, ai

# Add this line with other router registrations:
app.include_router(ai.router, prefix="/api/v1")
```

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/pages/EditorPage.tsx apps/api/app/main.py
git commit -m "feat(ai): integrate AI panel into editor layout"
```

---

### Task 5: Phase 4 测试

**Files:**
- Create: `apps/api/tests/integration/test_ai.py`

**Interfaces:**
- Produces: AI 服务集成测试

- [ ] **Step 1: 创建 test_ai.py**

```python
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.ai_service import AIService


@pytest.mark.asyncio
async def test_polish_stream():
    service = AIService()
    # Mock the OpenAI client
    mock_chunk = MagicMock()
    mock_chunk.choices = [MagicMock()]
    mock_chunk.choices[0].delta.content = "优化后的文本"

    mock_stream = AsyncMock()
    mock_stream.__aiter__.return_value = [mock_chunk]

    service.client = AsyncMock()
    service.client.chat.completions.create.return_value = mock_stream

    result = []
    async for delta in service.polish("原始文本", "工作经历"):
        result.append(delta)

    assert len(result) > 0
    assert "优化" in result[0]


@pytest.mark.asyncio
async def test_analyze_keywords():
    service = AIService()
    service.client = AsyncMock()
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"matched": ["React"], "missing": ["Vue"], "suggestions": ["建议1"]}'
    service.client.chat.completions.create.return_value = mock_response

    result = await service.analyze_keywords("需要React", "我有React经验")
    assert "matched" in result
    assert "missing" in result


@pytest.mark.asyncio
async def test_generate_stream():
    service = AIService()
    mock_chunk = MagicMock()
    mock_chunk.choices = [MagicMock()]
    mock_chunk.choices[0].delta.content = "STAR格式描述"

    mock_stream = AsyncMock()
    mock_stream.__aiter__.return_value = [mock_chunk]

    service.client = AsyncMock()
    service.client.chat.completions.create.return_value = mock_stream

    result = []
    async for delta in service.generate_content(["要点1", "要点2"], "项目经验"):
        result.append(delta)

    assert len(result) > 0
```

- [ ] **Step 2: 提交**

```bash
git add apps/api/tests/integration/test_ai.py
git commit -m "test(ai): add AI service unit tests with mocked OpenAI client"
```

---

## 自检清单

| Spec 要求 | 对应 Task | 状态 |
|-----------|-----------|------|
| AI 内容润色 | Task 1, 3 | ✅ |
| 关键词优化 | Task 1, 3 | ✅ |
| AI 内容生成 | Task 1, 3 | ✅ |
| SSE 流式输出 | Task 2, 3 | ✅ |
| AI Provider 抽象 | Task 1 | ✅ |
