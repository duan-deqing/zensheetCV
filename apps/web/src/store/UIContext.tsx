import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { useToastValue } from '@/store/ToastContext';

/** 弹窗 / 面板开关的唯一标识：UIContext 内部以单个 record 持有全部开关状态 */
export type PanelId =
  | 'sidebar'
  | 'themePanel'
  | 'aiWindow'
  | 'templateModal'
  | 'photoModal'
  | 'iconModal'
  | 'userModal'
  | 'coffeeModal'
  | 'docsDrawer'
  | 'browserHint';

interface UIContextType {
  sidebarOpen: boolean;
  themePanelOpen: boolean;
  /** AI 助手聊天窗口（挤入预览右侧） */
  aiWindowOpen: boolean;
  templateModalOpen: boolean;
  photoModalOpen: boolean;
  iconModalOpen: boolean;
  userModalOpen: boolean;
  /** 请作者喝杯咖啡（收款码）弹窗 */
  coffeeModalOpen: boolean;
  /** 编辑器右侧文档抽屉 */
  docsDrawerOpen: boolean;
  /** 「复制链接到浏览器」导出提示弹窗：WebView 自动弹出 / 导出菜单问号手动打开 */
  browserHintOpen: boolean;
  /** 保存成功脉冲计数：手动/自动保存落库成功后递增，驱动保存按钮落定回弹动画 */
  savedPulse: number;
  /** 模板库中已添加的模板 id，决定主题面板下拉中可选项（当前模板始终可选） */
  addedTemplates: string[];
  toggleSidebar: () => void;
  toggleThemePanel: () => void;
  toggleAIWindow: () => void;
  toggleTemplateModal: () => void;
  togglePhotoModal: () => void;
  toggleIconModal: () => void;
  toggleUserModal: () => void;
  toggleCoffeeModal: () => void;
  toggleDocsDrawer: () => void;
  toggleBrowserHint: () => void;
  pulseSaved: () => void;
  addTemplate: (id: string) => void;
  removeTemplate: (id: string) => void;
  /** 兼容保留：toast 已拆分至 ToastContext，此处透传供既有调用点使用 */
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const UIContext = createContext<UIContextType | null>(null);

/** 已添加模板在 localStorage 中的键 */
const ADDED_TEMPLATES_KEY = 'stylan.added_templates';

export function UIProvider({ children }: { children: ReactNode }) {
  // 全部弹窗 / 面板开关收进单个 record：一次 useState 管理 10 个开关，
  // sidebar 默认展开，其余默认关闭
  const [openPanels, setOpenPanels] = useState<Partial<Record<PanelId, boolean>>>({ sidebar: true });
  const [savedPulse, setSavedPulse] = useState(0);
  // 已添加模板持久化在 localStorage：模板库「添加」后写入，主题面板下拉读取
  const [addedTemplates, setAddedTemplates] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(ADDED_TEMPLATES_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const togglePanel = useCallback((id: PanelId) => {
    setOpenPanels((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // —— 以下全部由 record 派生，保持既有对外 API 不变 ——
  const sidebarOpen = !!openPanels.sidebar;
  const themePanelOpen = !!openPanels.themePanel;
  const aiWindowOpen = !!openPanels.aiWindow;
  const templateModalOpen = !!openPanels.templateModal;
  const photoModalOpen = !!openPanels.photoModal;
  const iconModalOpen = !!openPanels.iconModal;
  const userModalOpen = !!openPanels.userModal;
  const coffeeModalOpen = !!openPanels.coffeeModal;
  const docsDrawerOpen = !!openPanels.docsDrawer;
  const browserHintOpen = !!openPanels.browserHint;

  const toggleSidebar = useCallback(() => togglePanel('sidebar'), [togglePanel]);
  const toggleThemePanel = useCallback(() => togglePanel('themePanel'), [togglePanel]);
  const toggleAIWindow = useCallback(() => togglePanel('aiWindow'), [togglePanel]);
  const toggleTemplateModal = useCallback(() => togglePanel('templateModal'), [togglePanel]);
  const togglePhotoModal = useCallback(() => togglePanel('photoModal'), [togglePanel]);
  const toggleIconModal = useCallback(() => togglePanel('iconModal'), [togglePanel]);
  const toggleUserModal = useCallback(() => togglePanel('userModal'), [togglePanel]);
  const toggleCoffeeModal = useCallback(() => togglePanel('coffeeModal'), [togglePanel]);
  const toggleDocsDrawer = useCallback(() => togglePanel('docsDrawer'), [togglePanel]);
  const toggleBrowserHint = useCallback(() => togglePanel('browserHint'), [togglePanel]);
  const pulseSaved = useCallback(() => setSavedPulse((p) => p + 1), []);

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

  // toast 状态在独立的 ToastContext 中；此处透传 addToast（引用稳定），
  // toast 弹出只重渲染 Toast 组件，不再波及订阅 UIContext 的组件
  const { addToast } = useToastValue();

  // value 记忆化：仅开关 / 脉冲 / 模板列表真正变化时才更新引用，
  // Provider 因父级重渲染而重跑时消费者不再连带重渲染
  const value = useMemo(
    () => ({
      sidebarOpen,
      themePanelOpen,
      aiWindowOpen,
      templateModalOpen,
      photoModalOpen,
      iconModalOpen,
      userModalOpen,
      coffeeModalOpen,
      docsDrawerOpen,
      browserHintOpen,
      savedPulse,
      addedTemplates,
      toggleSidebar,
      toggleThemePanel,
      toggleAIWindow,
      toggleTemplateModal,
      togglePhotoModal,
      toggleIconModal,
      toggleUserModal,
      toggleCoffeeModal,
      toggleDocsDrawer,
      toggleBrowserHint,
      pulseSaved,
      addTemplate,
      removeTemplate,
      addToast,
    }),
    [
      sidebarOpen,
      themePanelOpen,
      aiWindowOpen,
      templateModalOpen,
      photoModalOpen,
      iconModalOpen,
      userModalOpen,
      coffeeModalOpen,
      docsDrawerOpen,
      browserHintOpen,
      savedPulse,
      addedTemplates,
      toggleSidebar,
      toggleThemePanel,
      toggleAIWindow,
      toggleTemplateModal,
      togglePhotoModal,
      toggleIconModal,
      toggleUserModal,
      toggleCoffeeModal,
      toggleDocsDrawer,
      toggleBrowserHint,
      pulseSaved,
      addTemplate,
      removeTemplate,
      addToast,
    ],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}
