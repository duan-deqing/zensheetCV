import { Fragment, useEffect, useRef, useState } from 'react';
import { editorViewRef, insertMarkdown } from './insertMarkdown';
import { BUTTON_GROUPS, ToolbarButtonIcon } from './Toolbar';

/** 悬浮工具栏按钮：深底上的浅字样式（与编辑器工具栏同构，配色反白） */
const SEL_BUTTON_CLASSES =
  'px-1.5 h-6 font-mono text-[12px] font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors flex items-center shrink-0';

/** 编辑器选中文字悬浮工具栏：鼠标释放（或键盘选择）后才出现在选区上方（空间不足时翻转下方），
 * 按钮与编辑器工具栏完全一致（BUTTON_GROUPS 复用）。
 * 定位基于原生选区 getBoundingClientRect（fixed 悬浮），mousedown 阻止默认以保住选区 */
export function SelectionToolbar() {
  const [pos, setPos] = useState<{ left: number; top: number; below: boolean } | null>(null);
  /** 鼠标是否正在编辑器内拖拽选择：拖拽过程中 selectionchange 只隐藏不显示 */
  const mouseDownRef = useRef(false);

  /** 由当前原生选区计算工具栏位置：选区非空且位于编辑器内时显示 */
  const update = () => {
    const view = editorViewRef.current;
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    if (!view || !sel || sel.isCollapsed || sel.rangeCount === 0 || !view.hasFocus) {
      setPos(null);
      return;
    }
    const anchor = sel.anchorNode;
    if (!anchor || !view.dom.contains(anchor)) {
      setPos(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setPos(null);
      return;
    }
    // 选区上方 8px 居中；距视口顶部不足一栏高度时翻转到底部下方
    const below = rect.top < 56;
    setPos({
      left: rect.left + rect.width / 2,
      top: below ? rect.bottom + 8 : rect.top - 8,
      below,
    });
  };

  useEffect(() => {
    /** 拖拽中的选区变化 → 隐藏；拖拽结束后的最终变化 → 重新定位显示 */
    const onSelectionChange = () => {
      if (mouseDownRef.current) {
        setPos(null);
        return;
      }
      update();
    };
    /** 仅编辑器内按下视为开始拖拽（工具栏上的按下不算，避免点击按钮时闪烁） */
    const onMouseDown = (e: MouseEvent) => {
      const view = editorViewRef.current;
      mouseDownRef.current = !!view && view.dom.contains(e.target as Node);
      if (mouseDownRef.current) setPos(null);
    };
    /** 鼠标释放：拖拽结束，此时才显示工具栏 */
    const onMouseUp = () => {
      mouseDownRef.current = false;
      update();
    };
    /** 键盘选择（Shift + 方向键）：松开按键后显示 */
    const onKeyUp = () => {
      if (!mouseDownRef.current) update();
    };
    /** 滚动跟随：仅在工具栏已显示且不在拖拽中时重新定位 */
    const onScroll = () => {
      if (!mouseDownRef.current) update();
    };
    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const insertText = (before: string, after = '', atLineStart = false) =>
    insertMarkdown(editorViewRef.current, before, after, atLineStart);

  if (!pos) return null;

  return (
    <div
      role="toolbar"
      aria-label="选中文字工具栏"
      onMouseDown={(e) => e.preventDefault()}
      className="selection-toolbar-in fixed z-50 flex items-center gap-0.5 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg px-1 py-1"
      style={{
        left: pos.left,
        top: pos.top,
        transform: pos.below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
      }}
    >
      <style>{`
        @keyframes selectionToolbarIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .selection-toolbar-in { animation: selectionToolbarIn 0.12s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .selection-toolbar-in { animation: none; }
        }
      `}</style>
      {BUTTON_GROUPS.map((group, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="w-px h-4 bg-white/20 shrink-0" aria-hidden="true" />}
          <div className="flex items-center gap-0.5 shrink-0">
            {group.buttons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => insertText(btn.before ?? '', btn.after ?? '', btn.atLineStart)}
                aria-label={btn.title}
                className={SEL_BUTTON_CLASSES}
                style={{ fontWeight: btn.fontWeight, fontStyle: btn.fontStyle }}
              >
                <ToolbarButtonIcon label={btn.label} />
              </button>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
