import { useCallback, useState } from 'react';
import { useResumeStore } from '@/store/ResumeContext';
import { useTr } from '@/i18n/LangContext';

/**
 * 判定当前环境能否使用「浏览器打印」导出 PDF：
 *  - 微信 / QQ / 钉钉等 App 内置 WebView 完全不响应 window.print()；
 *  - iOS 上仅自带 Safari 会弹出打印面板，Chrome / UC / 夸克等第三方浏览器（WKWebView）无反应；
 *  - Android 上 Chrome 系浏览器支持打印预览，但 UC / QQ / 小米等国产浏览器内核支持不稳。
 * 以上环境返回 false，调用方应降级为「截图生成 PDF」方案。
 */
export function canUsePrintExport(
  ua: string = navigator.userAgent,
  touchDocument: { hasOwnProperty(key: string): boolean } = document,
): boolean {
  // App 内置 WebView（微信 / QQ / 钉钉 / 企业微信等）
  if (/MicroMessenger|QQ\/[\d.]+|MQQBrowser|DingTalk|Weibo/i.test(ua)) return false;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && touchDocument.hasOwnProperty('ontouchend'));
  const isMobile = isIOS || /Mobi|Android/i.test(ua);
  if (!isMobile) return true; // 桌面环境一律使用打印（矢量文字、体积小）
  if (isIOS) {
    // iOS：仅 Safari 支持打印面板；CriOS / FxiOS / EdgiOS / UCBrowser 等均为 WKWebView
    return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|Opt\/|OPR\/|UCBrowser|QQBrowser|DuckDuckGo/i.test(ua);
  }
  // Android：国产浏览器内核对打印支持不稳，降级截图；Chrome 系（含 Edge / Samsung）走打印
  return !/UCBrowser|QQBrowser|MiuiBrowser|HeyTapBrowser|VivoBrowser|HuaweiBrowser|Baidu|Quark/i.test(ua);
}

/** 屏外截图舞台：把分页预览克隆到固定 210mm 宽的离屏容器中截图。
 *  独立于预览区可见性与 transform 缩放（手机端预览纸被缩小渲染，
 *  且编辑页签下预览区 display:none，直接截图会得到空白/缩小的内容） */
function buildStage(pages: HTMLElement[]): { stage: HTMLElement; clones: HTMLElement[] } {
  const stage = document.createElement('div');
  stage.setAttribute('aria-hidden', 'true');
  stage.style.cssText = [
    'position:fixed',
    'left:-21000px',
    'top:0',
    'width:210mm',
    'background:#ffffff',
    'z-index:-1',
  ].join(';');
  // 注入排版源中的 <style>（模板 CSS + 主题变量），保证克隆页与预览渲染一致
  document
    .querySelectorAll('.resume-export-root style')
    .forEach((s) => stage.appendChild(s.cloneNode(true)));
  const clones = pages.map((p) => {
    const clone = p.cloneNode(true) as HTMLElement;
    // 隐藏照片交互控件（删除按钮 / 缩放手柄），同打印导出行为
    clone.querySelectorAll('.resume-photo button, .cursor-nwse-resize').forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
    clone.style.boxShadow = 'none';
    stage.appendChild(clone);
    return clone;
  });
  document.body.appendChild(stage);
  return { stage, clones };
}

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentResume } = useResumeStore();
  const tr = useTr();

  /** 降级方案：html2canvas 逐页截图 → jsPDF 组装 A4 → 下载或系统分享。
   *  依赖动态加载：仅在不支持打印的环境按需拉取，不影响首屏体积 */
  const exportViaImage = useCallback(
    async (pages: HTMLElement[]): Promise<boolean> => {
      let stage: HTMLElement | null = null;
      try {
        const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
          import('html2canvas-pro'),
          import('jspdf'),
        ]);

        const built = buildStage(pages);
        stage = built.stage;

        // 等待克隆页中的图片完成解码（含照片 data URL），3s 兜底超时
        await Promise.race([
          Promise.all(
            Array.from(stage.querySelectorAll('img')).map((img) => img.decode().catch(() => {})),
          ),
          new Promise((resolve) => window.setTimeout(resolve, 3_000)),
        ]);

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        for (let i = 0; i < built.clones.length; i++) {
          const canvas = await html2canvas(built.clones[i], {
            scale: 2, // 2 倍采样：1588×2245 px/页，文字边缘清晰
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false,
          });
          if (i > 0) pdf.addPage();
          // 页面本身即 210×297mm（含页边距 padding），整页铺满 A4
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
        }
        const blob = pdf.output('blob');
        const fileName = `${currentResume?.title || 'resume'}.pdf`;

        // iOS 支持文件分享时优先唤起系统分享面板（可存到「文件」）；其余环境直接下载
        const file = new File([blob], fileName, { type: 'application/pdf' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: fileName });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
        }
        return true;
      } catch (err: any) {
        // 用户取消系统分享面板属正常操作，不算失败
        if (err?.name === 'AbortError') return true;
        setError(err?.message || tr({ zh: 'PDF 导出失败', en: 'PDF export failed' }));
        return false;
      } finally {
        stage?.remove();
      }
    },
    [currentResume, tr],
  );

  const exportPDF = useCallback(async () => {
    if (!currentResume) {
      setError(tr({ zh: '未选择简历', en: 'No resume selected' }));
      return false;
    }

    const pages = Array.from(document.querySelectorAll<HTMLElement>('[data-resume-page]'));
    if (pages.length === 0) {
      setError(tr({ zh: '未找到预览内容', en: 'No preview content found' }));
      return false;
    }

    setIsExporting(true);
    setError(null);

    try {
      // 不支持打印的环境（微信等 WebView、iOS 第三方浏览器、部分国产浏览器）
      // 自动降级为截图生成 PDF；桌面与支持打印的移动浏览器保持打印导出
      if (!canUsePrintExport()) {
        return await exportViaImage(pages);
      }

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

      // 等待克隆节点中的图片完成解码：克隆的 <img> 是全新节点，data URL
      // 也要重新异步解析，若立即打印，排版渲染时照片尚未就绪会输出空白。
      // decode() 独立于可见状态（#print-root 平时 display:none 也能解码）；
      // 3s 兜底超时防止个别图片异常时导出被永久卡住。
      const images = Array.from(printRoot.querySelectorAll('img'));
      await Promise.race([
        Promise.all(images.map((img) => img.decode().catch(() => {}))),
        new Promise((resolve) => window.setTimeout(resolve, 3_000)),
      ]);

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
      document.getElementById('print-root')?.remove();
      document.body.classList.remove('print-mode');
      setError(err.message || tr({ zh: 'PDF 导出失败', en: 'PDF export failed' }));
      return false;
    } finally {
      // 清理可能仍由 afterprint 兜底，但按钮态先恢复
      setIsExporting(false);
    }
  }, [currentResume, tr, exportViaImage]);

  return { exportPDF, isExporting, error };
}
