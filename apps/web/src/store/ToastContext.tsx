import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  /** 退场标记：置 true 后播放淡出动画，随后卸载 */
  exiting?: boolean;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastSeq = 0;

/** 全局顶部胶囊提示（toast）：与弹窗开关状态分离为独立 Context，
 *  toast 高频弹出时不再触发订阅 UIContext 的大组件（Navbar / TopBar 等）重渲染 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>[]>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timers = timersRef.current.get(id);
    if (timers) {
      timers.forEach((t) => clearTimeout(t));
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      // Date.now() 同毫秒可能撞 id，追加自增序号保证唯一
      const id = `${Date.now().toString()}-${toastSeq++}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      // 先标记退场播放淡出动画，再卸载（与按钮气泡的两段式节奏一致）
      const exitTimer = setTimeout(() => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      }, 2700);
      const removeTimer = setTimeout(() => removeToast(id), 3000);
      timersRef.current.set(id, [exitTimer, removeTimer]);
    },
    [removeToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((list) => list.forEach((t) => clearTimeout(t)));
      timers.clear();
    };
  }, []);

  const value = { toasts, addToast, removeToast };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToastValue() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToastValue must be used within ToastProvider');
  return context;
}
