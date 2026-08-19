import { useEditor, useEditorDispatch } from '@/store/EditorContext';

export function Toolbar() {
  const { markdown: doc } = useEditor();
  const dispatch = useEditorDispatch();

  const insertText = (before: string, after: string = '') => {
    const newText = doc + '\n' + before + after;
    dispatch({ type: 'SET_MARKDOWN', payload: newText });
  };

  const buttons = [
    { label: 'B', title: '粗体', action: () => insertText('**', '**') },
    { label: 'I', title: '斜体', action: () => insertText('*', '*') },
    { label: 'H1', title: '标题1', action: () => insertText('# ') },
    { label: 'H2', title: '标题2', action: () => insertText('## ') },
    { label: 'H3', title: '标题3', action: () => insertText('### ') },
    { label: '•', title: '列表', action: () => insertText('- ') },
    { label: '🔗', title: '链接', action: () => insertText('[', '](url)') },
  ];

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-gray-800 border-b border-gray-700">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.action}
          title={btn.title}
          className="px-2 py-1 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
