import { useEffect } from 'react';
import { editorViewRef, insertMarkdown } from '@/editor/insertMarkdown';

export function useKeyboardShortcut() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            insertMarkdown(editorViewRef.current, '**', '**');
            break;
          case 'i':
            e.preventDefault();
            insertMarkdown(editorViewRef.current, '*', '*');
            break;
          case 's':
            e.preventDefault();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
