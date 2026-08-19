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
