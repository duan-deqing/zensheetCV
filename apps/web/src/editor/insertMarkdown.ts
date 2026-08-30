import { EditorView } from '@codemirror/view';

/** 当前 CodeMirror 编辑器实例：由 MarkdownEditor 注册，工具栏与快捷键共用 */
export const editorViewRef: { current: EditorView | null } = { current: null };

/** 在 CodeMirror 当前光标处插入 Markdown 语法：
 * - 包裹型（before + after）：有选区时包裹选区并保持选中；无选区时光标落在两个标记之间
 * - 前缀型（atLineStart，标题/列表）：插入到光标所在行行首，光标置于前缀之后
 * 直接在 EditorView 上以事务方式修改，天然保留光标位置，
 * 修复旧实现依赖从未更新的 cursorPosition 导致永远插入到首行的问题 */
export function insertMarkdown(
  view: EditorView | null,
  before: string,
  after = '',
  atLineStart = false,
) {
  if (!view) return;
  const { state } = view;
  const range = state.selection.main;
  const selected = state.sliceDoc(range.from, range.to);

  if (atLineStart) {
    const line = state.doc.lineAt(range.from);
    view.dispatch({
      changes: { from: line.from, to: line.from, insert: before },
      selection: { anchor: line.from + before.length },
      scrollIntoView: true,
    });
  } else if (selected) {
    const start = range.from;
    view.dispatch({
      changes: { from: range.from, to: range.to, insert: before + selected + after },
      selection: { anchor: start + before.length, head: start + before.length + selected.length },
      scrollIntoView: true,
    });
  } else {
    view.dispatch({
      changes: { from: range.from, to: range.to, insert: before + after },
      selection: { anchor: range.from + before.length },
      scrollIntoView: true,
    });
  }
  view.focus();
}
