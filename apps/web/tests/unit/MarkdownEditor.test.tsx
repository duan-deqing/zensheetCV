import { render, screen } from '@testing-library/react';
import { MarkdownEditor } from '@/editor/MarkdownEditor';
import { EditorProvider } from '@/store/EditorContext';

describe('MarkdownEditor', () => {
  it('renders editor component', () => {
    render(
      <EditorProvider>
        <MarkdownEditor />
      </EditorProvider>,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
