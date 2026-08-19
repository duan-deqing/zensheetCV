import { useUI } from '@/store/UIContext';
import { useAuth } from '@/store/AuthContext';
import { SaveButton } from '@/components/SaveButton';
import { ThemeConfigPanel } from '@/components/ThemeConfigPanel';

export function TopBar() {
  const { toggleThemePanel, themePanelOpen } = useUI();
  const { user, logout } = useAuth();

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
        {user && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
            <span className="text-xs text-gray-600">{user.name}</span>
            <button onClick={logout} className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
              退出
            </button>
          </div>
        )}
      </div>
      <ThemeConfigPanel />
    </header>
  );
}
