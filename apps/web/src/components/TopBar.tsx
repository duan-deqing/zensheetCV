import { useRef, useState } from 'react';
import { useButtonStatus } from '@/components/ButtonStatus';
import { DocsDrawer } from '@/components/DocsDrawer';
import { CoffeeModal, CoffeeIcon } from '@/components/CoffeeModal';
import { MenuToggleButton } from '@/components/MenuPanel';
import { useUI } from '@/store/UIContext';
import { usePDFExport } from '@/hooks/usePDFExport';
import { useTr } from '@/i18n/LangContext';
import { useDismissable } from '@/hooks/useDismissable';
import { BackToResumes, DesktopActions } from '@/components/topbar/DesktopActions';
import { EditableTitle } from '@/components/topbar/EditableTitle';
import { FeatureButtons } from '@/components/topbar/FeatureButtons';
import { MobileMenu } from '@/components/topbar/MobileMenu';

export function TopBar() {
  const tr = useTr();
  const { exportPDF, isExporting } = usePDFExport();
  const buttonStatus = useButtonStatus();
  const { docsDrawerOpen, toggleDocsDrawer, toggleCoffeeModal } = useUI();

  // 手机端折叠菜单开关；点击外部 / Escape 关闭走公共 hook
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  useDismissable(menuOpen, barRef, () => setMenuOpen(false));

  /** 导出 PDF：调起浏览器打印（预览分页 → 另存为 PDF），结果提示渲染在保存按钮旁 */
  const handleExportPDF = async () => {
    const ok = await exportPDF();
    buttonStatus.show(
      ok ? 'success' : 'error',
      ok
        ? tr({
            zh: '已打开打印面板，请在目标打印机中选择「另存为 PDF」',
            en: 'Print dialog opened — choose "Save as PDF" as the printer',
          })
        : tr({ zh: 'PDF 导出失败', en: 'PDF export failed' }),
    );
  };

  return (
    <header className="shrink-0 px-3 pt-3">
      {/* z-30：顶栏需要高于下方编辑器/预览面板，否则文件下拉菜单会被盖住；
          手机端收纳：文字标签隐藏仅留图标，间距收紧；
          barRef：手机折叠菜单的「点击外部关闭」以整个胶囊为边界，未命中时才收起 */}
      <div
        ref={barRef}
        className="relative z-30 h-12 bg-white/90 backdrop-blur border border-gray-200 rounded-full shadow-sm flex items-center justify-between px-2.5 sm:px-6"
      >
        <div className="flex items-center gap-1 sm:gap-3 min-w-0">
          <BackToResumes />
          <span className="w-px h-4 bg-gray-200 shrink-0" aria-hidden="true" />
          <EditableTitle onNotify={buttonStatus.show} />
          <FeatureButtons />
        </div>

        <div className="flex items-center gap-1 lg:gap-1.5">
          {/* 保存 / 导出 / 用户：手机端收进折叠菜单（md 起恢复栏内直显） */}
          <DesktopActions buttonStatus={buttonStatus} onExportPDF={handleExportPDF} isExporting={isExporting} />
          {/* 手机端 Coffee 快捷入口：位于汉堡按钮左侧 */}
          <button
            type="button"
            onClick={() => toggleCoffeeModal()}
            aria-label="Coffee"
            className="md:hidden flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CoffeeIcon />
          </button>
          {/* 手机端折叠按钮：汉堡 ↔ 关闭 */}
          <MenuToggleButton open={menuOpen} onToggle={() => setMenuOpen((p) => !p)} />
        </div>

        {/* 手机端折叠菜单：收纳文件 / 功能 / 保存导出 / 用户全部入口（md 起隐藏） */}
        {menuOpen && (
          <MobileMenu
            onClose={() => setMenuOpen(false)}
            buttonStatus={buttonStatus}
            onExportPDF={handleExportPDF}
            isExporting={isExporting}
          />
        )}
      </div>
      <DocsDrawer open={docsDrawerOpen} onClose={toggleDocsDrawer} />
      {/* 请作者喝杯咖啡（收款码）弹窗 */}
      <CoffeeModal />
    </header>
  );
}
