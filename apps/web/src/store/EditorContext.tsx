import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { getLang } from '@/i18n/LangContext';

interface EditorState {
  markdown: string;
  isDirty: boolean;
}

type EditorAction =
  | { type: 'SET_MARKDOWN'; payload: string }
  | { type: 'MARK_DIRTY' }
  | { type: 'MARK_CLEAN' }
  | { type: 'RESET'; payload: string };

/** 初始骨架：按当前语言给出中文/英文占位章节 */
function initialMarkdown(): string {
  return getLang() === 'en'
    ? '# Name\n\n## Work Experience\n\n## Projects\n\n## Education\n'
    : '# 姓名\n\n## 工作经历\n\n## 项目经验\n\n## 教育背景\n';
}

const initialState: EditorState = {
  markdown: initialMarkdown(),
  isDirty: false,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_MARKDOWN':
      return { ...state, markdown: action.payload, isDirty: true };
    case 'MARK_DIRTY':
      // 仅置脏标记（模板/主题切换等非内容变更），不触碰 markdown 引用
      return state.isDirty ? state : { ...state, isDirty: true };
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
