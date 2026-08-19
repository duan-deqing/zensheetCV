import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

interface EditorState {
  markdown: string;
  cursorPosition: { line: number; ch: number };
  isDirty: boolean;
}

type EditorAction =
  | { type: 'SET_MARKDOWN'; payload: string }
  | { type: 'SET_CURSOR'; payload: { line: number; ch: number } }
  | { type: 'MARK_CLEAN' }
  | { type: 'RESET'; payload: string };

const initialState: EditorState = {
  markdown: '# 张三\n\n## 工作经历\n\n### ABC公司 | 前端工程师\n\n- 负责前端架构设计与开发\n- 优化性能，首屏加载提升50%\n\n## 项目经验\n\n### 在线简历编辑器\n\n- 独立开发 React + TypeScript 前端\n- 实现 Markdown 实时预览\n\n## 教育背景\n\n### XX大学 | 计算机科学 | 本科\n',
  cursorPosition: { line: 1, ch: 0 },
  isDirty: false,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_MARKDOWN':
      return { ...state, markdown: action.payload, isDirty: true };
    case 'SET_CURSOR':
      return { ...state, cursorPosition: action.payload };
    case 'MARK_CLEAN':
      return { ...state, isDirty: false };
    case 'RESET':
      return { ...initialState, markdown: action.payload };
    default:
      return state;
  }
}

const EditorContext = createContext<EditorState | null>(null);
const EditorDispatchContext = createContext<Dispatch<EditorAction> | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <EditorContext.Provider value={state}>
      <EditorDispatchContext.Provider value={dispatch}>
        {children}
      </EditorDispatchContext.Provider>
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within EditorProvider');
  return context;
}

export function useEditorDispatch() {
  const context = useContext(EditorDispatchContext);
  if (!context) throw new Error('useEditorDispatch must be used within EditorProvider');
  return context;
}
