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
  templateModalOpen: boolean;
  photoModalOpen: boolean;
  iconModalOpen: boolean;
  userModalOpen: boolean;
  /** 模板库中已添加的模板 id，决定主题面板下拉中可选项（当前模板始终可选） */
  addedTemplates: string[];
  toasts: ToastMessage[];
  toggleSidebar: () => void;
  toggleThemePanel: () => void;
  toggleAIPanel: () => void;
  toggleTemplateModal: () => void;
  togglePhotoModal: () => void;
  toggleIconModal: () => void;
  toggleUserModal: () => void;
  addTemplate: (id: string) => void;
  removeTemplate: (id: string) => void;
  setAIPanelOpen: (open: boolean) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const UIContext = createContext<UIContextType | null>(null);

/** 已添加模板在 localStorage 中的键 */
const ADDED_TEMPLATES_KEY = 'stylan.added_templates';

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const [aiPanelOpen, setAIPanelOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  // 已添加模板持久化在 localStorage：模板库「添加」后写入，主题面板下拉读取
  const [addedTemplates, setAddedTemplates] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(ADDED_TEMPLATES_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), []);
  const toggleThemePanel = useCallback(() => setThemePanelOpen((p) => !p), []);
  const toggleAIPanel = useCallback(() => setAIPanelOpen((p) => !p), []);
  const toggleTemplateModal = useCallback(() => setTemplateModalOpen((p) => !p), []);
  const togglePhotoModal = useCallback(() => setPhotoModalOpen((p) => !p), []);
  const toggleIconModal = useCallback(() => setIconModalOpen((p) => !p), []);
  const toggleUserModal = useCallback(() => setUserModalOpen((p) => !p), []);

  const addTemplate = useCallback((id: string) => {
    setAddedTemplates((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(ADDED_TEMPLATES_KEY, JSON.stringify(next));
      } catch {
        /* localStorage 不可用时仅保留在内存 */
      }
      return next;
    });
  }, []);

  const removeTemplate = useCallback((id: string) => {
    setAddedTemplates((prev) => {
      const next = prev.filter((t) => t !== id);
      try {
        localStorage.setItem(ADDED_TEMPLATES_KEY, JSON.stringify(next));
      } catch {
        /* localStorage 不可用时仅保留在内存 */
      }
      return next;
    });
  }, []);

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
        templateModalOpen,
        photoModalOpen,
        iconModalOpen,
        userModalOpen,
        addedTemplates,
        toasts,
        toggleSidebar,
        toggleThemePanel,
        toggleAIPanel,
        toggleTemplateModal,
        togglePhotoModal,
        toggleIconModal,
        toggleUserModal,
        addTemplate,
        removeTemplate,
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
