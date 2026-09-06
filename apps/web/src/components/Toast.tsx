import { useToastValue } from '@/store/ToastContext';

/** 全局顶部中央胶囊提示：与模板库 / Coffee 致谢胶囊同款
 *  （深色底 rounded-full，滑入 / 淡出动画，reduced-motion 自动跳过）。
 *  Markdown 导入 / 导出等操作结果在此展示；不拦截点击 */
export function Toast() {
  const { toasts } = useToastValue();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed left-1/2 top-6 -translate-x-1/2 z-[110] flex flex-col items-center gap-2 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${
            toast.exiting ? 'toast-pill-out' : 'toast-pill-in'
          } px-5 py-2.5 rounded-full bg-gray-900/90 text-white text-[13px] font-medium shadow-lg whitespace-nowrap`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
