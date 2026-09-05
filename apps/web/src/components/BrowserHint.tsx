import { useEffect, useState } from 'react';
import { useTr } from '@/i18n/LangContext';
import { useToastValue } from '@/store/ToastContext';
import { isInAppWebView } from '@/hooks/usePDFExport';
import { copyText } from '@/utils/clipboard';

/** 本会话内已关闭提示的 sessionStorage 标记 */
const DISMISSED_KEY = 'stylan.browser_hint_dismissed';

/** App 内置 WebView（微信 / QQ 等无地址栏环境）打开时的顶部提示条：
 *  引导复制链接到系统浏览器打开（推荐 Chrome）——导出 PDF 仅浏览器支持。
 *  每次 WebView 会话提示一次，关闭后本会话不再显示 */
export function BrowserHint() {
  const tr = useTr();
  const { addToast } = useToastValue();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    try {
      if (isInAppWebView() && !sessionStorage.getItem(DISMISSED_KEY)) setVisible(true);
    } catch {
      /* sessionStorage 不可用（隐私模式）时仍提示，由用户手动关闭 */
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  /** 关闭：先播淡出动画再卸载，并记住本会话内不再打扰 */
  const dismiss = () => {
    setClosing(true);
    window.setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(DISMISSED_KEY, '1');
      } catch {
        /* 忽略持久化失败 */
      }
    }, 180);
  };

  const copyLink = async () => {
    const ok = await copyText(window.location.href);
    addToast(
      ok
        ? tr({ zh: '链接已复制，请在浏览器中打开', en: 'Link copied — open it in your browser' })
        : tr({ zh: '复制失败，请手动复制当前链接', en: 'Copy failed — please copy the link manually' }),
      ok ? 'success' : 'error',
    );
  };

  return (
    <div
      className={`fixed left-1/2 top-[84px] z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 ${
        closing ? 'hint-bar-out' : 'hint-bar-in'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5 rounded-2xl bg-gray-900/90 px-4 py-3 text-white shadow-lg">
        <p className="flex-1 text-[13px] leading-relaxed">
          {tr({
            zh: '在微信等应用内无法导出 PDF，请复制链接到浏览器中打开（推荐 Chrome）后再导出。',
            en: 'PDF export isn’t available inside WeChat etc. Copy the link and open it in a browser (Chrome recommended) to export.',
          })}
        </p>
        <button
          onClick={copyLink}
          className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-white/25"
        >
          {tr({ zh: '复制链接', en: 'Copy Link' })}
        </button>
        <button
          onClick={dismiss}
          aria-label={tr({ zh: '关闭提示', en: 'Dismiss hint' })}
          className="shrink-0 -mr-1 flex h-6 w-6 items-center justify-center text-white/60 transition-colors hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
