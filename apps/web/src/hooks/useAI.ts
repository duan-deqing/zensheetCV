import { useState, useCallback, useRef } from 'react';
import { apiClient } from '@/api/client';

interface AIResult {
  text: string;
  isStreaming: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export function useAI() {
  const [result, setResult] = useState<AIResult>({ text: '', isStreaming: false });
  const abortRef = useRef<AbortController | null>(null);

  const streamRequest = useCallback(async (url: string, body: any) => {
    setResult({ text: '', isStreaming: true });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!response.ok) {
        setResult({ text: `请求失败 (${response.status})`, isStreaming: false });
        return;
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          // SSE 事件可能被 chunk 边界截断，先缓存不完整的行
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.error) { setResult({ text: data.error, isStreaming: false }); return; }
                if (data.delta) { accumulated += data.delta; setResult({ text: accumulated, isStreaming: true }); }
                if (data.done) { setResult({ text: accumulated, isStreaming: false }); }
              } catch {}
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') setResult({ text: '请求失败，请重试', isStreaming: false });
    }
  }, []);

  const polish = useCallback((text: string, context: string = '工作经历') => {
    return streamRequest('/api/v1/ai/polish', { text, context });
  }, [streamRequest]);

  const analyzeKeywords = useCallback(async (jd: string, resume: string) => {
    setResult({ text: '', isStreaming: true });
    try {
      const { data } = await apiClient.post('/ai/keywords', { jd, resume });
      const text = `**已匹配关键词：** ${data.matched?.join(', ') || '无'}\n\n**缺失关键词：** ${data.missing?.join(', ') || '无'}\n\n**改进建议：**\n${data.suggestions?.map((s: string) => `- ${s}`).join('\n') || '无'}`;
      setResult({ text, isStreaming: false });
    } catch { setResult({ text: '分析失败，请重试', isStreaming: false }); }
  }, []);

  const generateContent = useCallback((points: string[], context: string = '项目经验') => {
    return streamRequest('/api/v1/ai/generate', { points, context });
  }, [streamRequest]);

  const stop = useCallback(() => { abortRef.current?.abort(); setResult((prev) => ({ ...prev, isStreaming: false })); }, []);
  const reset = useCallback(() => { setResult({ text: '', isStreaming: false }); }, []);

  return { result, polish, analyzeKeywords, generateContent, stop, reset };
}
