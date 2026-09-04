import { useEffect, useRef } from 'react';
import { usePreview } from '@/store/PreviewContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useUI } from '@/store/UIContext';
import { Dropdown, type DropdownOption } from '@/components/Dropdown';
import { HoverTip } from '@/components/HoverTip';
import { TemplatePreview } from '@/components/TemplatePreview';
import { DEFAULT_CONTENT_PADDING, DEFAULT_LINE_HEIGHT, normalizeElementFontSizes, normalizeLineHeight } from '@/preview/previewShared';
import { builtinTemplates } from '@/templates';
import { useTemplateSwitch } from '@/hooks/useTemplateSwitch';
import type { ElementFontSizes, ThemeConfig } from '@stylan/shared-types';
import { defaultElementFontSizes } from '@stylan/shared-types';

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
  { label: '苹方 · 苹果系统字体', value: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif" },
  { label: '阿里惠普体 · 商务无衬线', value: "'Alibaba PuHuiTi', 'Noto Sans SC', sans-serif" },
  { label: 'Times New Roman · 经典衬线', value: "'Times New Roman', 'Noto Serif SC', serif" },
  { label: '思源宋体 · 优雅正式', value: "'Noto Serif SC', 'SimSun', serif" },
];

/** 「默认」徽章标签：下拉选项与选中值中标识该分类的默认字号 */
function DefaultBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-px rounded text-[10px] leading-[1.5] font-medium bg-primary-50 text-primary-600 border border-primary-100 whitespace-nowrap">
      默认
    </span>
  );
}

/** 重置按钮：循环箭头 + 文案，白底圆角边框，hover 主色，与面板控件风格一致 */
function ResetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1.5 text-[13px] border rounded-full px-2.5 py-1.5 bg-gray-50 text-gray-400 border-gray-100 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-colors"
      aria-label={`重置为默认${label}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 shrink-0"
        aria-hidden="true"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
      重置{label}
    </button>
  );
}

/** 分类字号下拉选项：10 px 起，上限至少 30（默认值 +10 之上再留调节空间），
 *  该分类的默认值选项以「默认」徽章标签标识 */
const elementSizeOptions = (def: number): DropdownOption<string>[] => {
  const maxPx = Math.max(30, def + 10);
  return Array.from({ length: maxPx - 10 + 1 }, (_, i) => {
    const px = 10 + i;
    return {
      value: String(px),
      label:
        px === def ? (
          <span className="inline-flex items-center gap-1.5">
            {px} px
            <DefaultBadge />
          </span>
        ) : (
          `${px} px`
        ),
    };
  });
};

/** 各分类字号选项：默认值 H1 30 / H2 20 / 其余 14（与 defaultElementFontSizes 一致） */
const elementSizeOptionsMap = {
  h1: elementSizeOptions(defaultElementFontSizes.h1),
  h2: elementSizeOptions(defaultElementFontSizes.h2),
  h3: elementSizeOptions(defaultElementFontSizes.h3),
  h4: elementSizeOptions(defaultElementFontSizes.h4),
  h5: elementSizeOptions(defaultElementFontSizes.h5),
  p: elementSizeOptions(defaultElementFontSizes.p),
  list: elementSizeOptions(defaultElementFontSizes.list),
} as const;

/** 字号分类配置：渲染顺序与标签（2 列网格，行距垫底凑满 8 格） */
const fontSizeCategories: Array<[keyof ElementFontSizes, string]> = [
  ['h1', 'H1'],
  ['h2', 'H2'],
  ['h3', 'H3'],
  ['h4', 'H4'],
  ['h5', 'H5'],
  ['p', '段落'],
  ['list', '列表'],
];

/** 行距下拉：12 ~ 25 → 1.2 ~ 2.5 倍，默认值 1.4 选项以「默认」徽章标识 */
const lineHeightOptions: DropdownOption<string>[] = Array.from({ length: 14 }, (_, i) => {
  const lh = ((12 + i) / 10).toFixed(1);
  return {
    value: lh,
    label:
      lh === DEFAULT_LINE_HEIGHT.toFixed(1) ? (
        <span className="inline-flex items-center gap-1.5">
          {lh} 倍
          <DefaultBadge />
        </span>
      ) : (
        `${lh} 倍`
      ),
  };
});

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

/** 分组标题：mono 眉标风格（`// 分组名`），与面板头部同构 */
function GroupTitle({ children }: { children: string }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary-600 pb-1.5 mb-3 border-b border-gray-100">
      {'// '}
      {children}
    </p>
  );
}

