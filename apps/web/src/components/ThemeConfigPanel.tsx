import { useEffect, useRef, useState } from 'react';
import { usePreview } from '@/store/PreviewContext';
import { useResumeStore } from '@/store/ResumeContext';
import { useUI } from '@/store/UIContext';
import { Dropdown, type DropdownOption } from '@/components/Dropdown';
import { HoverTip } from '@/components/HoverTip';
import { TemplatePreview } from '@/components/TemplatePreview';
import { TEMPLATE_TEXT } from '@/components/TemplateModal';
import { DEFAULT_CONTENT_PADDING, DEFAULT_LINE_HEIGHT, normalizeElementFontSizes, normalizeLineHeight } from '@/preview/previewShared';
import { builtinTemplates } from '@/templates';
import { useTemplateSwitch } from '@/hooks/useTemplateSwitch';
import { useModalClose } from '@/hooks/useModalClose';
import { useTr, type Bi } from '@/i18n/LangContext';
import type { ElementFontSizes, ThemeConfig } from '@stylan/shared-types';
import { defaultElementFontSizes } from '@stylan/shared-types';

const colorPresets = [
  { label: { zh: '科技蓝', en: 'Tech Blue' }, value: '#2563EB' },
  { label: { zh: '翡翠绿', en: 'Emerald' }, value: '#10B981' },
  { label: { zh: '琥珀橙', en: 'Amber' }, value: '#F59E0B' },
  { label: { zh: '玫瑰红', en: 'Rose Red' }, value: '#E11D48' },
  { label: { zh: '紫罗兰', en: 'Violet' }, value: '#7C3AED' },
  { label: { zh: '石墨黑', en: 'Graphite Black' }, value: '#111827' },
  { label: { zh: '亮黄', en: 'Bright Yellow' }, value: '#FFD335' },
  { label: { zh: '珊瑚红', en: 'Coral' }, value: '#FF6B6B' },
  { label: { zh: '玫粉', en: 'Rose Pink' }, value: '#FF6EA9' },
  { label: { zh: '青蓝', en: 'Cyan Blue' }, value: '#00A8E8' },
  { label: { zh: '湖水绿', en: 'Teal' }, value: '#00C2A8' },
];

