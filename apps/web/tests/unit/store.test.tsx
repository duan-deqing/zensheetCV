import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { EditorProvider, useEditor, useEditorDispatch } from '@/store/EditorContext';

describe('EditorContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <EditorProvider>{children}</EditorProvider>
  );

  it('should update markdown', () => {
    const { result } = renderHook(
      () => ({ state: useEditor(), dispatch: useEditorDispatch() }),
      { wrapper }
    );

    act(() => {
      result.current.dispatch({ type: 'SET_MARKDOWN', payload: '# New Content' });
    });

    expect(result.current.state.markdown).toBe('# New Content');
    expect(result.current.state.isDirty).toBe(true);
  });

  it('should mark clean', () => {
    const { result } = renderHook(
      () => ({ state: useEditor(), dispatch: useEditorDispatch() }),
      { wrapper }
    );

    act(() => {
      result.current.dispatch({ type: 'SET_MARKDOWN', payload: '# Test' });
    });

    expect(result.current.state.isDirty).toBe(true);

    act(() => {
      result.current.dispatch({ type: 'MARK_CLEAN' });
    });

    expect(result.current.state.isDirty).toBe(false);
  });

  it('should reset to new content', () => {
    const { result } = renderHook(
      () => ({ state: useEditor(), dispatch: useEditorDispatch() }),
      { wrapper }
    );

    act(() => {
      result.current.dispatch({ type: 'RESET', payload: '# Reset Content' });
    });

    expect(result.current.state.markdown).toBe('# Reset Content');
    expect(result.current.state.isDirty).toBe(false);
  });
});
