import { useCallback, useState } from 'react';
import { useResumeStore } from '@/store/ResumeContext';

/**
 * 浏览器打印导出（纯前端方案）：
 * 预览区已按 A4 分页渲染（[data-resume-page]），导出时把每页克隆进
 * #print-root 打印容器，注入排版源样式后调用 window.print()，
 * 用户在系统打印对话框中选择「另存为 PDF」即可得到与预览一致的 PDF。
 */
export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentResume } = useResumeStore();

  const exportPDF = useCallback(async () => {
    if (!currentResume) {
      setError('No resume selected');
      return false;
    }

    const pages = Array.from(document.querySelectorAll<HTMLElement>('[data-resume-page]'));
    if (pages.length === 0) {
      setError('未找到预览内容');
      return false;
    }

    setIsExporting(true);
    setError(null);

    // 打印容器：先复制排版源中的 <style>（模板 CSS + 主题变量），
    // 再逐页克隆分页预览 DOM（照片层随之带入，交互控件由打印样式隐藏）
    const printRoot = document.createElement('div');
    printRoot.id = 'print-root';
    printRoot.setAttribute('aria-hidden', 'true');
    document
      .querySelectorAll('.resume-export-root style')
      .forEach((s) => printRoot.appendChild(s.cloneNode(true)));
    pages.forEach((p) => printRoot.appendChild(p.cloneNode(true)));
    document.body.appendChild(printRoot);
    document.body.classList.add('print-mode');

    try {
      // 打印结束后清理（对话框关闭时触发 afterprint；个别浏览器不触发则兜底移除）
      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        printRoot.remove();
        document.body.classList.remove('print-mode');
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);

      window.print();

      // window.print() 在 Chromium 同步阻塞至对话框关闭，返回后立即恢复按钮态
      window.setTimeout(cleanup, 60_000);
      return true;
    } catch (err: any) {
      printRoot.remove();
      document.body.classList.remove('print-mode');
      setError(err.message || 'PDF export failed');
      return false;
    } finally {
      // 清理可能仍由 afterprint 兜底，但按钮态先恢复
      setIsExporting(false);
    }
  }, [currentResume]);

  return { exportPDF, isExporting, error };
}
