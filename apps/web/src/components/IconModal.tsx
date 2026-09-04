import { useEffect, useState } from 'react';
import { useUI } from '@/store/UIContext';
import { usePreview } from '@/store/PreviewContext';
import { getIconMap } from '@/preview/resumeIcons';
import { HoverTip } from '@/components/HoverTip';
import { useModalClose } from '@/hooks/useModalClose';

/** 复制文本：优先 Clipboard API（仅安全上下文可用），
 *  非安全上下文（如局域网 IP 访问 dev server）或 API 失败时回退 execCommand */
async function copyText(text: string): Promise<boolean> {
  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* 权限被拒或文档失焦时走回退方案 */
    }
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/** 图标库弹窗：展示全部可用图标（内置 + 当前简历自定义），点击复制 `icon:名称` 语法。
 *  编辑导航栏「图标」按钮打开，替代原主题侧边栏的图标管理 */
export function IconModal() {
  const { iconModalOpen, toggleIconModal } = useUI();
  const { themeConfig } = usePreview();
  // 统一关闭流程：淡出动画结束后再卸载
  const { closing, close } = useModalClose(iconModalOpen, toggleIconModal);
  // 复制结果内联提示：显示在底部提示区右侧，2 秒后自动消失
  const [copied, setCopied] = useState<{ text: string; ok: boolean } | null>(null);

  // Esc 关闭
  useEffect(() => {
    if (!iconModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [iconModalOpen, close]);

  // 提示自动消失
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (!iconModalOpen) return null;
  const icons = getIconMap(themeConfig.customIcons);

  const copySyntax = async (key: string) => {
    const ok = await copyText(`icon:${key}`);
    setCopied(ok ? { text: `已复制 icon:${key}`, ok: true } : { text: '复制失败，请手动输入', ok: false });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="图标库"
    >
      <style>{`
        @keyframes iconModalIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes iconBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .icon-modal-in { animation: iconModalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .icon-backdrop-in { animation: iconBackdropIn 0.2s ease-out both; }
        .tp-icon { display: inline-flex; align-items: center; vertical-align: -0.125em; }
        .tp-icon svg { width: 1em; height: 1em; fill: currentColor; }
        @keyframes iconTipIn {
          from { opacity: 0; transform: translateX(4px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .icon-tip-in { animation: iconTipIn 0.15s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .icon-modal-in, .icon-backdrop-in, .icon-tip-in { animation: none; }
        }
      `}</style>
      {/* 遮罩：点击关闭 */}
      <div
        className={`${closing ? 'modal-backdrop-out' : 'icon-backdrop-in'} absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]`}
        onClick={close}
        aria-hidden="true"
      />
      {/* 面板：图标网格 + 底部提示区 */}
      <div className={`${closing ? 'modal-out' : 'icon-modal-in'} relative flex flex-col bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden w-[min(760px,92vw)] max-h-[78vh]`}>
        {/* 顶栏：与预览顶栏同构（mono 眉标 + py-2 + h-7 按钮 = 44px 等高） */}
        <div className="flex items-center gap-3 px-5 py-2 bg-white border-b border-gray-200 flex-none">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0"
            aria-hidden="true"
          >
            {'< ICONS />'}
          </p>
          <h3 className="text-sm font-semibold text-gray-900">图标库</h3>
          <HoverTip text="关闭">
            <button
              onClick={close}
              className="ml-auto w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
              aria-label="关闭图标库"
            >
              ✕
            </button>
          </HoverTip>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2.5 p-5 overflow-y-auto flex-1 min-h-0 content-start">
          {Object.entries(icons).map(([key, svg]) => (
            <HoverTip key={key} text={`点击复制 icon:${key}`}>
              <button
                onClick={() => copySyntax(key)}
                className="w-full h-16 flex flex-col items-center justify-center gap-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-colors"
              >
                <span
                  className="tp-icon text-xl"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
                <span className="text-[11px] text-gray-400 truncate max-w-full px-1">{key}</span>
              </button>
            </HoverTip>
          ))}
        </div>

        {/* 底部提示：独立区域，说明用法；右侧内联显示复制结果 */}
        <div className="flex-none border-t border-gray-200 bg-gray-50/70 px-5 py-2.5 flex items-center gap-3">
          <p className="text-[12px] text-gray-500">
            Markdown 中写 <code className="font-mono text-gray-700">icon:名称</code>
            ，点击图标即可复制对应语法
          </p>
          {copied && (
            <span
              className={`ml-auto text-[12px] font-medium icon-tip-in ${copied.ok ? 'text-green-600' : 'text-red-500'}`}
              role="status"
            >
              {copied.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
