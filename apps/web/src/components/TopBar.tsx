import { useUI } from '@/store/UIContext';
import { SaveButton } from '@/components/SaveButton';
import { ThemeConfigPanel } from '@/components/ThemeConfigPanel';

export function TopBar() {
  const { toggleThemePanel, themePanelOpen } = useUI();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 relative">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-gray-900">Stylan Resume</h1>
      </div>
      <div className="flex items-center gap-2">
        <SaveButton />
        <button
          onClick={toggleThemePanel}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            themePanelOpen
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎨 主题
        </button>
        <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          📄 导出 PDF
        </button>
      </div>
      <ThemeConfigPanel />
    </header>
  );
}
