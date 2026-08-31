import { useState } from 'react';
import { usePreview } from '@/store/PreviewContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useUI } from '@/store/UIContext';
import { Dropdown } from '@/components/Dropdown';
import { BUILTIN_ICONS, sanitizeCustomSvg } from '@/preview/resumeIcons';
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

/** 页边距档位，mm 值与 previewShared.MARGIN_MM 一致，仅用于展示 */
const marginOptions = [
  { value: 'none', label: '无 · 0mm' },
  { value: 'narrow', label: '窄 · 8mm' },
  { value: 'normal', label: '标准 · 12mm' },
  { value: 'wide', label: '宽 · 20mm' },
] as const;

/** 内容边距档位，mm 值与 previewShared.CONTENT_PADDING_MM 一致，仅用于展示 */
const contentPaddingOptions = [
  { value: 'none', label: '无 · 0mm' },
  { value: 'narrow', label: '窄 · 5mm' },
  { value: 'normal', label: '标准 · 10mm' },
  { value: 'wide', label: '宽 · 15mm' },
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
        {/* 页边距：左右 / 上下独立选择，预览与 PDF 导出共用，随主题持久化 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
              左右边距
            </label>
            <Dropdown
              options={marginOptions}
              value={themeConfig.marginX}
              onChange={(v) => applyTheme({ marginX: v })}
              ariaLabel="选择左右页边距"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
              上下边距
            </label>
            <Dropdown
              options={marginOptions}
              value={themeConfig.marginY}
              onChange={(v) => applyTheme({ marginY: v })}
              ariaLabel="选择上下页边距"
            />
          </div>
        </div>
        {/* 内容边距：内容到页面边界的距离（四边），叠加在页边距上，随主题持久化 */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
            内容边距
          </label>
          <Dropdown
            options={contentPaddingOptions}
            value={themeConfig.contentPadding ?? 'none'}
            onChange={(v) => applyTheme({ contentPadding: v })}
            ariaLabel="选择内容边距"
          />
        </div>

        <IconSection themeConfig={themeConfig} onApply={applyTheme} />
      </div>
    </aside>
  );
}

/** 自定义图标管理：内置图标速览（点击复制语法）+ 自定义图标增删。
 *  Markdown 中以 `icon:名称` 引用，随主题配置持久化 */
function IconSection({
  themeConfig,
  onApply,
}: {
  themeConfig: ThemeConfig;
  onApply: (partial: Partial<ThemeConfig>) => void;
}) {
  const customIcons = themeConfig.customIcons ?? {};
  const [name, setName] = useState('');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  const saveIcon = () => {
    const trimmedName = name.trim();
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(trimmedName)) {
      setError('名称需以字母开头，仅含字母 / 数字 / 连字符');
      return;
    }
    if (BUILTIN_ICONS[trimmedName]) {
      setError('该名称与内置图标冲突，请换一个名称');
      return;
    }
    const clean = sanitizeCustomSvg(svg);
    if (!clean) {
      setError('SVG 无效：需为合法的 <svg> 且包含图形元素');
      return;
    }
    onApply({ customIcons: { ...customIcons, [trimmedName]: clean } });
    setName('');
    setSvg('');
    setError('');
  };

  const removeIcon = (key: string) => {
    const next = { ...customIcons };
    delete next[key];
    onApply({ customIcons: next });
  };

  const copySyntax = async (key: string) => {
    try {
      await navigator.clipboard.writeText(`icon:${key}`);
    } catch {
      /* 剪贴板不可用时静默忽略 */
    }
  };

  return (
    <div>
      <style>{`
        .tp-icon { display: inline-flex; align-items: center; vertical-align: -0.125em; }
        .tp-icon svg { width: 1em; height: 1em; fill: currentColor; }
      `}</style>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
        图标 · Markdown 中写 icon:名称
      </label>

      {/* 内置图标速览：点击复制语法（参考开源 MujiCV 的快捷图标面板） */}
      <div className="grid grid-cols-6 gap-1.5 mb-3">
        {Object.keys(BUILTIN_ICONS).map((key) => (
          <button
            key={key}
            onClick={() => copySyntax(key)}
            className="h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors"
            title={`复制 icon:${key}`}
          >
            <span
              className="tp-icon text-base"
              dangerouslySetInnerHTML={{ __html: BUILTIN_ICONS[key] }}
            />
          </button>
        ))}
      </div>

      {/* 已有自定义图标 */}
      {Object.keys(customIcons).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {Object.entries(customIcons).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 pl-2 pr-1 h-7 border border-gray-200 rounded-md text-xs text-gray-600"
            >
              <span
                className="tp-icon"
                dangerouslySetInnerHTML={{ __html: value }}
              />
              {key}
              <button
                onClick={() => removeIcon(key)}
                className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                title="删除"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 新增自定义图标 */}
      <div className="flex gap-1.5 mb-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="图标名，如 qq"
          className="flex-1 min-w-0 h-8 px-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-primary-400"
        />
        <button
          onClick={saveIcon}
          className="h-8 px-3 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors shrink-0"
        >
          添加
        </button>
      </div>
      <textarea
        value={svg}
        onChange={(e) => setSvg(e.target.value)}
        placeholder="粘贴 SVG 代码，如 <svg viewBox='0 0 1024 1024'><path d='...'/></svg>"
        rows={3}
        className="w-full px-2 py-1.5 text-xs font-mono border border-gray-200 rounded-md resize-y focus:outline-none focus:border-primary-400"
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
