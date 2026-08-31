import { useRef, useState } from 'react';

const BOX = 320; // 预览区边长（px）
const CIRCLE = 240; // 裁剪圆直径（px）
const OUT = 256; // 导出头像边长（px）
const MAX_ZOOM = 3;

interface CropDims {
  w: number;
  h: number;
}

/** 头像裁剪弹窗：拖动平移 + 滑杆缩放，圆形区域实时预览；
 *  确定后将圆内区域导出为 OUT×OUT PNG，由外部负责上传 */
export function AvatarCropModal({
  src,
  onCancel,
  onConfirm,
}: {
  src: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => Promise<void>;
}) {
  const [dims, setDims] = useState<CropDims | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  // 注意：不在此处 revoke object URL —— StrictMode 下 effect 会先执行一次清理，
  // 导致图片加载失败；URL 由父组件在关闭/上传成功时统一回收

  const baseScale = dims ? Math.max(BOX / dims.w, BOX / dims.h) : 1;
  const ts = baseScale * zoom;

  // 平移范围限制：图片必须始终盖住裁剪圆
  const clampOffset = (x: number, y: number, nextTs: number) => {
    if (!dims) return { x, y };
    const limitX = Math.max(0, (dims.w * nextTs) / 2 - CIRCLE / 2);
    const limitY = Math.max(0, (dims.h * nextTs) / 2 - CIRCLE / 2);
    return {
      x: Math.min(limitX, Math.max(-limitX, x)),
      y: Math.min(limitY, Math.max(-limitY, y)),
    };
  };

  const handleZoom = (z: number) => {
    const next = Math.min(MAX_ZOOM, Math.max(1, z));
    setZoom(next);
    setOffset((o) => clampOffset(o.x, o.y, baseScale * next));
  };

  const handleConfirm = async () => {
    const img = imgRef.current;
    if (!img || !dims || uploading) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // 预览坐标 → 图片源坐标：导出裁剪圆的外接正方形区域
    const drawX = BOX / 2 - (dims.w * ts) / 2 + offset.x;
    const drawY = BOX / 2 - (dims.h * ts) / 2 + offset.y;
    const sx = ((BOX - CIRCLE) / 2 - drawX) / ts;
    const sy = ((BOX - CIRCLE) / 2 - drawY) / ts;
    const sw = CIRCLE / ts;
    ctx.drawImage(img, sx, sy, sw, sw, 0, 0, OUT, OUT);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );
    if (!blob) {
      setError('导出图片失败，请重试');
      return;
    }
    setUploading(true);
    setError('');
    try {
      await onConfirm(blob);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(detail ? String(detail) : '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="调整头像">
      <style>{`
        @keyframes avatarModalIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .avatar-modal-in { animation: avatarModalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) { .avatar-modal-in { animation: none; } }
      `}</style>
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px]" onClick={uploading ? undefined : onCancel} aria-hidden="true" />
      <div className="avatar-modal-in relative w-[400px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        {/* 顶栏：与其他弹窗同构 */}
        <div className="flex items-center gap-3 px-5 py-2 border-b border-gray-200">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0" aria-hidden="true">
            {'< AVATAR />'}
          </p>
          <h3 className="text-sm font-semibold text-gray-900">调整头像</h3>
          <button
            onClick={onCancel}
            disabled={uploading}
            className="ml-auto w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm disabled:opacity-50"
            aria-label="关闭头像裁剪"
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col items-center">
          {/* 裁剪预览区：拖动平移 */}
          <div
            className="relative overflow-hidden rounded-lg bg-gray-900 cursor-grab active:cursor-grabbing touch-none"
            style={{ width: BOX, height: BOX }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dragRef.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
            }}
            onPointerMove={(e) => {
              if (!dragRef.current) return;
              const { px, py, ox, oy } = dragRef.current;
              setOffset(clampOffset(ox + (e.clientX - px), oy + (e.clientY - py), ts));
            }}
            onPointerUp={() => (dragRef.current = null)}
            onPointerCancel={() => (dragRef.current = null)}
          >
            <img
              ref={imgRef}
              src={src}
              alt="待裁剪头像"
              draggable={false}
              onLoad={(e) => {
                const el = e.currentTarget;
                setDims({ w: el.naturalWidth, h: el.naturalHeight });
              }}
              onError={() => setError('图片加载失败，请取消后重新选择')}
              className="absolute select-none"
              style={
                dims
                  ? {
                      left: BOX / 2 - (dims.w * ts) / 2 + offset.x,
                      top: BOX / 2 - (dims.h * ts) / 2 + offset.y,
                      width: dims.w * ts,
                      height: dims.h * ts,
                      maxWidth: 'none',
                      pointerEvents: 'none',
                    }
                  : { maxWidth: 'none', visibility: 'hidden' }
              }
            />
            {/* 圆形裁剪范围：圆外压暗 */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute rounded-full border-2 border-white/90"
                style={{
                  left: (BOX - CIRCLE) / 2,
                  top: (BOX - CIRCLE) / 2,
                  width: CIRCLE,
                  height: CIRCLE,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                }}
              />
            </div>
          </div>

          {/* 缩放滑杆 */}
          <div className="mt-4 w-[320px] flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 shrink-0">
              缩放
            </span>
            <input
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(e) => handleZoom(Number(e.target.value))}
              aria-label="缩放头像"
              className="flex-1 accent-primary-600"
            />
            <span className="font-mono text-[11px] text-gray-500 w-8 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          <p className="mt-2 text-[12px] text-gray-400">拖动调整位置 · 滑杆调整缩放 · 圆形区域为最终头像</p>

          {error && (
            <p className="mt-2 text-[12px] text-red-500" role="alert">
              {error}
            </p>
          )}

          <div className="mt-4 w-full flex gap-2">
            <button
              onClick={onCancel}
              disabled={uploading}
              className="flex-1 h-9 rounded-lg border border-gray-300 text-[13px] font-medium text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={uploading || !dims}
              className="flex-1 h-9 rounded-lg bg-primary-600 text-white text-[13px] font-medium hover:bg-primary-700 disabled:opacity-70 transition-colors"
            >
              {uploading ? '上传中…' : '确定'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
