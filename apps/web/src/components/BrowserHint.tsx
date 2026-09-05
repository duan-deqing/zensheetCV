import { useCallback, useEffect, useState } from 'react';
import { useTr } from '@/i18n/LangContext';
import { isInAppWebView } from '@/hooks/usePDFExport';
import { copyText } from '@/utils/clipboard';
import { useModalClose } from '@/hooks/useModalClose';
import { HoverTip } from '@/components/HoverTip';

/** 本会话内已关闭提示的 sessionStorage 标记 */
const DISMISSED_KEY = 'stylan.browser_hint_dismissed';

/** App 内置 WebView（微信 / QQ 等无地址栏环境）打开时的居中提示弹窗：
 *  引导复制链接到系统浏览器打开（推荐 Chrome）——导出 PDF 仅浏览器支持。
 *  每次 WebView 会话提示一次，关闭后本会话不再显示 */
export function BrowserHint() {
  const tr = useTr();
  const [visible, setVisible] = useState(false);
  // 复制结果内联提示：2 秒后自动消失（toast 仅在编辑页渲染，此处用内联反馈）
  const [copied, setCopied] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    try {
      if (isInAppWebView() && !sessionStorage.getItem(DISMISSED_KEY)) setVisible(true);
    } catch {
      /* sessionStorage 不可用（隐私模式）时仍提示，由用户手动关闭 */
      setVisible(true);
    }
  }, []);

  /** 真正卸载：记住本会话内不再打扰 */
  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* 忽略持久化失败 */
    }
  }, []);

  // 统一关闭流程：✕ / Esc / 遮罩点击 → 淡出动画结束后卸载
  const { closing, close } = useModalClose(visible, dismiss);

  // 内联提示自动消失
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (!visible) return null;

  const copyLink = async () => {
    const ok = await copyText(window.location.href);
    setCopied(
      ok
        ? { text: tr({ zh: '链接已复制，请在浏览器中打开', en: 'Link copied — open it in your browser' }), ok: true }
        : { text: tr({ zh: '复制失败，请手动复制当前链接', en: 'Copy failed — please copy the link manually' }), ok: false },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={tr({ zh: '浏览器打开提示', en: 'Open in Browser Hint' })}
    >
      {/* 遮罩：点击关闭 */}
      <div
        className={`${closing ? 'modal-backdrop-out' : 'hint-backdrop-in'} absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]`}
        onClick={close}
        aria-hidden="true"
      />
      {/* 卡片：与全站小弹窗同构（白卡 + mono 眉标 + 关闭按钮 + 底部操作） */}
      <div
        className={`${closing ? 'modal-out' : 'hint-modal-in'} relative w-[min(400px,calc(100vw-2rem))] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col px-6 pt-5 pb-6`}
      >
        {/* 头部：mono 眉标 + 关闭按钮 */}
        <div className="w-full flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600" aria-hidden="true">
            {'// BROWSER'}
          </p>
          <HoverTip text={tr({ zh: '关闭', en: 'Close' })}>
            <button
              onClick={close}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
              aria-label={tr({ zh: '关闭提示', en: 'Dismiss hint' })}
            >
              ✕
            </button>
          </HoverTip>
        </div>

        {/* 主体：图标 + 提示文案 */}
        <div className="flex flex-col items-center text-center">
          <div
            className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-3"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
            </svg>
          </div>
          <p className="text-[13px] leading-relaxed text-gray-600">
            {tr({
              zh: '在微信等应用内无法导出 PDF，请复制链接到浏览器中打开（推荐 Chrome）后再导出。',
              en: 'PDF export isn’t available inside WeChat etc. Copy the link and open it in a browser (Chrome recommended) to export.',
            })}
          </p>
        </div>

        {/* 底部操作：知道了（关闭） / 复制链接（主按钮） */}
        <div className="w-full flex items-center justify-end gap-2 mt-5">
          <button
            onClick={close}
            className="h-8 px-4 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 text-[13px] font-medium transition-colors"
          >
            {tr({ zh: '知道了', en: 'Got it' })}
          </button>
          <button
            onClick={copyLink}
            className="h-8 px-4 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-medium transition-colors"
          >
            {tr({ zh: '复制链接', en: 'Copy Link' })}
          </button>
        </div>

        {/* 内联复制结果反馈 */}
        {copied && (
          <p
            className={`mt-2.5 w-full text-right text-[12px] font-medium icon-tip-in ${copied.ok ? 'text-green-600' : 'text-red-500'}`}
            role="status"
          >
            {copied.text}
          </p>
        )}
      </div>
    </div>
  );
}