/** 预览窗口内的主题设置侧边栏，随 themePanelOpen 滑入/移除 */
export function ThemeConfigPanel() {
  const { currentTemplate, themeConfig, setThemeConfig } = usePreview();
  const { updateTheme } = useResumeStore();
  const { themePanelOpen, toggleThemePanel, addedTemplates } = useUI();
  const switchTemplate = useTemplateSwitch();

  // 当前模板卡片引用：打开面板/切换模板时自动滚动到可视区（jsdom 无 scrollIntoView，需可选调用）
  const currentCardRef = useRef<HTMLButtonElement | null>(null);
  const currentId = currentTemplate?.id || 'classic';
  useEffect(() => {
    currentCardRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [currentId, themePanelOpen]);

  if (!themePanelOpen) return null;

  // 分类字号（H1~H5 / 段落 / 列表）：未设置的字段回退默认值，下拉直接回显
  const elementFontSizes = normalizeElementFontSizes(themeConfig.elementFontSizes);

  const applyTheme = (partial: Partial<ThemeConfig>) => {
    setThemeConfig({ ...themeConfig, ...partial });
    // 同步写入简历数据，随自动保存落库
    updateTheme(partial);
  };

  // 可选模板 = 当前模板 + 模板库中已添加的模板
  const availableTemplates = builtinTemplates.filter(
    (t) => t.id === currentId || addedTemplates.includes(t.id),
  );

  return (
    <aside
      className="theme-side-in absolute right-2 top-2 bottom-2 z-10 w-96 rounded-xl border border-gray-200 shadow-sm bg-white flex flex-col overflow-y-auto"
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

      {/* 顶栏：与预览顶栏同构（mono 眉标 + py-2 + h-7 按钮 = 44px 等高） */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 shrink-0">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0"
          aria-hidden="true"
        >
          {'< THEME />'}
        </p>
        <h3 className="text-sm font-semibold text-gray-900">主题配置</h3>
        <HoverTip text="关闭">
          <button
            onClick={toggleThemePanel}
            className="ml-auto w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
          >
            ✕
          </button>
        </HoverTip>
      </div>

      <div className="p-4 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0">
        {/* 分组：模板（预览卡片，一屏最多 4 张，超出纵向滚动并吸附到卡片） */}
        <section>
          <GroupTitle>模板</GroupTitle>
          {/* 卡片高 175px（预览 144 + 分隔线 1 + 名称 28 + 上下边框 2），两行 + gap = 358px；切换后视觉主题重置为该模板默认，页面布局设置保留 */}
          <div
            className="grid grid-cols-2 gap-2 max-h-[358px] overflow-y-auto snap-y snap-mandatory [scrollbar-width:thin]"
            aria-label="选择模板"
          >
            {availableTemplates.map((t) => {
              const isCurrent = t.id === currentId;
              return (
                <button
                  key={t.id}
                  ref={isCurrent ? currentCardRef : undefined}
                  onClick={() => switchTemplate(t.id)}
                  aria-pressed={isCurrent}
                  aria-label={`切换到模板 ${t.name}`}
                  className={`snap-start rounded-lg border overflow-hidden bg-white text-left transition-colors ${
                    isCurrent
                      ? 'border-primary-400 ring-1 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {/* text-left 抵消 button UA 的 text-align:center，保证预览排版与模板库一致 */}
                  {/* fill 模式：预览等比放大占满卡片宽度，纵向超出部分隐藏，卡片利用率更高 */}
                  <TemplatePreview templateId={t.id} height={144} mode="fill" className="border-b border-gray-100" />
                  <span className="h-7 flex items-center justify-center px-1">
                    <span
                      className={`text-[11px] font-medium truncate ${
                        isCurrent ? 'text-primary-600' : 'text-gray-600'
                      }`}
                    >
                      {t.name}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 分组：视觉风格 */}
        <section className="flex flex-col gap-4">
          <GroupTitle>视觉风格</GroupTitle>
          {/* 主色调 */}
          <div>
            <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
              主色调
            </label>
            <div className="grid grid-cols-6 gap-2">
              {colorPresets.map((color) => (
                <HoverTip key={color.value} text={color.label}>
                  <button
                    onClick={() => applyTheme({ primaryColor: color.value })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      themeConfig.primaryColor === color.value
                        ? 'border-gray-900 scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    aria-label={color.label}
                  />
                </HoverTip>
              ))}
            </div>
          </div>
          {/* 字体：下拉选择 */}
          <div>
            <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
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
        </section>

        {/* 分组：字号与行距（H1~H5、段落、列表分别设置，默认值选项带「默认」标识，行距垫底凑满 8 格） */}
        <section className="flex flex-col gap-4">
          <GroupTitle>字号与行距</GroupTitle>
          <div className="grid grid-cols-2 gap-3">
            {fontSizeCategories.map(([key, label]) => (
              <div key={key}>
                <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
                  {label}
                </label>
                <Dropdown
                  options={elementSizeOptionsMap[key]}
                  value={String(elementFontSizes[key])}
                  onChange={(v) =>
                    applyTheme({
                      elementFontSizes: { ...themeConfig.elementFontSizes, [key]: Number(v) },
                    })
                  }
                  ariaLabel={`选择${label}字号`}
                />
              </div>
            ))}
            <div>
              <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
                行距
              </label>
              <Dropdown
                options={lineHeightOptions}
                value={normalizeLineHeight(
                  themeConfig.lineHeight ?? (themeConfig as { spacing?: unknown }).spacing,
                ).toFixed(1)}
                onChange={(v) => applyTheme({ lineHeight: Number(v) })}
                ariaLabel="选择行距"
              />
            </div>
            {/* 重置按钮（常驻）：分别位于「列表」「行距」下拉正下方一格，一键恢复默认 */}
            <ResetButton label="字号" onClick={() => applyTheme({ elementFontSizes: {} })} />
            <ResetButton label="行距" onClick={() => applyTheme({ lineHeight: DEFAULT_LINE_HEIGHT })} />
          </div>
        </section>

        {/* 分组：页面布局（预览与 PDF 导出共用，随主题持久化） */}
        <section className="flex flex-col gap-4">
          <GroupTitle>页面布局</GroupTitle>
          {/* 页边距：左右 / 上下独立选择 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
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
              <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
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
          {/* 内容边距：内容到页面边界的距离（四边），叠加在页边距上 */}
          <div>
            <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
              内容边距
            </label>
            <Dropdown
              options={contentPaddingOptions}
              value={themeConfig.contentPadding ?? DEFAULT_CONTENT_PADDING}
              onChange={(v) => applyTheme({ contentPadding: v })}
              ariaLabel="选择内容边距"
            />
          </div>
        </section>
      </div>
    </aside>
  );
}
