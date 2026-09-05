/** 复制文本：优先 Clipboard API（仅安全上下文可用），
 *  非安全上下文（如局域网 IP 访问 dev server）或 API 失败时回退 execCommand */
export async function copyText(text: string): Promise<boolean> {
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
