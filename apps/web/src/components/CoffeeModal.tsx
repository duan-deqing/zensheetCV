import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useUI } from '@/store/UIContext';

/** 收款码图片（public 下，构建时保持原路径，运行时以 BASE_URL 前缀引用兼容子路径部署） */
const QR_SRC = `${import.meta.env.BASE_URL}buy-me-a-coffee.png`;

/** 礼花配色：应用主题色系 */
const CONFETTI_COLORS = ['#2563eb', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

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

/** 请作者喝杯咖啡弹窗：展示收款码，「已支持」从窗口两端释放礼花、屏幕中央弹出致谢胶囊后关闭，「稍后支持」直接关闭 */
export function CoffeeModal() {
  const { coffeeModalOpen, toggleCoffeeModal } = useUI();
  // 「已支持」触发礼花后延迟关闭；标记已触发，避免停留期间重复点击叠加多个关闭定时器
  const [celebrated, setCelebrated] = useState(false);
  // 屏幕中央致谢胶囊：in 显示 / out 淡出 / null 隐藏；独立于弹窗渲染，弹窗关闭后仍可停留
  const [thanks, setThanks] = useState<null | 'in' | 'out'>(null);
  // 关闭动画进行中：先播淡出，动画结束后再真正卸载
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);

  // 卸载时清理胶囊/关闭相关定时器
  useEffect(() => () => timersRef.current.forEach((t) => window.clearTimeout(t)), []);

  // 统一关闭入口：播淡出动画 → 卸载弹窗并复位状态
  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    const t = window.setTimeout(() => {
      toggleCoffeeModal();
      setClosing(false);
      setCelebrated(false);
      closingRef.current = false;
    }, 180);
    timersRef.current.push(t);
  };

  // Esc 关闭
  useEffect(() => {
    if (!coffeeModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coffeeModalOpen]);

  if (!coffeeModalOpen && !thanks) return null;

  const handleSupported = () => {
    if (celebrated) return;
    setCelebrated(true);
    // 礼花：以弹窗卡片为参照，从其左右两端的下角向上方内侧喷射，
    // canvas-confetti 默认画布 z-index 高于弹窗，彩带会飘过窗口上方
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      confetti({
        particleCount: 90,
        spread: 65,
        angle: 55,
        startVelocity: 45,
        origin: { x: rect.left / vw, y: rect.bottom / vh },
        colors: CONFETTI_COLORS,
      });
      confetti({
        particleCount: 90,
        spread: 65,
        angle: 125,
        startVelocity: 45,
        origin: { x: rect.right / vw, y: rect.bottom / vh },
        colors: CONFETTI_COLORS,
      });
    }
    // 致谢胶囊：屏幕中央弹出，弹窗关闭后继续停留片刻再淡出
    setThanks('in');
    timersRef.current.push(window.setTimeout(() => close(), 1000));
    timersRef.current.push(window.setTimeout(() => setThanks('out'), 2700));
    timersRef.current.push(window.setTimeout(() => setThanks(null), 3000));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="请作者喝杯咖啡"
    >
      <style>{`
        @keyframes coffeeModalIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes coffeeModalOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(10px) scale(0.97); }
        }
        @keyframes coffeeBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes coffeeBackdropOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes coffeePillIn {
          from { opacity: 0; transform: translateY(10px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes coffeePillOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-8px) scale(0.95); }
        }
        .coffee-modal-in { animation: coffeeModalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .coffee-modal-out { animation: coffeeModalOut 0.18s ease-in both; }
        .coffee-backdrop-in { animation: coffeeBackdropIn 0.2s ease-out both; }
        .coffee-backdrop-out { animation: coffeeBackdropOut 0.18s ease-in both; }
        .coffee-pill-in { animation: coffeePillIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .coffee-pill-out { animation: coffeePillOut 0.3s ease-in both; }
        @media (prefers-reduced-motion: reduce) {
          .coffee-modal-in, .coffee-modal-out, .coffee-backdrop-in, .coffee-backdrop-out,
          .coffee-pill-in, .coffee-pill-out { animation: none; }
        }
      `}</style>
      {/* 遮罩：点击关闭（胶囊停留期间弹窗已卸载，遮罩不渲染且容器不拦截点击） */}
      {coffeeModalOpen && (
        <div
          className={`${closing ? 'coffee-backdrop-out' : 'coffee-backdrop-in'} absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] pointer-events-auto`}
          onClick={close}
          aria-hidden="true"
        />
      )}
      {/* 卡片 */}
      {coffeeModalOpen && (
        <div
          ref={cardRef}
          className={`${closing ? 'coffee-modal-out' : 'coffee-modal-in'} relative w-[410px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col pointer-events-auto`}
        >
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
            onClick={close}
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
            className="w-[270px] rounded-xl border border-gray-200"
          />
          <p className="mt-3 text-[13px] text-gray-500 text-center leading-relaxed">
            如果 ZENSHEET · 简历 帮到了你，欢迎请作者喝杯咖啡 ☕
          </p>
        </div>

        {/* 底部操作：已支持 / 稍后支持 */}
        <div className="px-5 pb-4 pt-1 flex items-center gap-2.5">
          <button
            onClick={handleSupported}
            disabled={celebrated}
            className="flex-1 h-9 rounded-full bg-primary-600 text-white text-[13px] font-medium hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-80 disabled:cursor-default"
          >
            {celebrated ? '感谢支持' : '已支持'}
          </button>
          <button
            onClick={close}
            className="flex-1 h-9 rounded-full border border-gray-200 bg-white text-gray-600 text-[13px] font-medium hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            稍后支持
          </button>
        </div>
        </div>
      )}

      {/* 致谢胶囊：屏幕正中，弹窗关闭后仍停留片刻；不拦截点击 */}
      {thanks && (
        <div
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <div
            className={`${
              thanks === 'out' ? 'coffee-pill-out' : 'coffee-pill-in'
            } px-5 py-2.5 rounded-full bg-gray-900/90 text-white text-[13px] font-medium shadow-lg whitespace-nowrap`}
          >
            感谢支持，祝你求职顺利！
          </div>
        </div>
      )}
    </div>
  );
}
