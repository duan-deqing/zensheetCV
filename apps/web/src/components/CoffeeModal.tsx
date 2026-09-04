import { useEffect } from 'react';
import { useUI } from '@/store/UIContext';

/** 收款码图片（public 下，构建时保持原路径，运行时以 BASE_URL 前缀引用兼容子路径部署） */
const QR_SRC = `${import.meta.env.BASE_URL}buy-me-a-coffee.png`;

/** 线性咖啡杯图标：顶栏入口按钮使用，颜色跟随 currentColor */
export function CoffeeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      aria-hidden="true"
    >
      <path d="M17 8h1a3 3 0 0 1 0 6h-1" />
      <path d="M3 8h14v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <path d="M7 2v2" />
      <path d="M11 2v2" />
      <path d="M15 2v2" />
    </svg>
  );
}

/** 请作者喝杯咖啡弹窗：展示收款码，「已支持」致谢关闭，「稍后支持」直接关闭 */
export function CoffeeModal() {
  const { coffeeModalOpen, toggleCoffeeModal, addToast } = useUI();

  // Esc 关闭
  useEffect(() => {
    if (!coffeeModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleCoffeeModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [coffeeModalOpen, toggleCoffeeModal]);

  if (!coffeeModalOpen) return null;

  const handleSupported = () => {
    addToast('感谢支持，祝你求职顺利！', 'success');
    toggleCoffeeModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="请作者喝杯咖啡"
    >
      <style>{`
        @keyframes coffeeModalIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes coffeeBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .coffee-modal-in { animation: coffeeModalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .coffee-backdrop-in { animation: coffeeBackdropIn 0.2s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .coffee-modal-in, .coffee-backdrop-in { animation: none; }
        }
      `}</style>
      {/* 遮罩：点击关闭 */}
      <div
        className="coffee-backdrop-in absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
        onClick={toggleCoffeeModal}
        aria-hidden="true"
      />
      {/* 卡片 */}
      <div className="coffee-modal-in relative w-[340px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* 顶栏：与应用其他弹窗同构（mono 眉标 + 关闭按钮） */}
        <div className="flex items-center gap-3 px-5 py-2 bg-white border-b border-gray-200 shrink-0">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0"
            aria-hidden="true"
          >
            {'< COFFEE />'}
          </p>
          <h3 className="text-sm font-semibold text-gray-900">请作者喝杯咖啡</h3>
          <button
            onClick={toggleCoffeeModal}
            className="ml-auto w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* 内容：收款码 + 文案 */}
        <div className="px-5 py-4 flex flex-col items-center overflow-y-auto">
          <img
            src={QR_SRC}
            alt="赞赏收款码"
            className="w-[210px] rounded-xl border border-gray-200"
          />
          <p className="mt-3 text-[13px] text-gray-500 text-center leading-relaxed">
            如果 ZENSHEET · 简历 帮到了你，欢迎请作者喝杯咖啡 ☕
          </p>
        </div>

        {/* 底部操作：已支持 / 稍后支持 */}
        <div className="px-5 pb-4 pt-1 flex items-center gap-2.5">
          <button
            onClick={handleSupported}
            className="flex-1 h-9 rounded-full bg-primary-600 text-white text-[13px] font-medium hover:bg-primary-700 active:scale-[0.98] transition-all"
          >
            已支持
          </button>
          <button
            onClick={toggleCoffeeModal}
            className="flex-1 h-9 rounded-full border border-gray-200 bg-white text-gray-600 text-[13px] font-medium hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            稍后支持
          </button>
        </div>
      </div>
    </div>
  );
}
