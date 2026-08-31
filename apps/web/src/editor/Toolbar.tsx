import { useEditor } from '@/store/EditorContext';
import { editorViewRef, insertMarkdown } from './insertMarkdown';

/** 内联线性图标，颜色跟随 currentColor */
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
    </svg>
  );
}

export function Toolbar() {
  const { markdown: doc } = useEditor();

  const insertText = (before: string, after = '', atLineStart = false) =>
    insertMarkdown(editorViewRef.current, before, after, atLineStart);

  const buttons = [
    { label: 'B', title: '粗体 (Ctrl+B)', action: () => insertText('**', '**'), fontWeight: 'bold' as const },
    { label: 'I', title: '斜体 (Ctrl+I)', action: () => insertText('*', '*'), fontStyle: 'italic' as const },
    { label: 'H1', title: '标题1', action: () => insertText('# ', '', true) },
    { label: 'H2', title: '标题2', action: () => insertText('## ', '', true) },
    { label: 'H3', title: '标题3', action: () => insertText('### ', '', true) },
    { label: '•', title: '列表', action: () => insertText('- ', '', true) },
    { label: 'link', title: '链接', action: () => insertText('[', '](url)') },
    { label: 'image', title: '图片', action: () => insertText('![alt](', ')') },
    { label: '```', title: '代码块', action: () => insertText('```\n', '\n```') },
  ];

  const lineCount = doc ? doc.split('\n').length : 1;
  const charCount = doc ? doc.length : 0;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0"
        aria-hidden="true"
      >
        {'< MARKDOWN />'}
      </p>
      <span className="w-px h-4 bg-gray-200 shrink-0" aria-hidden="true" />
      <div className="flex items-center gap-0.5 min-w-0">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            title={btn.title}
            className="px-2 h-7 font-mono text-[13px] font-medium text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors flex items-center shrink-0"
            style={{ fontWeight: btn.fontWeight, fontStyle: btn.fontStyle }}
          >
            {btn.label === 'link' ? <LinkIcon /> : btn.label === 'image' ? <ImageIcon /> : btn.label}
          </button>
        ))}
      </div>
      <p className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 tabular-nums shrink-0 hidden md:block">
        {lineCount} LINES · {charCount} CHARS
      </p>
    </div>
  );
}
