import { useCallback, useEffect, useState } from 'react';
import { useTr } from '@/i18n/LangContext';
import { useUI } from '@/store/UIContext';
import { isInAppWebView } from '@/hooks/usePDFExport';
import { copyText } from '@/utils/clipboard';
import { useModalClose } from '@/hooks/useModalClose';
import { HoverTip } from '@/components/HoverTip';

/** 本会话内已关闭提示的 sessionStorage 标记 */
const DISMISSED_KEY = 'stylan.browser_hint_dismissed';

/** 「复制链接到浏览器」导出提示弹窗：
 *  - App 内置 WebView（微信 / QQ 等无地址栏环境）打开时自动弹出，每次会话一次；
 *  - 手机端导出菜单的问号按钮在非 Chrome / Edge 浏览器下也可手动打开。
 *  引导使用 Chrome（推荐）或电脑端打开——导出 PDF 仅这些环境可靠支持 */
export function BrowserHint() {
  const tr = useTr();
  const { browserHintOpen, toggleBrowserHint } = useUI();
  // 复制结果内联提示：2 秒后自动消失（toast 仅在编辑页渲染，此处用内联反馈）
  const [copied, setCopied] = useState<{ text: string; ok: boolean } | null>(null);

  // WebView 自动提示：本会话内手动关闭过（含问号入口关闭）则不再自动弹出
  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISSED_KEY)) return;
    } catch {
      /* sessionStorage 不可用（隐私模式）时仍提示 */
    }
    if (isInAppWebView()) toggleBrowserHint();
  }, [toggleBrowserHint]);

  /** 统一关闭：记住本会话内不再自动打扰 */
  const handleClose = useCallback(() => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* 忽略持久化失败 */
    }
    toggleBrowserHint();
  }, [toggleBrowserHint]);

  // 统一关闭流程：✕ / Esc / 遮罩点击 → 淡出动画结束后卸载
  const { closing, close } = useModalClose(browserHintOpen, handleClose);

  // 内联提示自动消失
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (!browserHintOpen) return null;

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

        {/* 主体：注意图标 + 标题 + 说明（图文左右排布，文案左对齐更好读） */}
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 w-11 h-11 rounded-full bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[14px] font-semibold text-gray-900 leading-6">
              {tr({ zh: '请在浏览器中打开', en: 'Open in a Browser' })}
            </h4>
            <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
              {tr({
                zh: '如需导出为 PDF，请使用 Chrome 浏览器打开，又或者使用电脑端打开；其余浏览器无法导出为 PDF。',
                en: 'To export as PDF, open this page in Chrome, or use a desktop browser. Other browsers cannot export PDF.',
              })}
            </p>
          </div>
        </div>

        {/* 底部操作：等宽双按钮，手机端点按面积更大 */}
        <div className="w-full flex items-stretch gap-2 mt-5">
          <button
            onClick={close}
            className="flex-1 h-9 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 text-[13px] font-medium transition-colors"
          >
            {tr({ zh: '知道了', en: 'Got it' })}
          </button>
          <button
            onClick={copyLink}
            className="flex-1 h-9 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-medium transition-colors"
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
