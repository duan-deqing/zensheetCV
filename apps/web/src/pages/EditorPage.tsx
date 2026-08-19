import { MarkdownEditor } from '@/editor/MarkdownEditor';
import { ResumePreview } from '@/preview/ResumePreview';
import { ResumeList } from '@/components/ResumeList';
import { TopBar } from '@/components/TopBar';
import { AIPanel } from '@/components/AIPanel';
import { Toast } from '@/components/Toast';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export function EditorPage() {
  useAutoSave();
  useKeyboardShortcut();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <ResumeList />
        <div className="flex flex-1">
          <div className="w-1/2 p-3">
            <MarkdownEditor />
          </div>
          <div className="w-1/2 p-3">
            <ResumePreview />
          </div>
        </div>
        <AIPanel />
      </div>
      <Toast />
    </div>
  );
}
