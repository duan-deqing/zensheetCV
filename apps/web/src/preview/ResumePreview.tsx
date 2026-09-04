import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEditor } from '@/store/EditorContext';
import { usePreview } from '@/store/PreviewContext';
import { usePhotoSync } from '@/hooks/usePhotoSync';
import { getTemplateCss } from '@/templates';
import { normalizeColMarkers, remarkResumeCols } from './remarkResumeCols';
import { RESUME_ICON_TAG, getIconMap, remarkResumeIcons } from './resumeIcons';
import { ResumePhotos } from './ResumePhotos';
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  CONTENT_PADDING_MM,
  DEFAULT_CONTENT_PADDING,
  elementFontSizeVars,
  fontScale,
  MARGIN_MM,
  rehypeWrapH2Text,
  spacingScale,
  resumeColsCss,
  resumeFontSizeCss,
  resumeIconsCss,
  resumeQuoteCss,
} from './previewShared';
import { ThemeConfigPanel } from '@/components/ThemeConfigPanel';
import { PreviewToolbar } from './PreviewToolbar';

/** mm → px 换算（CSS 标准 96dpi） */
const MM_TO_PX = 96 / 25.4;

/* ------------------------------------------------------------------ */
/* 分页引擎 —— 移植 MujiCV 开源实现（github.com/hua1995116/            */
/* react-resume-site，分页核心为其依赖 rs-md-html-parser@0.1.9 的       */
/* htmlParser 函数）：                                                 */
/*  1. 块收集：P/SVG/分栏容器直接含文本节点即为叶子块，纯元素容器下探；  */
/*     LI 整块收集（内嵌 UL 下探），无元素子节点的元素整块收集；         */
/*  2. 贪心装页：块底距页底不足 20px 时整块推至下一页（页尾安全区）；    */
/*     跨越页底的块整体移入下一页 —— 永不在块中间断开；超长块逐页铺开；  */
/*  3. 每页渲染 = 整份内容完整克隆 + translateY 上移 + overflow 裁切；   */
/*     非本页的块透明抹除，防止相邻页内容探入本页可视区。                */
/* ------------------------------------------------------------------ */

interface Pagination {
  offsets: number[];
  /** 每个块所属的页下标区间 [from, to]（超长块可跨页，from < to） */
  blockPages: Array<[number, number]>;
}

/** 页尾安全区：块底距页底不足该值时整块推至下一页（与开源实现一致） */
const BOTTOM_SLACK_PX = 20;

/** 收集分页候选块（DOM 顺序，规则与开源 htmlParser 的块收集函数一致）：
 *  - P/SVG/分栏容器：直接包含文本节点即为叶子块，纯元素容器则递归下探；
 *  - LI：整块收集，其内嵌 UL 递归下探继续收集；
 *  - 其余元素：含元素子节点则下探，否则整块收集 */
function collectBlocks(root: Element): Element[] {
  const out: Element[] = [];
  const visit = (el: Element): void => {
    for (const child of Array.from(el.children)) {
      const tag = child.tagName.toUpperCase();
      const leafish =
        tag === 'P' || tag === 'SVG' || child.classList.contains('resume-cols');
      if (leafish) {
        if (child.childNodes.length !== child.children.length) out.push(child);
        else visit(child);
      } else if (tag === 'LI') {
        out.push(child);
        const nested = Array.from(child.children).find((c) => c.tagName === 'UL');
        if (nested) visit(nested);
      } else if (child.children.length > 0) {
        visit(child);
      } else {
        out.push(child);
      }
    }
  };
  visit(root);
  return out;
}

/** 块级贪心分页（整块装页，与开源 htmlParser 的装页规则一致）：
 *  tops/bottoms 为各块顶/底相对排版源顶部的坐标(px)，capacity 为每页
 *  内容窗口高度。返回每页窗口顶部坐标与各块所属页区间。 */
