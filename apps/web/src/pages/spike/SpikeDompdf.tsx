import { useMemo, useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { defaultTheme } from '@stylan/shared-types';
import { getLang } from '@/i18n/LangContext';
import { sampleMarkdown } from '@/sampleResume';
import { builtinTemplates, getTemplateCss } from '@/templates';
import { getIconMap, RESUME_ICON_TAG, remarkResumeIcons } from '@/preview/resumeIcons';
import { normalizeColMarkers, remarkResumeCols } from '@/preview/remarkResumeCols';
import { rehypeWrapH2Text, resumeColsCss, resumeFontSizeCss, resumeIconsCss, resumeQuoteCss, elementFontSizeVars, A4_HEIGHT_MM, A4_WIDTH_MM, CONTENT_PADDING_MM, MARGIN_MM, DEFAULT_CONTENT_PADDING } from '@/preview/previewShared';
import { collectBlocks, paginate } from '@/preview/pagination';

/**
 * 【Spike 实验页，非正式功能】dompdf.js 手机端导出验证（#/spike-dompdf 直达）。
 * 验证目标：① WASM/Worker 环境可用性 ② 模板保真度（人工比对导出 PDF）
 * ③ 分页一致性（现有 paginate 引擎 vs dompdf computePageBreaks）④ 产物体积。
 * dompdf.js 动态 import 独立分包；中文字体从 CDN 懒加载（spike 用官方示例字体）。
 */

const MM_TO_PX = 96 / 25.4;
/** spike 阶段中文 TTF 来源：dompdf.js 官方示例字体（思源黑体 Regular，约 16MB） */
const CN_FONT_URL = 'https://cdn.jsdelivr.net/gh/lmn1919/dompdf.js@main/examples/SourceHanSansSC-Regular.ttf';

interface LogEntry {
  time: string;
  text: string;
}

export function SpikeDompdf() {
  const [templateId, setTemplateId] = useState(builtinTemplates[0].id);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [fontKB, setFontKB] = useState<number | null>(null);
  /** 样本重复 3 份制造 3~4 页长内容：单页样本测不到分页一致性 */
  const [triple, setTriple] = useState(false);
  const sourceRef = useRef<HTMLDivElement>(null);
  const fontBytesRef = useRef<Uint8Array | null>(null);

  const tpl = builtinTemplates.find((t) => t.id === templateId) ?? builtinTemplates[0];
  const theme = { ...defaultTheme, ...tpl.defaultTheme };

  const log = (text: string) =>
    setLogs((prev) => [{ time: new Date().toLocaleTimeString('zh-CN', { hour12: false }), text }, ...prev].slice(0, 80));

  const baseMarkdown = useMemo(() => normalizeColMarkers(sampleMarkdown(getLang())), []);
  const markdown = useMemo(
    () => (triple ? Array.from({ length: 3 }, () => baseMarkdown).join('\n\n') : baseMarkdown),
    [baseMarkdown, triple],
  );
  const iconMap = useMemo(() => getIconMap(undefined), []);
  const remarkPlugins = useMemo(() => [remarkGfm, remarkResumeCols, remarkResumeIcons(iconMap)], [iconMap]);
  const markdownComponents = useMemo(
    () =>
      ({
        [RESUME_ICON_TAG]: ({ name }: { name?: string }) => {
          const svg = name ? iconMap[name] : undefined;
          if (!svg) return null;
          return <span className="resume-icon" dangerouslySetInnerHTML={{ __html: svg }} />;
        },
      }) as Components, // 自定义元素名不在 JSX.IntrinsicElements 中，需断言
    [iconMap],
  );

  // 排版尺寸：默认主题 margin none + contentPadding normal → 内容宽 190mm
  const padXMM = (MARGIN_MM[theme.marginX] ?? 0) + (CONTENT_PADDING_MM[theme.contentPadding ?? DEFAULT_CONTENT_PADDING] ?? 0);
  const padYMM = (MARGIN_MM[theme.marginY] ?? 0) + (CONTENT_PADDING_MM[theme.contentPadding ?? DEFAULT_CONTENT_PADDING] ?? 0);
  const contentWMM = A4_WIDTH_MM - 2 * padXMM;
  const windowPx = (A4_HEIGHT_MM - 2 * padYMM) * MM_TO_PX;

  /** 中文字体懒加载并缓存（生产方案应换子集化字体 + 走自有 CDN） */
  const ensureFont = async (): Promise<Uint8Array> => {
    if (fontBytesRef.current) return fontBytesRef.current;
    log(`开始拉取中文字体（思源黑体 Regular，约 16MB）…`);
    const t0 = performance.now();
    const res = await fetch(CN_FONT_URL);
    if (!res.ok) throw new Error(`字体拉取失败 HTTP ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    fontBytesRef.current = bytes;
    setFontKB(Math.round(bytes.length / 1024));
    log(`字体就绪：${Math.round(bytes.length / 1024)} KB，耗时 ${Math.round(performance.now() - t0)}ms`);
    return bytes;
  };

  /** 环境检测：dompdf.js 依赖 Worker + WebAssembly */
  const checkEnv = () => {
    log(`UA: ${navigator.userAgent}`);
    log(`WebAssembly: ${typeof WebAssembly === 'object' ? '可用' : '不可用'}；Worker: ${typeof Worker !== 'undefined' ? '可用' : '不可用'}`);
  };

  /** 现有 paginate 引擎对可见排版源实测分页（与预览页同一套测量逻辑） */
  const measureLocalPages = (): { count: number; offsets: number[] } => {
    const el = sourceRef.current;
    if (!el) throw new Error('排版源未渲染');
    const rootRect = el.getBoundingClientRect();
    const s = rootRect.width / el.offsetWidth || 1;
    const blocks = el.children.length > 0 ? collectBlocks(el) : [];
    const tops = blocks.map((b) => (b.getBoundingClientRect().top - rootRect.top) / s);
    const bottoms = blocks.map((b) => (b.getBoundingClientRect().bottom - rootRect.top) / s);
    const { offsets } = paginate(tops, bottoms, rootRect.height / s, windowPx);
    return { count: offsets.length, offsets };
  };

  /** 分页对比：现有引擎 vs dompdf computePageBreaks */
  const comparePagination = async () => {
    setBusy('pagination');
    try {
      const local = measureLocalPages();
      log(`现有引擎：${local.count} 页，页首 Y(px) = [${local.offsets.map((v) => Math.round(v)).join(', ')}]`);
      const mod = await import('dompdf.js');
      const breaks = mod.computePageBreaks(sourceRef.current!, { pagination: true, format: 'a4' });
      log(`dompdf 断点：${breaks.length} 个断点（≈ ${breaks.length + 1} 页），Y(pt) = [${breaks.map((v) => Math.round(v)).join(', ')}]`);
      log(`对照：现有引擎 ${local.count} 页 vs dompdf ≈ ${breaks.length + 1} 页；断点口径不同（px/pt），重点看断点落位是否都在块边界`);
    } catch (err) {
      log(`分页对比失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(null);
    }
  };

  /** dompdf 矢量导出：下载 PDF 并记录耗时/体积/页数 */
  const runDompdf = async () => {
    setBusy('dompdf');
    try {
      checkEnv();
      const fontBytes = await ensureFont();
      const t0 = performance.now();
      const mod = await import('dompdf.js');
      log(`dompdf.js 模块加载完成（${Math.round(performance.now() - t0)}ms），开始导出…`);
      const t1 = performance.now();
      let totalPages: number | undefined;
      const blob = await mod.exportPDF(sourceRef.current!, {
        pagination: true,
        format: 'a4',
        compress: true,
        backgroundColor: '#ffffff',
        // 关闭默认 50px 页眉 + 页码页脚（简历不应带页码）
        pageConfig: () => null,
        fontConfig: [{ fontFamily: 'Noto Sans SC', fontBytes, fontWeight: 400 }],
        onProgress: (p) => {
          if (p.stage === 'rendering' && p.currentPage != null) totalPages = p.totalPages;
          if (p.stage === 'done') log(`渲染阶段完成`);
        },
      });
      const ms = Math.round(performance.now() - t1);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spike-dompdf-${templateId}.pdf`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      log(`导出成功：${(blob.size / 1024).toFixed(1)} KB，耗时 ${ms}ms${totalPages ? `，${totalPages} 页` : ''}，已触发下载`);
    } catch (err) {
      log(`dompdf 导出失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900">Spike：dompdf.js 手机端导出验证</h1>
      <p className="mt-1 text-[13px] text-gray-500">
        实验页（URL 直达，未入导航）。导出前请等待下方简历渲染完成；产物为矢量 PDF，
        可与编辑页截图导出的 PDF 对比体积与清晰度。
      </p>

      {/* 模板选择 */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        {builtinTemplates.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            className={`px-3 h-8 rounded-full text-[12px] font-medium border transition-colors ${
              t.id === templateId ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {t.name}
          </button>
        ))}
        <label className="ml-2 flex items-center gap-1.5 text-[12px] text-gray-600 cursor-pointer select-none">
          <input type="checkbox" checked={triple} onChange={(e) => setTriple(e.target.checked)} className="accent-primary-600" />
          内容 ×3（测多页分页）
        </label>
      </div>

      {/* 操作区 */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={checkEnv}
          className="px-4 h-9 rounded-lg border border-gray-300 text-[13px] font-medium text-gray-700 hover:border-gray-400 transition-colors"
        >
          环境检测
        </button>
        <button
          onClick={comparePagination}
          disabled={busy != null}
          className="px-4 h-9 rounded-lg border border-gray-300 text-[13px] font-medium text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50"
        >
          {busy === 'pagination' ? '对比中…' : '分页对比'}
        </button>
        <button
          onClick={runDompdf}
          disabled={busy != null}
          className="px-4 h-9 rounded-lg bg-primary-600 text-white text-[13px] font-medium hover:bg-primary-700 transition-colors disabled:opacity-60"
        >
          {busy === 'dompdf' ? '导出中…' : 'dompdf 导出 PDF'}
        </button>
        {fontKB != null && <span className="text-[12px] text-gray-500">字体已缓存 {fontKB} KB</span>}
      </div>

      {/* 结果日志 */}
      {logs.length > 0 && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-950 text-gray-100 p-4 max-h-64 overflow-y-auto">
          {logs.map((l, i) => (
            <p key={i} className="font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-all">
              <span className="text-gray-500">[{l.time}]</span> {l.text}
            </p>
          ))}
        </div>
      )}

      {/* 排版源：与编辑页隐藏排版源同构（模板 CSS + 共享样式 + 主题变量），即 dompdf 的导出根 */}
      <div className="mt-6 flex justify-center">
        <style dangerouslySetInnerHTML={{ __html: getTemplateCss(templateId) }} />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .resume-preview {
                --resume-primary: ${theme.primaryColor};
                font-family: ${theme.fontFamily};
                --resume-fs: 1;
                --resume-sp: 1;
                ${elementFontSizeVars(theme)};
              }
              ${resumeColsCss()}
              ${resumeIconsCss()}
              ${resumeQuoteCss()}
              ${resumeFontSizeCss()}
            `,
          }}
        />
        <div
          ref={sourceRef}
          className="resume-preview bg-white border border-gray-200 shadow-sm"
          style={{ width: `${contentWMM}mm`, display: 'flow-root' }}
        >
          <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={[rehypeWrapH2Text]} components={markdownComponents}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