/** 简历常用字体选项，前三个与内置模板默认值一致，保证旧数据可回显 */
const fontPresets = [
  { label: { zh: 'Inter · 现代无衬线', en: 'Inter · Modern sans-serif' }, value: "'Inter', 'Noto Sans SC', sans-serif" },
  { label: { zh: '思源黑体 · 简洁清晰', en: 'Noto Sans SC · Clean & clear' }, value: "'Noto Sans SC', 'Microsoft YaHei', sans-serif" },
  { label: { zh: '苹方 · 苹果系统字体', en: 'PingFang SC · Apple system font' }, value: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif" },
  { label: { zh: '阿里惠普体 · 商务无衬线', en: 'Alibaba PuHuiTi · Business sans-serif' }, value: "'Alibaba PuHuiTi', 'Noto Sans SC', sans-serif" },
  { label: { zh: 'Times New Roman · 经典衬线', en: 'Times New Roman · Classic serif' }, value: "'Times New Roman', 'Noto Serif SC', serif" },
  { label: { zh: '思源宋体 · 优雅正式', en: 'Noto Serif SC · Elegant & formal' }, value: "'Noto Serif SC', 'SimSun', serif" },
];

/** 「默认」徽章标签：下拉选项与选中值中标识该分类的默认字号 */
function DefaultBadge() {
  const tr = useTr();
  return (
    <span className="inline-flex items-center px-1.5 py-px rounded text-[10px] leading-[1.5] font-medium bg-primary-50 text-primary-600 border border-primary-100 whitespace-nowrap">
      {tr({ zh: '默认', en: 'Default' })}
    </span>
  );
}

/** 重置按钮：循环箭头 + 文案，白底圆角边框，hover 主色，与面板控件风格一致 */
function ResetButton({ label, onClick }: { label: Bi; onClick: () => void }) {
  const tr = useTr();
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1.5 text-[13px] border rounded-full px-2.5 py-1.5 bg-gray-50 text-gray-400 border-gray-100 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-colors"
      aria-label={tr({ zh: `重置为默认${label.zh}`, en: `Reset ${label.en} to default` })}
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
      {tr({ zh: `重置${label.zh}`, en: `Reset ${label.en}` })}
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
const fontSizeCategories: Array<[keyof ElementFontSizes, Bi]> = [
  ['h1', { zh: 'H1', en: 'H1' }],
  ['h2', { zh: 'H2', en: 'H2' }],
  ['h3', { zh: 'H3', en: 'H3' }],
  ['h4', { zh: 'H4', en: 'H4' }],
  ['h5', { zh: 'H5', en: 'H5' }],
  ['p', { zh: '段落', en: 'Paragraph' }],
  ['list', { zh: '列表', en: 'List' }],
];

/** 行距下拉：12 ~ 25 → 1.2 ~ 2.5 倍，默认值 1.4 选项以「默认」徽章标识 */
const lineHeightOptions: { value: string; label: Bi }[] = Array.from({ length: 14 }, (_, i) => {
  const lh = ((12 + i) / 10).toFixed(1);
  return {
    value: lh,
    label: { zh: `${lh} 倍`, en: `${lh}x` },
  };
});

/** 页边距档位，mm 值与 previewShared.MARGIN_MM 一致，仅用于展示 */
const marginOptions = [
  { value: 'none', label: { zh: '无 · 0mm', en: 'None · 0mm' } },
  { value: 'narrow', label: { zh: '窄 · 8mm', en: 'Narrow · 8mm' } },
  { value: 'normal', label: { zh: '标准 · 12mm', en: 'Normal · 12mm' } },
  { value: 'wide', label: { zh: '宽 · 20mm', en: 'Wide · 20mm' } },
] as const;

/** 内容边距档位，mm 值与 previewShared.CONTENT_PADDING_MM 一致，仅用于展示 */
const contentPaddingOptions = [
  { value: 'none', label: { zh: '无 · 0mm', en: 'None · 0mm' } },
  { value: 'narrow', label: { zh: '窄 · 5mm', en: 'Narrow · 5mm' } },
  { value: 'normal', label: { zh: '标准 · 10mm', en: 'Normal · 10mm' } },
  { value: 'wide', label: { zh: '宽 · 15mm', en: 'Wide · 15mm' } },
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

/** HEX 颜色 → HSV（调色盘二维选色区坐标），非法输入回退黑色 */
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { h: 0, s: 0, v: 0 };
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

/** HSV → HEX 颜色 */
function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rgb: [number, number, number];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const to = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${to(rgb[0])}${to(rgb[1])}${to(rgb[2])}`;
}

/** 预览窗口内的主题设置侧边栏，随 themePanelOpen 滑入/移除 */
export function ThemeConfigPanel() {
  const { currentTemplate, themeConfig, setThemeConfig } = usePreview();
  const { updateTheme } = useResumeStore();
  const { themePanelOpen, toggleThemePanel, addedTemplates } = useUI();
  const tr = useTr();
  const switchTemplate = useTemplateSwitch();
  // 统一关闭流程：滑出动画结束后再卸载（侧边栏对称滑出）
  const { closing, close } = useModalClose(themePanelOpen, toggleThemePanel);

  // 当前模板卡片引用：打开面板/切换模板时自动滚动到可视区（jsdom 无 scrollIntoView，需可选调用）
  const currentCardRef = useRef<HTMLButtonElement | null>(null);
  const currentId = currentTemplate?.id || 'classic';
  useEffect(() => {
    currentCardRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [currentId, themePanelOpen]);

  // —— 自定义调色盘（圆角矩形弹层）：二维选色区 + 色相滑杆 + HEX 输入（Hooks 需在早退前调用） ——
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 });
  const [hexText, setHexText] = useState('');

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

  // 当前主色不在预设色板中 → 视为自定义色，「自定义」圆点高亮
  const isCustomColor = !colorPresets.some((c) => c.value === themeConfig.primaryColor);

  const openPicker = () => {
    setHsv(hexToHsv(themeConfig.primaryColor));
    setHexText(themeConfig.primaryColor.toUpperCase());
    setPickerOpen(true);
  };

  /** HSV → 应用到主题（实时预览） */
  const applyHsv = (next: { h: number; s: number; v: number }) => {
    setHsv(next);
    applyTheme({ primaryColor: hsvToHex(next.h, next.s, next.v) });
  };

  /** 二维选色区取色（按下/拖动），x → 饱和度，y → 明度 */
  const pickFromPad = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const v = 1 - Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    applyHsv({ ...hsv, s, v });
  };

  /** HEX 输入：合法 6 位值实时应用，失焦时回显当前生效色 */
  const onHexChange = (raw: string) => {
    const t = raw.startsWith('#') ? raw : `#${raw}`;
    setHexText(t.toUpperCase());
    if (/^#[0-9a-fA-F]{6}$/.test(t)) {
      setHsv(hexToHsv(t));
      applyTheme({ primaryColor: t.toLowerCase() });
    }
  };

  return (
    <aside
      className={`${closing ? 'theme-side-out' : 'theme-side-in'} absolute right-2 top-2 bottom-2 z-10 w-96 rounded-xl border border-gray-200 shadow-sm bg-white flex flex-col overflow-y-auto`}
      aria-label={tr({ zh: '主题配置', en: 'Theme settings' })}
    >
      <style>{`
        @keyframes themeSideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .theme-side-in { animation: themeSideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes themeSideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(16px); }
        }
        .theme-side-out { animation: themeSideOut 0.18s ease-in both; }
        @media (prefers-reduced-motion: reduce) {
          .theme-side-in, .theme-side-out { animation: none; }
        }
        /* 自定义调色盘弹层入场动画 */
        @keyframes colorPickerIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .color-picker-pop { animation: colorPickerIn 0.16s ease-out; }
        /* 色相滑杆：胶囊彩虹轨道 + 白色圆点滑块 */
        .hue-slider {
          -webkit-appearance: none;
          appearance: none;
          display: block;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
          outline: none;
          cursor: pointer;
        }
        .hue-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.25);
        }
        .hue-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border: none;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.25);
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
        <h3 className="text-sm font-semibold text-gray-900">{tr({ zh: '主题配置', en: 'Theme settings' })}</h3>
        <HoverTip text={tr({ zh: '关闭', en: 'Close' })}>
          <button
            onClick={close}
            className="ml-auto w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
          >
            ✕
          </button>
        </HoverTip>
      </div>

      <div className="p-4 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0">
        {/* 分组：模板（预览卡片，一屏最多 4 张，超出纵向滚动并吸附到卡片） */}
        <section>
          <GroupTitle>{tr({ zh: '模板', en: 'Templates' })}</GroupTitle>
          {/* 卡片高 175px（预览 144 + 分隔线 1 + 名称 28 + 上下边框 2），两行 + gap = 358px；切换后视觉主题重置为该模板默认，页面布局设置保留 */}
          <div
            className="grid grid-cols-2 gap-2 max-h-[358px] overflow-y-auto snap-y snap-mandatory [scrollbar-width:thin]"
            aria-label={tr({ zh: '选择模板', en: 'Choose a template' })}
          >
            {availableTemplates.map((t) => {
              const isCurrent = t.id === currentId;
              const tName = TEMPLATE_TEXT[t.id]?.name ?? { zh: t.name, en: t.name };
              return (
                <button
                  key={t.id}
                  ref={isCurrent ? currentCardRef : undefined}
                  onClick={() => switchTemplate(t.id)}
                  aria-pressed={isCurrent}
                  aria-label={tr({ zh: `切换到模板 ${tName.zh}`, en: `Switch to template ${tName.en}` })}
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
                      {tr(tName)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 分组：视觉风格 */}
        <section className="flex flex-col gap-4">
          <GroupTitle>{tr({ zh: '视觉风格', en: 'Visual style' })}</GroupTitle>
          {/* 主色调 */}
          <div className="relative">
            <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
              {tr({ zh: '主色调', en: 'Primary color' })}
            </label>
            <div className="grid grid-cols-6 gap-2">
              {colorPresets.map((color) => (
                <HoverTip key={color.value} text={tr(color.label)}>
                  <button
                    onClick={() => applyTheme({ primaryColor: color.value })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      themeConfig.primaryColor === color.value
                        ? 'border-gray-900 scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    aria-label={tr(color.label)}
                  />
                </HoverTip>
              ))}
              {/* 自定义颜色：点击展开圆角矩形调色盘弹层（二维选色区 + 色相滑杆 + HEX 输入），
                  当前主色不在预设中时视为自定义色并高亮 */}
              <HoverTip text={tr({ zh: '自定义', en: 'Custom' })}>
                <button
                  type="button"
                  onClick={openPicker}
                  aria-label={tr({ zh: '自定义颜色', en: 'Custom color' })}
                  aria-expanded={pickerOpen}
                  className={`relative block w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer bg-gray-100 ${
                    isCustomColor ? 'border-gray-900 scale-110' : 'border-transparent'
                  }`}
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-500"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </span>
                </button>
              </HoverTip>
            </div>

            {/* 自定义调色盘弹层：圆角矩形窗口（overflow-hidden 让通栏选色区跟随窗口圆角裁切） */}
            {pickerOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setPickerOpen(false)}
                  aria-hidden="true"
                />
                <div className="color-picker-pop absolute -left-4 -right-4 top-full mt-2 z-30 rounded-xl border border-gray-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.14)] overflow-hidden">
                  {/* 二维选色区：横向饱和度，纵向明度（上亮下暗），底色随色相变化，通栏铺满窗口顶部 */}
                  <div
                    className="relative h-40 cursor-crosshair touch-none select-none"
                    style={{
                      background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))`,
                    }}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      pickFromPad(e);
                    }}
                    onPointerMove={(e) => {
                      if (e.buttons & 1) pickFromPad(e);
                    }}
                  >
                    <span
                      className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow ring-1 ring-black/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
                    />
                  </div>
                  {/* 控制区：色相滑杆（胶囊轨道）+ 当前色预览 + HEX 输入，与窗口边缘留出内边距 */}
                  <div className="px-3 pt-3 pb-3 flex flex-col gap-2.5">
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={hsv.h}
                      onChange={(e) => applyHsv({ ...hsv, h: Number(e.target.value) })}
                      className="hue-slider w-full"
                      aria-label={tr({ zh: '色相', en: 'Hue' })}
                    />
                    <div className="flex items-center gap-2">
                      <span
                        className="w-8 h-8 rounded-lg border border-gray-200 shrink-0"
                        style={{ backgroundColor: themeConfig.primaryColor }}
                        aria-hidden="true"
                      />
                      <input
                        value={hexText}
                        onChange={(e) => onHexChange(e.target.value)}
                        onBlur={() => setHexText(themeConfig.primaryColor.toUpperCase())}
                        maxLength={7}
                        spellCheck={false}
                        className="flex-1 h-8 rounded-md border border-gray-200 px-2 font-mono text-[13px] uppercase text-gray-700 focus:outline-none focus:border-primary-400"
                        aria-label={tr({ zh: '十六进制颜色值', en: 'Hex color value' })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* 字体：下拉选择 */}
          <div>
            <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
              {tr({ zh: '字体', en: 'Font' })}
            </label>
            <Dropdown
              options={fontPresets.map((f) => ({ value: f.value, label: tr(f.label) }))}
              value={
                fontPresets.some((f) => f.value === themeConfig.fontFamily)
                  ? themeConfig.fontFamily
                  : ''
              }
              onChange={(v) => applyTheme({ fontFamily: v })}
              placeholder={tr({ zh: '当前字体（自定义）', en: 'Current font (custom)' })}
              ariaLabel={tr({ zh: '选择字体', en: 'Select font' })}
            />
          </div>
        </section>

        {/* 分组：字号与行距（H1~H5、段落、列表分别设置，默认值选项带「默认」标识，行距垫底凑满 8 格） */}
        <section className="flex flex-col gap-4">
          <GroupTitle>{tr({ zh: '字号与行距', en: 'Font size & line height' })}</GroupTitle>
          <div className="grid grid-cols-2 gap-3">
            {fontSizeCategories.map(([key, label]) => (
              <div key={key}>
                <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
                  {tr(label)}
                </label>
                <Dropdown
                  options={elementSizeOptionsMap[key]}
                  value={String(elementFontSizes[key])}
                  onChange={(v) =>
                    applyTheme({
                      elementFontSizes: { ...themeConfig.elementFontSizes, [key]: Number(v) },
                    })
                  }
                  ariaLabel={tr({ zh: `选择${label.zh}字号`, en: `Select ${label.en} font size` })}
                />
              </div>
            ))}
            <div>
              <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
                {tr({ zh: '行距', en: 'Line height' })}
              </label>
              <Dropdown
                options={lineHeightOptions.map((o) => ({ value: o.value, label: tr(o.label) }))}
                value={normalizeLineHeight(
                  themeConfig.lineHeight ?? (themeConfig as { spacing?: unknown }).spacing,
                ).toFixed(1)}
                onChange={(v) => applyTheme({ lineHeight: Number(v) })}
                ariaLabel={tr({ zh: '选择行距', en: 'Select line height' })}
              />
            </div>
            {/* 重置按钮（常驻）：分别位于「列表」「行距」下拉正下方一格，一键恢复默认 */}
            <ResetButton label={{ zh: '字号', en: 'Font size' }} onClick={() => applyTheme({ elementFontSizes: {} })} />
            <ResetButton label={{ zh: '行距', en: 'Line height' }} onClick={() => applyTheme({ lineHeight: DEFAULT_LINE_HEIGHT })} />
          </div>
        </section>

        {/* 分组：页面布局（预览与 PDF 导出共用，随主题持久化） */}
        <section className="flex flex-col gap-4">
          <GroupTitle>{tr({ zh: '页面布局', en: 'Page layout' })}</GroupTitle>
          {/* 页边距：左右 / 上下独立选择 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
                {tr({ zh: '左右边距', en: 'Horizontal margins' })}
              </label>
              <Dropdown
                options={marginOptions.map((o) => ({ value: o.value, label: tr(o.label) }))}
                value={themeConfig.marginX}
                onChange={(v) => applyTheme({ marginX: v })}
                ariaLabel={tr({ zh: '选择左右页边距', en: 'Select horizontal margins' })}
              />
            </div>
            <div>
              <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
                {tr({ zh: '上下边距', en: 'Vertical margins' })}
              </label>
              <Dropdown
                options={marginOptions.map((o) => ({ value: o.value, label: tr(o.label) }))}
                value={themeConfig.marginY}
                onChange={(v) => applyTheme({ marginY: v })}
                ariaLabel={tr({ zh: '选择上下页边距', en: 'Select vertical margins' })}
              />
            </div>
          </div>
          {/* 内容边距：内容到页面边界的距离（四边），叠加在页边距上 */}
          <div>
            <label className="font-mono text-[13px] uppercase tracking-[0.18em] text-gray-400 mb-2 block">
              {tr({ zh: '内容边距', en: 'Content padding' })}
            </label>
            <Dropdown
              options={contentPaddingOptions.map((o) => ({ value: o.value, label: tr(o.label) }))}
              value={themeConfig.contentPadding ?? DEFAULT_CONTENT_PADDING}
              onChange={(v) => applyTheme({ contentPadding: v })}
              ariaLabel={tr({ zh: '选择内容边距', en: 'Select content padding' })}
            />
          </div>
        </section>
      </div>
    </aside>
  );
}
