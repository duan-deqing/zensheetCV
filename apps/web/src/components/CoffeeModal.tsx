import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useUI } from '@/store/UIContext';

/** 收款码列表（public 下，构建时保持原路径，运行时以 BASE_URL 前缀引用兼容子路径部署） */
const QR_CODES = [
  { id: 'wechat', label: '微信支付', src: `${import.meta.env.BASE_URL}buy-me-a-coffee.png` },
  { id: 'alipay', label: '支付宝', src: `${import.meta.env.BASE_URL}buy-me-a-coffee-alipay.jpg` },
] as const;

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

/** 线性对勾图标：感谢卡片使用 */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

/** 请作者喝杯咖啡弹窗：展示收款码（可切换），「已支持」释放礼花、内容切换为感谢卡片、屏幕顶部中央弹出致谢胶囊 */
export function CoffeeModal() {
  const { coffeeModalOpen, toggleCoffeeModal } = useUI();
  // 「已支持」后内容切换为感谢卡片；标记已触发，避免重复点击
  const [celebrated, setCelebrated] = useState(false);
  // 屏幕顶部中央致谢胶囊：in 显示 / out 淡出 / null 隐藏；独立于弹窗渲染，弹窗关闭后仍可停留
  const [thanks, setThanks] = useState<null | 'in' | 'out'>(null);
  // 当前展示的收款码（微信 / 支付宝）
  const [qrIdx, setQrIdx] = useState(0);
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
      setQrIdx(0);
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
    // 致谢胶囊：屏幕顶部中央弹出，停留片刻后淡出；弹窗切换为感谢卡片，由用户手动关闭
    setThanks('in');
    timersRef.current.push(window.setTimeout(() => setThanks('out'), 2400));
    timersRef.current.push(window.setTimeout(() => setThanks(null), 2700));
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
          from { opacity: 0; transform: translateY(-12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes coffeePillOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-10px) scale(0.95); }
        }
        @keyframes coffeeQrIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .coffee-modal-in { animation: coffeeModalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .coffee-modal-out { animation: coffeeModalOut 0.18s ease-in both; }
        .coffee-backdrop-in { animation: coffeeBackdropIn 0.2s ease-out both; }
        .coffee-backdrop-out { animation: coffeeBackdropOut 0.18s ease-in both; }
        .coffee-pill-in { animation: coffeePillIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .coffee-pill-out { animation: coffeePillOut 0.3s ease-in both; }
        .coffee-qr-in { animation: coffeeQrIn 0.22s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .coffee-modal-in, .coffee-modal-out, .coffee-backdrop-in, .coffee-backdrop-out,
          .coffee-pill-in, .coffee-pill-out, .coffee-qr-in { animation: none; }
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

        {/* 内容：感谢卡片（已支持后）/ 收款码（可切换）+ 文案，两分支共用同一容器保证比例与对齐一致 */}
        {celebrated ? (
          <div className="px-5 py-4 flex flex-col items-center overflow-y-auto">
            <div className="coffee-qr-in w-[270px] h-[330px] flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckIcon className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="mt-4 text-lg font-semibold text-gray-900">感谢支持！</p>
              <p className="mt-2 text-[13px] text-gray-500 text-center leading-relaxed">
                你的鼓励是持续更新的动力
                <br />
                祝你求职顺利，offer 满满！
              </p>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 flex flex-col items-center overflow-y-auto">
            <div className="coffee-qr-in w-[270px] h-[330px] flex items-center justify-center" key={QR_CODES[qrIdx].id}>
              <img
                src={QR_CODES[qrIdx].src}
                alt={`${QR_CODES[qrIdx].label}收款码`}
                className="max-w-full max-h-full rounded-xl border border-gray-200"
              />
            </div>
            {/* 收款码切换：胶囊分段控件 */}
            <div
              className="mt-2.5 flex items-center rounded-full border border-gray-200 bg-gray-50 p-0.5"
              role="tablist"
              aria-label="切换收款码"
            >
              {QR_CODES.map((q, i) => (
                <button
                  key={q.id}
                  role="tab"
                  aria-selected={i === qrIdx}
                  onClick={() => setQrIdx(i)}
                  className={`px-3.5 h-7 rounded-full text-[12px] font-medium transition-all ${
                    i === qrIdx
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[13px] text-gray-500 text-center leading-relaxed">
              如果 ZENSHEET · 简历 帮到了你，欢迎请作者喝杯咖啡 ☕
            </p>
          </div>
        )}

        {/* 底部操作：已支持后仅保留关闭 */}
        <div className="px-5 pb-4 pt-1 flex items-center gap-2.5">
          {celebrated ? (
            <button
              onClick={close}
              className="flex-1 h-9 rounded-full bg-primary-600 text-white text-[13px] font-medium hover:bg-primary-700 active:scale-[0.98] transition-all"
            >
              关闭
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
        </div>
      )}

      {/* 致谢胶囊：屏幕顶部中央，弹窗关闭后仍停留片刻；不拦截点击 */}
      {thanks && (
        <div
          className="fixed left-1/2 top-6 -translate-x-1/2 z-[110] pointer-events-none"
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
