/**
 * TemplateGallery —— 「多套模板，同一份内容」展示区。
 * 8 套模板用与编辑器完全相同的真实渲染管线（MiniResume：react-markdown + 模板真实 CSS）
 * 直接挂载进水平铺开的画廊轨道，不做任何截图——模板即真实 DOM，
 * 主题色/字体/图标全部实时渲染，也无需任何降级兜底；同屏可同时看到多套模板。
 * 交互：滚轮/拖拽循环浏览（rAF lerp 缓动），完全滚出容器的卡片隐藏裁切。
 * 进入视口附近才挂载（IntersectionObserver），避免 8 份简历渲染挤占首屏。
 */
import { useEffect, useRef, useState } from 'react';
import { useTr } from '@/i18n/LangContext';
import { ResumePaper } from './MiniResume';
import { TEMPLATE_SHOWCASE } from './content';

/** 卡片显示宽度（px）；内容按 A4 自然宽度排版后等比缩放，保证与真实页面同版式 */
const CARD_W = 340;
/** A4 @96dpi 的自然尺寸（px） */
const BASE_W = 794;
const BASE_H = 1123;
const CARD_H = Math.round(BASE_H * (CARD_W / BASE_W)); // ≈ 481
/** 相邻卡片间距（px）：卡片等距水平铺开 */
const GAP = 24;
const SPACING = CARD_W + GAP;

export default function TemplateGallery() {
  const tr = useTr();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  // 进入视口附近才挂载真实渲染的 8 份简历（一次性）
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) return;
    const el = rootRef.current;
    if (!el) return;
    // 无 IntersectionObserver 的环境（jsdom/极老浏览器）直接挂载，保证内容始终可见
    if (typeof IntersectionObserver === 'undefined') {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active]);

  // 画廊滚动：滚轮/拖拽累加目标位置，rAF 逐帧 lerp 后水平摆放每张卡片（无限循环）
  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const n = TEMPLATE_SHOWCASE.length;
    const step = 1 / n; // 相邻卡片的圈比例
    const LOOP_PX = n * SPACING; // 一整圈对应的像素距离（拖拽按 1:1 映射）
    let target = 0; // 目标滚动量（1 = 一整圈）
    let current = 0; // 当前滚动量（向 target 缓动）
    let raf = 0;
    let dragging = false;
    let lastX = 0;

    const layout = () => {
      current += (target - current) * 0.08;
      // 完全滚出容器（含半张卡片缓冲）的卡片隐藏，不参与绘制
      const limit = root.clientWidth / 2 + SPACING / 2;
      const cards = track.children;
      for (let i = 0; i < n; i++) {
        const el = cards[i] as HTMLElement;
        // 圈比例归一化到 [-0.5, 0.5)，换算成相对容器中心的水平偏移（实现无限循环）
        let a = (i * step + current) % 1;
        if (a > 0.5) a -= 1;
        else if (a < -0.5) a += 1;
        const x = a * LOOP_PX; // 相邻卡片间距 = LOOP_PX/n = SPACING（340px 卡片 + 24px 间距）
        if (Math.abs(x) > limit) {
          el.style.visibility = 'hidden';
          continue;
        }
        el.style.visibility = 'visible';
        el.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      }
      raf = requestAnimationFrame(layout);
    };
    raf = requestAnimationFrame(layout);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      target -= (e.deltaY + e.deltaX) * 0.00125; // 每格滚轮 ≈ 前进一张卡片
    };
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      root.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      target += (e.clientX - lastX) / LOOP_PX; // 拖拽 1:1 跟手
      lastX = e.clientX;
    };
    const endDrag = () => {
      dragging = false;
    };
    root.addEventListener('wheel', onWheel, { passive: false });
    root.addEventListener('pointerdown', onPointerDown);
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerup', endDrag);
    root.addEventListener('pointercancel', endDrag);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('wheel', onWheel);
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerup', endDrag);
      root.removeEventListener('pointercancel', endDrag);
    };
  }, [active]);

  // 未进入视口附近：占位骨架（真实简历尚未挂载）
  if (!active) {
    return (
      <div
        ref={rootRef}
        className="h-[560px] rounded-2xl border border-gray-200 bg-gray-50/60 flex items-center justify-center"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-400 animate-pulse">
          {tr({ zh: '滚动到此处加载模板展示', en: 'Scroll here to load the showcase' })}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative h-[560px] select-none cursor-grab active:cursor-grabbing overflow-hidden"
      style={{ touchAction: 'pan-y' }}
    >
      {/* 水平轨道：卡片以 left-1/2 为居中锚点，由 rAF 逐帧 translate3d 摆位 */}
      <div ref={trackRef} className="absolute inset-0">
        {TEMPLATE_SHOWCASE.map((t) => (
          <div
            key={t.id}
            className="absolute left-1/2 top-6 will-change-transform"
            style={{ width: CARD_W, marginLeft: -CARD_W / 2 }}
          >
            <div
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl shadow-gray-900/10"
              style={{ width: CARD_W, height: CARD_H }}
            >
              {/* 真实渲染：与编辑器同一条管线，按 A4 自然宽度排版后等比缩放 */}
              <ResumePaper templateId={t.id} zoom={CARD_W / BASE_W} />
            </div>
            <p className="mt-3 text-center text-sm font-medium text-gray-600">{tr(t.name)}</p>
          </div>
        ))}
      </div>
      {/* 两端渐隐遮罩：卡片循环滚出视口时柔和淡出 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
