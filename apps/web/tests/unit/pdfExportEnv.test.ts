import { describe, expect, it } from 'vitest';
import { canUsePrintExport, isInAppWebView } from '@/hooks/usePDFExport';

/** App 内置 WebView 检测：BrowserHint 提示条的显示条件 */
describe('isInAppWebView', () => {
  it('桌面浏览器非 WebView', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
    expect(isInAppWebView(ua)).toBe(false);
  });

  it('微信 / QQ / 钉钉 / 微博内置 WebView 命中', () => {
    const wechat =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49';
    const qq =
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36 V1_AND_SQ_8.9.63 QQ/8.9.63';
    const dingtalk =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 DingTalk/7.0.0';
    const weibo =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Weibo/13.0.0';
    expect(isInAppWebView(wechat)).toBe(true);
    expect(isInAppWebView(qq)).toBe(true);
    expect(isInAppWebView(dingtalk)).toBe(true);
    expect(isInAppWebView(weibo)).toBe(true);
  });
});

/** UA 环境检测：决定 PDF 导出走「浏览器打印」还是降级「截图生成」 */
describe('canUsePrintExport', () => {
  const doc = document; // 测试环境无 ontouchend，模拟桌面判定

  it('桌面浏览器走打印导出', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
    expect(canUsePrintExport(ua, doc)).toBe(true);
  });

  it('微信内置浏览器降级截图', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49';
    expect(canUsePrintExport(ua, doc)).toBe(false);
  });

  it('Android 微信内置浏览器降级截图', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.49';
    expect(canUsePrintExport(ua, doc)).toBe(false);
  });

  it('QQ 内置浏览器降级截图', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36 V1_AND_SQ_8.9.63 QQ/8.9.63';
    expect(canUsePrintExport(ua, doc)).toBe(false);
  });

  it('iOS Safari 走打印导出', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
    expect(canUsePrintExport(ua, doc)).toBe(true);
  });

  it('iOS Chrome（WKWebView）降级截图', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.0.0 Mobile/15E148 Safari/604.1';
    expect(canUsePrintExport(ua, doc)).toBe(false);
  });

  it('Android Chrome 走打印导出', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
    expect(canUsePrintExport(ua, doc)).toBe(true);
  });

  it('Android UC / 夸克等国产浏览器降级截图', () => {
    const uc =
      'Mozilla/5.0 (Linux; U; Android 14; zh-CN) AppleWebKit/537.36 (KHTML, like Gecko) UCBrowser/15.5.1 U/3.0 Mobile Safari/537.36';
    const quark =
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 Quark/7.0.0';
    expect(canUsePrintExport(uc, doc)).toBe(false);
    expect(canUsePrintExport(quark, doc)).toBe(false);
  });
});
