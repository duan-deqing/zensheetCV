import { HoverTip } from '@/components/HoverTip';
import { CoffeeIcon } from '@/components/CoffeeModal';
import { useUI } from '@/store/UIContext';
import { useTr } from '@/i18n/LangContext';
import { FileMenu } from '@/components/topbar/FileMenu';
import { LayoutIcon, SmileIcon, BookIcon, SparkleIcon } from '@/components/topbar/icons';

/** 顶栏中部功能入口（桌面端 md 起直显）：文件 / 模板库 / 图标库 / 使用文档 / AI 助手 / Coffee。
 *  手机端收进 MobileMenu 折叠菜单 */
export function FeatureButtons() {
  const tr = useTr();
  const {
    toggleTemplateModal,
    toggleIconModal,
    toggleDocsDrawer,
    toggleAIWindow,
    aiWindowOpen,
    toggleCoffeeModal,
  } = useUI();

  /** 与桌面按钮一致的胶囊入口样式 */
  const pillClass =
    'px-2 lg:px-2.5 h-8 inline-flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors whitespace-nowrap';

  return (
    <div className="hidden md:flex items-center gap-1 lg:gap-3 min-w-0">
      <FileMenu />
      {/* 模板库入口：卡片式模板选择弹窗，「添加」后进入主题面板下拉 */}
      <HoverTip text={tr({ zh: '模板库', en: 'Templates' })}>
        <button type="button" onClick={toggleTemplateModal} className={pillClass}>
          <LayoutIcon />
          <span className="hidden lg:inline whitespace-nowrap">{tr({ zh: '模板', en: 'Templates' })}</span>
        </button>
      </HoverTip>
      {/* 图标库入口：点击图标复制 icon:名称 语法 */}
      <HoverTip text={tr({ zh: '图标库', en: 'Icons' })}>
        <button type="button" onClick={toggleIconModal} className={pillClass}>
          <SmileIcon />
          <span className="hidden lg:inline whitespace-nowrap">{tr({ zh: '图标', en: 'Icons' })}</span>
        </button>
      </HoverTip>
      {/* 使用文档入口：右侧抽屉展示，不跳转文档页 */}
      <HoverTip text={tr({ zh: '使用文档', en: 'Docs' })}>
        <button type="button" onClick={toggleDocsDrawer} className={pillClass}>
          <BookIcon />
          <span className="hidden lg:inline whitespace-nowrap">{tr({ zh: '文档', en: 'Docs' })}</span>
        </button>
      </HoverTip>
      {/* AI 助手入口：聊天窗口挤入预览右侧 */}
      <HoverTip text={tr({ zh: 'AI 助手', en: 'AI Assistant' })}>
        <button
          type="button"
          onClick={toggleAIWindow}
          aria-pressed={aiWindowOpen}
          className={`px-2 lg:px-2.5 h-8 inline-flex items-center gap-1.5 text-[13px] rounded-full transition-colors whitespace-nowrap ${
            aiWindowOpen
              ? 'text-primary-700 bg-primary-50'
              : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
          }`}
        >
          <SparkleIcon />
          <span className="hidden lg:inline whitespace-nowrap">{tr({ zh: 'AI 助手', en: 'AI Assistant' })}</span>
        </button>
      </HoverTip>
      {/* 请作者喝杯咖啡：收款码弹窗 */}
      <HoverTip text={tr({ zh: '请作者喝杯咖啡', en: 'Buy Me a Coffee' })}>
        <button type="button" onClick={toggleCoffeeModal} className={pillClass}>
          <CoffeeIcon />
          <span className="hidden lg:inline whitespace-nowrap">Coffee</span>
        </button>
      </HoverTip>
    </div>
  );
}
