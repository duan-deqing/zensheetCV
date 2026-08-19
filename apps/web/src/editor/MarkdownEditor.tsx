import { useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import { Toolbar } from './Toolbar';

export function MarkdownEditor() {
  const { markdown: doc } = useEditor();
  const dispatch = useEditorDispatch();

  const extensions = useMemo(() => [markdown()], []);

  const onChange = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_MARKDOWN', payload: value });
    },
    [dispatch],
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      <Toolbar />
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={doc}
          height="100%"
          theme={oneDark}
          extensions={extensions}
          onChange={onChange}
          className="h-full text-sm"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            foldGutter: true,
          }}
        />
      </div>
    </div>
  );
}
