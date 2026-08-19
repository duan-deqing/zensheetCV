import { MarkdownEditor } from '@/editor/MarkdownEditor';
import { ResumePreview } from '@/preview/ResumePreview';
import { useAutoSave } from '@/hooks/useAutoSave';

export function EditorPage() {
  useAutoSave();

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/2 p-3">
        <MarkdownEditor />
      </div>
      <div className="w-1/2 p-3">
        <ResumePreview />
      </div>
    </div>
  );
}
