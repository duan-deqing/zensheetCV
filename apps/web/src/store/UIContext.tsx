import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIContextType {
  sidebarOpen: boolean;
  themePanelOpen: boolean;
  toasts: ToastMessage[];
  toggleSidebar: () => void;
  toggleThemePanel: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), []);
  const toggleThemePanel = useCallback(() => setThemePanelOpen((p) => !p), []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <UIContext.Provider
      value={{ sidebarOpen, themePanelOpen, toasts, toggleSidebar, toggleThemePanel, addToast, removeToast }}
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