function paginate(
  tops: number[],
  bottoms: number[],
  totalHeight: number,
  capacity: number,
): Pagination {
  if (totalHeight <= 0 || tops.length === 0) return { offsets: [0], blockPages: [] };
  const offsets: number[] = [0];
  const blockPages: Array<[number, number]> = [];
  let filled = 0; // 当前页窗口顶部（内容坐标）
  let fillTo = 0; // 当前页最后一块的底部
  let page = 0; // 当前页下标
  for (let i = 0; i < tops.length; i++) {
    const top = tops[i];
    const bottom = bottoms[i];
    if (bottom - filled < capacity - BOTTOM_SLACK_PX && top >= filled) {
      // 放得下且不贴页尾：留在当前页（开源 case 2）
      blockPages.push([page, page]);
      if (bottom > fillTo) fillTo = bottom;
      continue;
    }
    // 放不下 / 贴近页尾 / 跨越页底：整块推至下一页，永不在块中间断开
    // （开源 case 1/3）
    let next = fillTo > filled ? fillTo : filled;
    // 前有整页级空白：新页直接以块起点开始（开源 case 4）
    if (top - next > capacity + 0.5) next = top;
    if (next > filled) {
      offsets.push(next);
      filled = next;
      page += 1;
    }
    fillTo = filled;
    const from = page;
    // 块自身超过一整页：按整页逐页铺开，剩余部分留在当前页继续
    while (bottom - filled > capacity + 0.5) {
      filled += capacity;
      offsets.push(filled);
      page += 1;
    }
    blockPages.push([from, page]);
    if (bottom > fillTo) fillTo = bottom;
  }
  // 每次换页时新页起点均已入队（首页起点 0 初始化即入队），
  // 故循环结束后 offsets 已包含全部页起点，无需再补
  return { offsets, blockPages };
}

