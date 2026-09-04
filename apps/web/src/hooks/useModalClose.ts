import { useCallback, useEffect, useRef, useState } from 'react';

const MODAL_EXIT_MS = 180;

/** 弹窗统一关闭流程：先播 180ms 淡出动画（卡片下沉缩小 + 遮罩渐隐），动画结束后再真正卸载。
 *  返回 closing 标记（切换 out 动画类）与 close 统一关闭入口（✕ / Esc / 遮罩点击共用），
 *  closingRef 防止动画期间重复触发叠加定时器。 */
export function useModalClose(open: boolean, onClose: () => void) {
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(() => {
      closingRef.current = false;
      setClosing(false);
      onClose();
    }, MODAL_EXIT_MS);
  }, [onClose]);

  // 非打开态复位标志（如动画期间被外部关闭后残留）
  useEffect(() => {
    if (!open) {
      closingRef.current = false;
      setClosing(false);
    }
  }, [open]);

  return { closing, close };
}
