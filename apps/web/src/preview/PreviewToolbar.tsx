import { usePreview } from '@/store/PreviewContext';
import { useUI } from '@/store/UIContext';

/** 调色盘线性图标，颜色跟随 currentColor */
function PaletteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

/** 照片线性图标 */
function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

/** 预览窗口顶栏：眉标 + 照片上传/主题面板开关 + 缩放/全屏控制。
 *  模板切换已移至主题侧边栏（ThemeConfigPanel） */
export function PreviewToolbar() {
  const { scale, setScale, isFullscreen, toggleFullscreen } = usePreview();
  const { themePanelOpen, toggleThemePanel, photoModalOpen, togglePhotoModal } = useUI();

  return (
    <div className="relative flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0"
        aria-hidden="true"
      >
        {'< PREVIEW />'}
      </p>
      <div className="ml-auto flex items-center gap-1 shrink-0">
        <button
          onClick={togglePhotoModal}
          className={`h-7 px-2.5 inline-flex items-center gap-1.5 text-[13px] font-medium rounded-md transition-colors ${
            photoModalOpen
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
          }`}
          title="上传照片（证件照比例，可在页面上拖动与缩放）"
        >
          <PhotoIcon />
          照片
        </button>
        <button
          onClick={toggleThemePanel}
          className={`h-7 px-2.5 inline-flex items-center gap-1.5 text-[13px] font-medium rounded-md transition-colors ${
            themePanelOpen
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
          }`}
          title="主题配置"
        >
          <PaletteIcon />
          主题
        </button>
        <span className="w-px h-4 bg-gray-200 shrink-0" aria-hidden="true" />
        <button
          onClick={() => setScale(Math.max(50, scale - 10))}
          className="font-mono text-[13px] w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
          title="缩小"
        >
          −
        </button>
        <span className="font-mono text-[13px] text-gray-500 w-10 text-center tabular-nums">{scale}%</span>
        <button
          onClick={() => setScale(Math.min(150, scale + 10))}
          className="font-mono text-[13px] w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
          title="放大"
        >
          +
        </button>
        <button
          onClick={toggleFullscreen}
          className="font-mono text-[13px] w-7 h-7 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors ml-1"
          title={isFullscreen ? '退出全屏' : '全屏预览'}
        >
          {isFullscreen ? '⊡' : '⊞'}
        </button>
      </div>
    </div>
  );
}
