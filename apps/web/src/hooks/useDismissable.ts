import { useEffect, useRef, type RefObject } from 'react';

/** 弹层类组件通用关闭监听：active 期间点击容器外部或按 Escape 时触发 onClose。
 *  适用于下拉菜单 / 折叠菜单等即时卸载的弹层（带两段式关闭动画的弹窗走 useModalClose）。
 *  onClose 经 ref 转发，调用方无需 useCallback 也不会导致监听反复挂载 */
export function useDismissable(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!active) return;
    const handleDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) onCloseRef.current();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [active, containerRef]);
}
