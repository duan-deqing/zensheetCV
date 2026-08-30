import { usePreview } from '@/store/PreviewContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useUI } from '@/store/UIContext';
import { Dropdown } from '@/components/Dropdown';
import type { ThemeConfig } from '@stylan/shared-types';

const colorPresets = [
  { label: '科技蓝', value: '#2563EB' },
  { label: '翡翠绿', value: '#10B981' },
  { label: '琥珀橙', value: '#F59E0B' },
  { label: '玫瑰红', value: '#E11D48' },
  { label: '紫罗兰', value: '#7C3AED' },
  { label: '石墨黑', value: '#111827' },
];

/** 简历常用字体选项，前三个与内置模板默认值一致，保证旧数据可回显 */
const fontPresets = [
  { label: 'Inter · 现代无衬线', value: "'Inter', 'Noto Sans SC', sans-serif" },
  { label: '思源黑体 · 简洁清晰', value: "'Noto Sans SC', 'Microsoft YaHei', sans-serif" },
  { label: 'Georgia · 经典衬线', value: "'Georgia', 'Noto Serif SC', serif" },
  { label: '思源宋体 · 优雅正式', value: "'Noto Serif SC', 'SimSun', serif" },
  { label: 'JetBrains Mono · 等宽技术', value: "'JetBrains Mono', 'Fira Code', monospace" },
];

const sizeOptions = [
  { value: 'xs', label: '特小' },
  { value: 'sm', label: '偏小' },
  { value: 'base', label: '标准' },
  { value: 'lg', label: '偏大' },
  { value: 'xl', label: '特大' },
] as const;

const spacingOptions = [
  { value: 'tight', label: '极紧凑' },
  { value: 'compact', label: '紧凑' },
  { value: 'normal', label: '标准' },
  { value: 'relaxed', label: '较宽松' },
  { value: 'loose', label: '宽松' },
] as const;

/** 预览窗口内的主题设置侧边栏，随 themePanelOpen 滑入/移除 */
export function ThemeConfigPanel() {
  const { themeConfig, setThemeConfig } = usePreview();
  const { updateTheme } = useResumeStore();
  const { themePanelOpen, toggleThemePanel } = useUI();

  if (!themePanelOpen) return null;

  const applyTheme = (partial: Partial<ThemeConfig>) => {
    setThemeConfig({ ...themeConfig, ...partial });
    // 同步写入简历数据，随自动保存落库
    updateTheme(partial);
  };

  return (
    <aside
      className="theme-side-in w-72 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-y-auto"
      aria-label="主题配置"
    >
      <style>{`
        @keyframes themeSideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .theme-side-in { animation: themeSideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .theme-side-in { animation: none; }
        }
      `}</style>

      {/* 头部：mono 眉标 + 关闭按钮，与 AI 助手面板同构 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 mb-0.5">
            {'// THEME'}
          </p>
          <h3 className="text-sm font-semibold text-gray-900">主题配置</h3>
        </div>
        <button
          onClick={toggleThemePanel}
          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
          title="关闭"
        >
          ✕
        </button>
      </div>

      <div className="p-4 flex flex-col gap-5">
        {/* 主色调 */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
            主色调
          </label>
          <div className="grid grid-cols-6 gap-2">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                onClick={() => applyTheme({ primaryColor: color.value })}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  themeConfig.primaryColor === color.value
                    ? 'border-gray-900 scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* 字体：下拉选择 */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
            字体
          </label>
          <Dropdown
            options={fontPresets}
            value={
              fontPresets.some((f) => f.value === themeConfig.fontFamily)
                ? themeConfig.fontFamily
                : ''
            }
            onChange={(v) => applyTheme({ fontFamily: v })}
            placeholder="当前字体（自定义）"
            ariaLabel="选择字体"
          />
        </div>

        {/* 字号 / 间距 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
              字号
            </label>
            <Dropdown
              options={sizeOptions}
              value={themeConfig.fontSize}
              onChange={(v) => applyTheme({ fontSize: v })}
              ariaLabel="选择字号"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
              间距
            </label>
            <Dropdown
              options={spacingOptions}
              value={themeConfig.spacing}
              onChange={(v) => applyTheme({ spacing: v })}
              ariaLabel="选择间距"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
