import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIContextType {
  sidebarOpen: boolean;
  themePanelOpen: boolean;
  aiPanelOpen: boolean;
  toasts: ToastMessage[];
  toggleSidebar: () => void;
  toggleThemePanel: () => void;
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const [aiPanelOpen, setAIPanelOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), []);
  const toggleThemePanel = useCallback(() => setThemePanelOpen((p) => !p), []);
  const toggleAIPanel = useCallback(() => setAIPanelOpen((p) => !p), []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    const timer = setTimeout(() => removeToast(id), 3000);
    timersRef.current.set(id, timer);
  }, [removeToast]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <UIContext.Provider
      value={{
        sidebarOpen,
        themePanelOpen,
        aiPanelOpen,
        toasts,
        toggleSidebar,
        toggleThemePanel,
        toggleAIPanel,
        setAIPanelOpen,
        addToast,
        removeToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}
