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
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
        {activeTab === 'polish' && (
          <>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="粘贴需要润色的简历内容..." className="w-full h-24 text-xs p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
            <button onClick={() => polish(input)} disabled={!input.trim() || result.isStreaming} className="btn-primary text-xs py-2 disabled:opacity-50">
              {result.isStreaming ? '润色中...' : '开始润色'}
            </button>
          </>
        )}
        {activeTab === 'keywords' && (
          <>
            <textarea value={jdInput} onChange={(e) => setJdInput(e.target.value)} placeholder="粘贴目标职位描述(JD)..." className="w-full h-24 text-xs p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
            <button onClick={() => analyzeKeywords(jdInput, '')} disabled={!jdInput.trim() || result.isStreaming} className="btn-primary text-xs py-2 disabled:opacity-50">
              {result.isStreaming ? '分析中...' : '分析关键词'}
            </button>
          </>
        )}
        {activeTab === 'generate' && (
          <>
            <textarea value={generatePoints} onChange={(e) => setGeneratePoints(e.target.value)} placeholder="输入项目要点，每行一个..." className="w-full h-24 text-xs p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
            <button onClick={() => generateContent(generatePoints.split('\n').filter(Boolean))} disabled={!generatePoints.trim() || result.isStreaming} className="btn-primary text-xs py-2 disabled:opacity-50">
              {result.isStreaming ? '生成中...' : '生成描述'}
            </button>
          </>
        )}
        {result.text && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">结果</span>
              {result.isStreaming && <button onClick={stop} className="text-xs text-red-500 hover:text-red-700">停止</button>}
            </div>
            <p className="text-xs text-gray-600 whitespace-pre-wrap">{result.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
