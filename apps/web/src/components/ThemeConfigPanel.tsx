import { usePreview } from '@/store/PreviewContext';
import { useUI } from '@/store/UIContext';
import type { ThemeConfig } from '@stylan/shared-types';

const colorPresets = [
  { label: '科技蓝', value: '#2563EB' },
  { label: '翡翠绿', value: '#10B981' },
  { label: '琥珀橙', value: '#F59E0B' },
  { label: '玫瑰红', value: '#E11D48' },
  { label: '紫罗兰', value: '#7C3AED' },
  { label: '石墨黑', value: '#111827' },
];

const fontPresets = [
  { label: '无衬线', value: "'Inter', 'Noto Sans SC', sans-serif" },
  { label: '衬线', value: "'Georgia', 'Noto Serif SC', serif" },
  { label: '等宽', value: "'JetBrains Mono', 'Fira Code', monospace" },
];

export function ThemeConfigPanel() {
  const { themeConfig, setThemeConfig } = usePreview();
  const { themePanelOpen } = useUI();

  if (!themePanelOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-40">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">主题配置</h3>

      {/* 主色调 */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-2 block">主色调</label>
        <div className="grid grid-cols-6 gap-2">
          {colorPresets.map((color) => (
            <button
              key={color.value}
              onClick={() => setThemeConfig({ ...themeConfig, primaryColor: color.value })}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                themeConfig.primaryColor === color.value ? 'border-gray-900 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* 字体 */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-2 block">字体</label>
        <div className="flex flex-col gap-1">
          {fontPresets.map((font) => (
            <button
              key={font.value}
              onClick={() => setThemeConfig({ ...themeConfig, fontFamily: font.value })}
              className={`text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                themeConfig.fontFamily === font.value
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      {/* 字号 */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-2 block">字号</label>
        <div className="flex gap-2">
          {(['sm', 'base', 'lg'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setThemeConfig({ ...themeConfig, fontSize: size })}
              className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
                themeConfig.fontSize === size
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {size === 'sm' ? '小' : size === 'base' ? '中' : '大'}
            </button>
          ))}
        </div>
      </div>

      {/* 间距 */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">间距</label>
        <div className="flex gap-2">
          {(['compact', 'normal', 'relaxed'] as const).map((spacing) => (
            <button
              key={spacing}
              onClick={() => setThemeConfig({ ...themeConfig, spacing })}
              className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
                themeConfig.spacing === spacing
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {spacing === 'compact' ? '紧凑' : spacing === 'normal' ? '标准' : '宽松'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
