import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { useEditor } from '@/store/EditorContext';
import { useUI } from '@/store/UIContext';
import { HoverTip } from '@/components/HoverTip';

export function AIPanel() {
  const [activeTab, setActiveTab] = useState<'polish' | 'keywords' | 'generate'>('polish');
  const [input, setInput] = useState('');
  const [jdInput, setJdInput] = useState('');
  const [generatePoints, setGeneratePoints] = useState('');
  const { result, polish, analyzeKeywords, generateContent, stop, reset } = useAI();
  const { markdown } = useEditor();
  const { toggleAIPanel } = useUI();

  const tabs = [
    { id: 'polish', label: '润色' },
    { id: 'keywords', label: '关键词' },
    { id: 'generate', label: '生成' },
  ] as const;

  const textareaClass =
    'w-full h-24 font-mono text-[13px] leading-relaxed p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none outline-none placeholder:text-gray-400 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors';

  return (
    <div className="w-full h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex items-center gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0">
          {'< AI ASSISTANT />'}
        </p>
        <span className="w-px h-4 bg-gray-200 shrink-0" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-gray-900">AI 助手</h2>
        <HoverTip text="收起 AI 助手">
          <button
            onClick={toggleAIPanel}
            className="ml-auto w-7 h-7 font-mono text-sm text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors flex items-center justify-center shrink-0"
            aria-label="收起 AI 助手"
          >
            ✕
          </button>
        </HoverTip>
      </div>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); reset(); }}
            className={`flex-1 font-mono text-[13px] py-2.5 transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-primary-600 border-primary-600 font-medium'
                : 'text-gray-500 border-transparent hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
        {activeTab === 'polish' && (
          <>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="粘贴需要润色的简历内容..." className={textareaClass} />
            <button onClick={() => polish(input)} disabled={!input.trim() || result.isStreaming} className="btn-primary w-full font-mono text-[13px] h-9 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {result.isStreaming ? '润色中...' : '开始润色'}
            </button>
          </>
        )}
        {activeTab === 'keywords' && (
          <>
            <textarea value={jdInput} onChange={(e) => setJdInput(e.target.value)} placeholder="粘贴目标职位描述(JD)..." className={textareaClass} />
            <button onClick={() => analyzeKeywords(jdInput, markdown)} disabled={!jdInput.trim() || result.isStreaming} className="btn-primary w-full font-mono text-[13px] h-9 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {result.isStreaming ? '分析中...' : '分析关键词'}
            </button>
          </>
        )}
        {activeTab === 'generate' && (
          <>
            <textarea value={generatePoints} onChange={(e) => setGeneratePoints(e.target.value)} placeholder="输入项目要点，每行一个..." className={textareaClass} />
            <button onClick={() => generateContent(generatePoints.split('\n').filter(Boolean))} disabled={!generatePoints.trim() || result.isStreaming} className="btn-primary w-full font-mono text-[13px] h-9 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {result.isStreaming ? '生成中...' : '生成描述'}
            </button>
          </>
        )}
        {result.text && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
                {'// RESULT'}
              </span>
              {result.isStreaming && (
                <button
                  onClick={stop}
                  className="font-mono text-[11px] px-2 h-6 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  停止
                </button>
              )}
            </div>
            <p className="font-mono text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">{result.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
