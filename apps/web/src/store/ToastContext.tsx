import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
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
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      // Date.now() 同毫秒可能撞 id，追加自增序号保证唯一
      const id = `${Date.now().toString()}-${toastSeq++}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      const timer = setTimeout(() => removeToast(id), 3000);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
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
