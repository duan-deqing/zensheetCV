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