export function ResumePreview() {
  const { markdown } = useEditor();
  const { currentTemplate, themeConfig, themeReady, scale, setScale } = usePreview();
  const { photos, setPhotos } = usePhotoSync();

  const templateId = currentTemplate?.id || 'classic';
  const css = getTemplateCss(templateId);
  const fs = fontScale(themeConfig);
  const sp = spacingScale(themeConfig);
  const normalizedMarkdown = useMemo(() => normalizeColMarkers(markdown), [markdown]);

  // 图标渲染：内置图标 + 主题里的自定义图标，Markdown 中以 `icon:名称` 引用
  const iconMap = useMemo(
    () => getIconMap(themeConfig.customIcons),
    [themeConfig.customIcons],
  );
  const remarkPlugins = useMemo(
    () => [remarkGfm, remarkResumeCols, remarkResumeIcons(iconMap)],
    [iconMap],
  );
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

  // 每页四周总留白 = 页边距 + 内容边距（mm）：
  // 预览作为每页纸张的 padding，导出作为 Playwright 页边距，两者数值一致、逐页生效
  const marginXMM = MARGIN_MM[themeConfig.marginX] ?? 0;
  const marginYMM = MARGIN_MM[themeConfig.marginY] ?? 0;
  const contentPadMM = CONTENT_PADDING_MM[themeConfig.contentPadding ?? DEFAULT_CONTENT_PADDING] ?? 0;
  const padXMM = marginXMM + contentPadMM;
  const padYMM = marginYMM + contentPadMM;
  const contentWMM = A4_WIDTH_MM - 2 * padXMM;
  // 每页内容窗口高度 = 纸高 - 上下总留白，分页贪心装页的容量上限
  const windowMM = A4_HEIGHT_MM - 2 * padYMM;
  const windowPx = windowMM * MM_TO_PX;

  // 隐藏排版源：以页面内容宽度真实排版一次，
  // 供分页测量与逐页克隆复用同一布局（保证各页渲染与测量同源）
  const sourceRef = useRef<HTMLDivElement>(null);
  // contentHeight 仅作为"布局变化"信号（图片/字体加载等）触发重新分页
  const [contentHeight, setContentHeight] = useState(0);
  const [contentHtml, setContentHtml] = useState('');
  const [pages, setPages] = useState<Pagination>({ offsets: [0], blockPages: [] });

  useEffect(() => {
    const el = sourceRef.current;
    if (!el) return;
    const update = () => setContentHeight(el.scrollHeight);
    update();
    // jsdom 等测试环境无 ResizeObserver，跳过监听（scrollHeight 恒为 0，仅渲染单页）
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [themeReady]);

  // 内容渲染完成后提取 HTML 作为版本标记；每次 markdown 变化重新提取
  useLayoutEffect(() => {
    const el = sourceRef.current;
    if (el) setContentHtml(el.innerHTML);
  }, [normalizedMarkdown, themeReady]);

  // 分页测量：排版源渲染完成后收集块并整块贪心装页。
  // getBoundingClientRect 受父级 transform 缩放影响，除以缩放系数换算回布局 px
  useLayoutEffect(() => {
    const el = sourceRef.current;
    if (!el) return;
    const rootRect = el.getBoundingClientRect();
    const s = rootRect.width / el.offsetWidth || 1;
    const blocks = el.children.length > 0 ? collectBlocks(el) : [];
    const tops = blocks.map((b) => (b.getBoundingClientRect().top - rootRect.top) / s);
    const bottoms = blocks.map((b) => (b.getBoundingClientRect().bottom - rootRect.top) / s);
    setPages(paginate(tops, bottoms, rootRect.height / s, windowPx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentHtml, contentHeight, windowPx, themeReady]);

  // 逐页渲染：每页克隆整份内容上移裁切；不属于本页的块透明抹除，
  // 防止相邻页的块探入本页可视区（开源实现通过绝对定位重排天然避免）
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  useEffect(() => {
    const source = sourceRef.current;
    if (!source) return;
    pages.offsets.forEach((offset, k) => {
      const host = pageRefs.current[k];
      if (!host) return;
      host.textContent = '';
      if (!contentHtml) return;
      const clone = source.cloneNode(true) as HTMLElement;
      clone.classList.remove('resume-export-source');
      clone.style.position = 'absolute';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.margin = '0';
      clone.style.transform = `translateY(${-offset}px)`;
      host.appendChild(clone);
      const needsHide = pages.blockPages.some(([f, t]) => k < f || k > t);
      if (!needsHide) return;
      const blocks = collectBlocks(clone);
      pages.blockPages.forEach(([f, t], i) => {
        if (k >= f && k <= t) return;
        const b = blocks[i] as HTMLElement | undefined;
        if (!b) return;
        // LI 额外去掉列表标记（标记渲染在盒外，透明块无法覆盖）
        if (b.tagName === 'LI') b.style.listStyle = 'none';
        b.style.opacity = '0';
      });
    });
  }, [pages, contentHtml]);

  // 照片：选中/更新/删除，同步预览状态并随自动保存落库
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const updatePhoto = (id: string, patch: Partial<{ x: number; y: number; width: number }>) => {
    setPhotos(photos.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const deletePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
    setSelectedPhotoId(null);
  };

  // 初始缩放自适应：纸张（794px = 210mm@96dpi）超出可视宽度时缩小到刚好放下（参考 MujiCV）
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!themeReady) return;
    const el = scrollRef.current;
    if (!el) return;
    const fit = ((el.clientWidth - 160) / (A4_WIDTH_MM * MM_TO_PX)) * 100;
    if (fit < 100) setScale(Math.max(40, Math.round(fit)));
    // 仅首次就绪时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeReady]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <PreviewToolbar />
      <div className="relative flex flex-1 min-h-0">
        {themeReady ? (
          <>
            <div ref={scrollRef} className="flex-1 min-w-0 overflow-auto p-4 px-20 bg-gray-50">
              <div
                className="w-fit mx-auto"
                style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top center' }}
              >
                {/* 隐藏排版源：屏外以真实宽度排版；内含模板/主题样式，
                    导出时整体取 innerHTML（样式 + 内容），保证与预览完全同源 */}
                <div
                  className="resume-export-root"
                  aria-hidden="true"
                  style={{ position: 'absolute', left: -99999, top: 0, visibility: 'hidden', pointerEvents: 'none' }}
                >
                  <style>{css}</style>
                  <style>{`
                    .resume-preview {
                      --resume-primary: ${themeConfig.primaryColor};
                      font-family: ${themeConfig.fontFamily};
                      --resume-fs: ${fs};
                      --resume-sp: ${sp};
                      ${elementFontSizeVars(themeConfig)};
                    }
                    ${resumeColsCss()}
                    ${resumeIconsCss()}
                    ${resumeQuoteCss()}
                    ${resumeFontSizeCss()}
                  `}</style>
                  <div
                    ref={sourceRef}
                    className="resume-preview resume-export-source bg-white"
                    style={{ width: `${contentWMM}mm`, display: 'flow-root' }}
                  >
                    <ReactMarkdown
                      remarkPlugins={remarkPlugins}
                      rehypePlugins={[rehypeWrapH2Text]}
                      components={markdownComponents}
                    >
                      {normalizedMarkdown}
                    </ReactMarkdown>
                  </div>
                </div>
                {/* 分页预览：每页 = 一张 A4 纸，四周 padding = 页边距 + 内容边距。
                    内容为排版源的完整克隆，按开源整块贪心分页结果上移裁切，
                    只在块边界断页，跨页块自然续排（移植 MujiCV 分页引擎） */}
                <div className="flex flex-col items-center gap-5">
                  {pages.offsets.map((_p, k) => (
                    <div
                      key={k}
                      data-resume-page
                      className="resume-preview bg-white relative"
                      style={{
                        width: `${A4_WIDTH_MM}mm`,
                        height: `${A4_HEIGHT_MM}mm`,
                        padding: `${padYMM}mm ${padXMM}mm`,
                        boxShadow:
                          '0 0 1px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08), 0 12px 28px -12px rgba(0,0,0,0.12)',
                      }}
                      onPointerDown={(e) => {
                        // 点击照片以外区域取消选中
                        if (!(e.target as HTMLElement).closest('.resume-photo')) setSelectedPhotoId(null);
                      }}
                    >
                      <div
                        ref={(el) => {
                          pageRefs.current[k] = el;
                        }}
                        style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
                      />
                      <ResumePhotos
                        photos={photos.filter((p) => p.page === k + 1)}
                        selectedId={selectedPhotoId}
                        onSelect={setSelectedPhotoId}
                        onUpdate={updatePhoto}
                        onDelete={deletePhoto}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* 主题设置侧边栏：打开时占据预览窗口右侧 */}
            <ThemeConfigPanel />
          </>
        ) : (
          <PreviewSkeleton />
        )}
      </div>
    </div>
  );
}

/** 预览加载骨架屏：A4 纸形态的脉冲占位 */
function PreviewSkeleton() {
  return (
    <div
      className="flex-1 min-w-0 overflow-auto p-4 bg-gray-50 flex justify-center"
      aria-hidden="true"
    >
      <div className="w-[210mm] max-w-full h-fit min-h-[297mm] bg-white shadow-lg rounded-lg p-10 animate-pulse">
        <div className="h-9 w-2/5 rounded bg-gray-200 mb-3" />
        <div className="h-3.5 w-1/4 rounded bg-gray-100 mb-9" />
        <div className="h-4 w-1/3 rounded bg-gray-200 mb-3" />
        <div className="space-y-2.5 mb-9">
          {[96, 88, 92, 70].map((w, i) => (
            <div key={i} className="h-3 rounded bg-gray-100" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="h-4 w-1/3 rounded bg-gray-200 mb-3" />
        <div className="space-y-2.5 mb-9">
          {[90, 94, 62].map((w, i) => (
            <div key={i} className="h-3 rounded bg-gray-100" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="h-4 w-1/4 rounded bg-gray-200 mb-3" />
        <div className="space-y-2.5">
          {[92, 85, 76].map((w, i) => (
            <div key={i} className="h-3 rounded bg-gray-100" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
