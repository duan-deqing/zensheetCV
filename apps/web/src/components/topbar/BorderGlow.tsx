import { useCallback, useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type PointerEvent } from 'react';

/**
 * BorderGlowButton —— React Bits <BorderGlow /> 的按钮化移植（TS）。
 * 三色渐变辉光：指针靠近按钮边缘时点亮跟随光标的亮弧（conic 角向遮罩 ∩ 圆环遮罩，仅沿按钮边缘）
 * + 按钮内侧柔光；首次挂载播放一次 Intro 扫光（Animated intro）；
 * glowActive（AI 窗口打开）时常亮慢速旋转。辉光不超出按钮边界；样式见 animations.css。
 */

/** 辉光默认三色：紫 → 粉 → 天蓝（120deg 渐变沿亮弧取样，移动光标可见色彩流动） */
const DEFAULT_GLOW_COLORS = ['#c084fc', '#f472b6', '#38bdf8'];

/** Intro 扫光时长（ms），与 animations.css 的 sweep-intro 动画时长保持一致 */
const SWEEP_MS = 1200;

type BorderGlowProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 辉光渐变色组（建议 2 色以上） */
  glowColors?: string[];
  /** 光向锥形遮罩宽度（%），决定亮弧的长度 */
  coneSpread?: number;
  /** 触发辉光的贴边灵敏度（0-100，越小越容易触发） */
  edgeSensitivity?: number;
  /** 常亮标记：AI 窗口打开时常亮并缓慢旋转光向 */
  glowActive?: boolean;
  /** 首次挂载播放一次 Intro 扫光（默认开） */
  introSweep?: boolean;
};

export function BorderGlowButton({
  glowColors = DEFAULT_GLOW_COLORS,
  coneSpread = 25,
  edgeSensitivity = 20,
  glowActive = false,
  introSweep = true,
  className = '',
  children,
  ...rest
}: BorderGlowProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [sweeping, setSweeping] = useState(introSweep && !glowActive);

  // Animated intro：挂载后扫光一圈，到时摘除标记交回悬停 / 常亮状态
  useEffect(() => {
    if (!sweeping) return;
    const timer = setTimeout(() => setSweeping(false), SWEEP_MS);
    return () => clearTimeout(timer);
  }, [sweeping]);

  // 指针相对按钮中心：贴边程度（0-1）→ --edge-proximity；方位角 → --cursor-angle（亮弧转向光标）
  const handlePointerMove = useCallback((e: PointerEvent<HTMLButtonElement>) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = rect.width / 2 / Math.abs(dx);
    if (dy !== 0) ky = rect.height / 2 / Math.abs(dy);
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    let angle = 45;
    if (dx !== 0 || dy !== 0) {
      angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;
    }
    card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
  }, []);

  const style = {
    '--glow-gradient': `linear-gradient(120deg, ${glowColors.join(', ')})`,
    '--edge-sensitivity': edgeSensitivity,
    '--cone-spread': coneSpread,
  } as CSSProperties;

  return (
    <button
      ref={ref}
      type="button"
      onPointerMove={handlePointerMove}
      className={`border-glow-btn ${glowActive ? 'glow-active' : sweeping ? 'sweep-intro' : ''} ${className}`}
      style={style}
      {...rest}
    >
      {/* 内侧柔光层（不拦截点击，不超出按钮）；亮弧描边为按钮自身 ::before，见 animations.css */}
      <span className="edge-light" aria-hidden="true" />
      {children}
    </button>
  );
}
