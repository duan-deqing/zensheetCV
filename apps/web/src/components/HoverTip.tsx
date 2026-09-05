import { cloneElement, isValidElement, useLayoutEffect, useRef, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';

/** 全站统一的悬停提示气泡：深色半透明底 + 白字，淡入动画。
    显示在触发元素右侧并与按钮垂直居中（间距 8px）；
    右侧空间不足时自动翻转到左侧。渲染在 fixed 层，避免被父级 overflow 裁剪。 */

/** 触发元素的关键坐标（视口坐标系） */
export interface TipAnchor {
  left: number;
  right: number;
  centerY: number;
}

/** 气泡本体：HoverTip 内部使用，也可配合自有状态逻辑使用（如编辑器工具栏「更多」折叠） */
export function TipBubble({ text, anchor }: { text: string; anchor: TipAnchor }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; transform: string } | null>(null);

  useLayoutEffect(() => {
    const gap = 8;
    const margin = 8; // 距视口边缘的安全距离
    const w = ref.current?.offsetWidth ?? 0;
    if (anchor.right + gap + w <= window.innerWidth - margin) {
      // 默认：按钮右侧，垂直居中
      setPos({ left: anchor.right + gap, top: anchor.centerY, transform: 'translate(0, -50%)' });
    } else {
      // 右侧放不下：翻转到按钮左侧
      setPos({ left: anchor.left - gap, top: anchor.centerY, transform: 'translate(-100%, -50%)' });
    }
  }, [anchor]);

  return createPortal(
    <div
      ref={ref}
      role="tooltip"
      className="fixed z-[70] pointer-events-none"
      style={pos ?? { left: anchor.right, top: anchor.centerY, visibility: 'hidden' }}
    >
      <span className="hover-tip-in block whitespace-nowrap px-2 py-1 rounded-md bg-gray-900/90 text-white text-[12px] leading-4 shadow-lg">
        {text}
      </span>
    </div>,
    document.body,
  );
}

type HoverTipChild = ReactElement<{
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  'aria-label'?: string;
}>;

/** 声明式悬停提示：<HoverTip text="..."><button/></HoverTip>
    通过 cloneElement 注入悬停事件并保留子元素原有回调；同时补充 aria-label 保证可访问性 */
export function HoverTip({ text, children }: { text: string; children: HoverTipChild }) {
  const [anchor, setAnchor] = useState<TipAnchor | null>(null);

  if (!isValidElement(children)) return children;

  // 可访问名称策略：与原生 title 行为一致 —— 有文字内容的元素其名称来自文字，
  // 不注入 aria-label；仅图标/空内容元素才用提示文本补足可访问名称
  const childProps = children.props as Record<string, unknown>;
  const hasTextContent = typeof childProps.children === 'string' || Array.isArray(childProps.children);
  const ariaLabel =
    (childProps['aria-label'] as string | undefined) ??
    (!hasTextContent ? text : undefined);

  return (
    <>
      {cloneElement(children, {
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
          children.props.onMouseEnter?.(e);
          const r = e.currentTarget.getBoundingClientRect();
          setAnchor({ left: r.left, right: r.right, centerY: r.top + r.height / 2 });
        },
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
          children.props.onMouseLeave?.(e);
          setAnchor(null);
        },
        onBlur: (e: React.FocusEvent<HTMLElement>) => {
          children.props.onBlur?.(e);
          setAnchor(null);
        },
        ...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {}),
      })}
      {anchor && <TipBubble text={text} anchor={anchor} />}
    </>
  );
}
