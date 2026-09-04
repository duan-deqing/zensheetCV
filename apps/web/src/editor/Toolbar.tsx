import { Fragment, useEffect, useRef, useState } from 'react';
import { TipBubble, type TipAnchor } from '@/components/HoverTip';
import { useEditor } from '@/store/EditorContext';
import { editorViewRef, insertMarkdown } from './insertMarkdown';

/** 内联线性图标，颜色跟随 currentColor */
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}


/** 两栏布局图标：矩形内一条竖分线 */
function TwoColsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M12 4v16" />
    </svg>
  );
}

/** 三栏布局图标：矩形内两条竖分线 */
function ThreeColsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16M15 4v16" />
    </svg>
  );
}

/** 无序列表图标：圆点 + 三条横线，颜色跟随 currentColor */
function UlIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3.5 6h.01" />
      <path d="M3.5 12h.01" />
      <path d="M3.5 18h.01" />
    </svg>
  );
}

/** 有序列表图标：序号 1/2/3 + 三条横线，颜色跟随 currentColor */
function OlIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M10 6h11" />
      <path d="M10 12h11" />
      <path d="M10 18h11" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}

/** 展开指示箭头 */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** 功能按钮分组：同组内紧凑排列，组间以细分隔线区隔（编辑器工具栏与选中文字悬浮工具栏共用） */
export const BUTTON_GROUPS: {
  buttons: { label: string; title: string; before?: string; after?: string; atLineStart?: boolean; fontWeight?: 'bold'; fontStyle?: 'italic' }[];
}[] = [
  {
    // 字体样式
    buttons: [
      { label: 'B', title: '粗体 (Ctrl+B)', before: '**', after: '**', fontWeight: 'bold' },
      { label: 'I', title: '斜体 (Ctrl+I)', before: '*', after: '*', fontStyle: 'italic' },
    ],
  },
  {
    // 标题
    buttons: [
      { label: 'H1', title: '标题1', before: '# ', atLineStart: true },
      { label: 'H2', title: '标题2', before: '## ', atLineStart: true },
      { label: 'H3', title: '标题3', before: '### ', atLineStart: true },
    ],
  },
  {
    // 列表
    buttons: [
      { label: 'ul', title: '无序列表', before: '- ', atLineStart: true },
      { label: 'ol', title: '有序列表', before: '1. ', atLineStart: true },
    ],
  },
  {
    // 插入
    buttons: [{ label: 'link', title: '链接', before: '[', after: '](url)' }],
  },
  {
    // 布局（::: 容器语法，连续书写的容器并排渲染为多栏）
    buttons: [
      {
        label: 'cols2',
        title: '两栏布局 — 插入 :::left + :::right',
        before: ':::left\n左栏内容\n:::\n\n:::right\n右栏内容\n:::\n\n',
      },
      {
        label: 'cols3',
        title: '三栏布局 — 插入 :::left + :::mid + :::right',
        before:
          ':::left\n左栏内容\n:::\n\n:::mid\n中栏内容\n:::\n\n:::right\n右栏内容\n:::\n\n',
      },
    ],
  },
];

/** 按钮内容渲染：link/列表/布局用图标，其余显示文字标签（两个工具栏共用） */
export function ToolbarButtonIcon({ label }: { label: string }) {
  if (label === 'link') return <LinkIcon />;
  if (label === 'cols2') return <TwoColsIcon />;
  if (label === 'cols3') return <ThreeColsIcon />;
  if (label === 'ul') return <UlIcon />;
  if (label === 'ol') return <OlIcon />;
  return <>{label}</>;
}

const BUTTON_CLASSES =
  'px-1.5 h-6 font-mono text-[12px] font-medium text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors flex items-center shrink-0';

/** 编辑器顶栏：< MARKDOWN /> 标识 + 字数统计 */
export function ToolbarHeader() {
  const { markdown: doc } = useEditor();

  const lineCount = doc ? doc.split('\n').length : 1;
  const charCount = doc ? doc.length : 0;

  // h-11 与预览顶栏（py-2 + h-7 按钮 = 44px）等高，样式对齐 PreviewToolbar
  return (
    <div className="flex h-11 items-center gap-2 px-3 bg-white border-b border-gray-200 shrink-0">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0"
        aria-hidden="true"
      >
        {'< MARKDOWN />'}
      </p>
      <p className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 tabular-nums shrink-0 hidden md:block">
        {lineCount} LINES · {charCount} CHARS
      </p>
    </div>
  );
}

