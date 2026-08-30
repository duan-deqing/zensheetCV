import { useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { useEditor, useEditorDispatch } from '@/store/EditorContext';
import { Toolbar } from './Toolbar';
import { editorViewRef } from './insertMarkdown';

// 与主页一致的白底 + 蓝色 accent 外观
const editorBaseTheme = EditorView.theme(
  {
    '&': { backgroundColor: '#ffffff', color: '#374151' },
    '.cm-content': {
      caretColor: '#2563eb',
      fontFamily: "'JetBrains Mono', monospace",
      // 无行号栏，用内边距留出书写区边距
      padding: '16px 20px',
    },
    // 必须用半透明色：选区层 z-index 为 -1，绘制在行背景之下，
    // 不透明的活动行背景会盖住选区高亮（CM6 默认主题同理使用 #cceeff44）
    '.cm-activeLine': { backgroundColor: 'rgba(243, 244, 246, 0.5)' },
    '.cm-cursor': { borderLeftColor: '#2563eb' },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
      backgroundColor: '#dbeafe',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: '#f3f4f6',
      color: '#9ca3af',
      border: '1px solid #e5e7eb',
      borderRadius: '4px',
    },
  },
  { dark: false },
);

// 语法高亮：灰黑正文 + 蓝色结构标记，克制用色
const lightHighlight = HighlightStyle.define([
  { tag: [t.heading1], color: '#111827', fontWeight: 'bold', fontSize: '1.25em' },
  { tag: [t.heading2], color: '#111827', fontWeight: 'bold', fontSize: '1.1em' },
  { tag: [t.heading3], color: '#111827', fontWeight: 'bold' },
  { tag: [t.heading], color: '#111827', fontWeight: 'bold' },
  { tag: [t.strong], color: '#111827', fontWeight: 'bold' },
  { tag: [t.emphasis], color: '#374151', fontStyle: 'italic' },
  { tag: [t.link], color: '#2563eb', textDecoration: 'underline' },
  { tag: [t.url], color: '#2563eb', textDecoration: 'underline' },
  { tag: [t.monospace], color: '#b45309' },
  { tag: [t.keyword], color: '#2563eb', fontWeight: 'bold' },
  { tag: [t.comment], color: '#9ca3af', fontStyle: 'italic' },
  { tag: [t.string], color: '#374151' },
  { tag: [t.list], color: '#9ca3af' },
  { tag: [t.quote], color: '#6b7280', fontStyle: 'italic' },
  { tag: [t.content], color: '#374151' },
  { tag: [t.meta], color: '#3b82f6' },
  { tag: [t.invalid], color: '#dc2626' },
  { tag: [t.attributeName, t.propertyName], color: '#2563eb' },
  { tag: [t.bool, t.number, t.unit], color: '#b45309' },
  { tag: [t.typeName], color: '#2563eb' },
  { tag: [t.namespace], color: '#2563eb' },
  { tag: [t.operator], color: '#2563eb' },
  { tag: [t.punctuation], color: '#9ca3af' },
  { tag: [t.processingInstruction], color: '#9ca3af' },
]);

export function MarkdownEditor() {
  const { markdown: doc } = useEditor();
  const dispatch = useEditorDispatch();

  const extensions = useMemo(
    () => [
      markdown(),
      EditorView.lineWrapping,
      editorBaseTheme,
      syntaxHighlighting(lightHighlight),
    ],
    [],
  );

  const onChange = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_MARKDOWN', payload: value });
    },
    [dispatch],
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <Toolbar />
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={doc}
          height="100%"
          extensions={extensions}
          onChange={onChange}
          onCreateEditor={(view) => {
            editorViewRef.current = view;
          }}
          className="h-full text-sm"
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: true,
            highlightActiveLineGutter: false,
          }}
        />
      </div>
    </div>
  );
}