/** 编辑器窗口内的功能按钮行：宽度不足时折叠为「更多」，展开后以多行显示全部按钮 */
export function ToolbarActions() {
  const rootRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  /** 自定义悬停提示：固定定位气泡，避免被按钮行的 overflow-hidden 裁剪 */
  const [tip, setTip] = useState<{ text: string; anchor: TipAnchor } | null>(null);

  const insertText = (before: string, after = '', atLineStart = false) =>
    insertMarkdown(editorViewRef.current, before, after, atLineStart);

  // 宽度探测：按钮组内容宽超过可用宽时折叠为「更多」按钮；
  // 折叠后按钮组改为绝对定位的隐形测量层，保持占满整行以持续探测可用宽度；
  // 无 ResizeObserver 的环境（如 jsdom 测试）回退到 window resize 监听
  useEffect(() => {
    const check = () => {
      const group = groupRef.current;
      if (!group) return;
      setOverflowing(group.scrollWidth > group.clientWidth + 1);
    };
    check();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
    }
    const ro = new ResizeObserver(check);
    if (rootRef.current) ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, []);

  // 宽度恢复后收起展开面板
  useEffect(() => {
    if (!overflowing) setMoreOpen(false);
  }, [overflowing]);

  // 面板展开时点击外部 / Escape 关闭
  useEffect(() => {
    if (!moreOpen) return;
    const handleDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [moreOpen]);

  const renderGroup = (group: (typeof BUTTON_GROUPS)[number], key: number) => (
    <div key={key} className="flex items-center gap-0.5 shrink-0">
      {group.buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={() => insertText(btn.before ?? '', btn.after ?? '', btn.atLineStart)}
          aria-label={btn.title}
          onMouseEnter={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setTip({ text: btn.title, anchor: { left: r.left, right: r.right, centerY: r.top + r.height / 2 } });
          }}
          onMouseLeave={() => setTip(null)}
          onBlur={() => setTip(null)}
          className={BUTTON_CLASSES}
          style={{ fontWeight: btn.fontWeight, fontStyle: btn.fontStyle }}
        >
          <ToolbarButtonIcon label={btn.label} />
        </button>
      ))}
    </div>
  );

  // 组间插入细分隔线，视觉上区分「字体 / 标题 / 列表 / 插入 / 布局」各组
  const allButtons = BUTTON_GROUPS.map((group, i) => (
    <Fragment key={i}>
      {i > 0 && <span className="w-px h-4 bg-gray-200 shrink-0" aria-hidden="true" />}
      {renderGroup(group, i)}
    </Fragment>
  ));

  return (
    <div ref={rootRef} className="min-w-0">
      {/* 功能按钮行 */}
      <div className="relative flex items-center px-3 py-1 min-w-0">
        <div
          ref={groupRef}
          className={`flex items-center gap-1 min-w-0 overflow-hidden ${
            overflowing ? 'absolute inset-x-3 invisible pointer-events-none' : ''
          }`}
        >
          {allButtons}
        </div>
        {overflowing && (
          <button
            type="button"
            onClick={() => setMoreOpen((p) => !p)}
            aria-expanded={moreOpen}
            className={`h-6 px-1.5 inline-flex items-center gap-1 text-[12px] font-medium rounded-md transition-colors ${
              moreOpen
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            更多
            <ChevronIcon open={moreOpen} />
          </button>
        )}
      </div>

      {overflowing && moreOpen && (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1 px-3 pb-2 pt-1 border-t border-gray-100">
          {allButtons}
        </div>
      )}

      {/* 悬停提示气泡：与全站统一（HoverTip.TipBubble），按钮右侧垂直居中 */}
      {tip && <TipBubble text={tip.text} anchor={tip.anchor} />}
    </div>
  );
}
