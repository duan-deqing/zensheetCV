import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { ResumePhoto } from '@stylan/shared-types';
import { HoverTip } from '@/components/HoverTip';

/** 照片宽度范围（相对页宽百分比） */
const MIN_WIDTH_PCT = 4;
const MAX_WIDTH_PCT = 100;

interface ResumePhotosProps {
  photos: ResumePhoto[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** 提交一次照片变更（拖动/缩放结束时调用） */
  onUpdate: (id: string, patch: Partial<Omit<ResumePhoto, 'id' | 'src'>>) => void;
  onDelete: (id: string) => void;
}

interface DragState {
  id: string;
  mode: 'move' | 'resize';
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origWidth: number;
  pageRect: DOMRect;
}

/** 页面照片图层：渲染某页上的照片，支持选中后拖动改位、
 *  右下角手柄等比缩放（height:auto 天然锁比例）、× 删除 */
export function ResumePhotos({ photos, selectedId, onSelect, onUpdate, onDelete }: ResumePhotosProps) {
  // 拖动/缩放过程中的临时坐标：本地渲染即时反馈，pointerup 才提交持久化
  const [transient, setTransient] = useState<{ id: string; x: number; y: number; width: number } | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const startDrag = (e: ReactPointerEvent, photo: ResumePhoto, mode: 'move' | 'resize') => {
    e.stopPropagation();
    e.preventDefault();
    const pageEl = (e.currentTarget as HTMLElement).closest('[data-resume-page]');
    if (!(pageEl instanceof HTMLElement)) return;
    onSelect(photo.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      id: photo.id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origX: photo.x,
      origY: photo.y,
      origWidth: photo.width,
      pageRect: pageEl.getBoundingClientRect(),
    };
    setTransient({ id: photo.id, x: photo.x, y: photo.y, width: photo.width });
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dxPct = ((e.clientX - d.startX) / d.pageRect.width) * 100;
    const dyPct = ((e.clientY - d.startY) / d.pageRect.height) * 100;
    if (d.mode === 'move') {
      // 左上角限制在页面内（照片可溢出右边/底边，保持摆放自由度）
      setTransient({
        id: d.id,
        x: Math.min(Math.max(d.origX + dxPct, 0), 100),
        y: Math.min(Math.max(d.origY + dyPct, 0), 100),
        width: d.origWidth,
      });
    } else {
      // 等比缩放：仅改宽度，高度由 height:auto 跟随原始比例
      const startPx = (d.origWidth / 100) * d.pageRect.width;
      const wPct = Math.min(Math.max(((startPx + (e.clientX - d.startX)) / d.pageRect.width) * 100, MIN_WIDTH_PCT), MAX_WIDTH_PCT);
      setTransient({ id: d.id, x: d.origX, y: d.origY, width: wPct });
    }
  };

  const endDrag = () => {
    const d = dragRef.current;
    if (d && transient && transient.id === d.id) {
      onUpdate(d.id, { x: transient.x, y: transient.y, width: transient.width });
    }
    dragRef.current = null;
    setTransient(null);
  };

  if (photos.length === 0) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {photos.map((p) => {
        const t = transient && transient.id === p.id ? transient : null;
        const x = t ? t.x : p.x;
        const y = t ? t.y : p.y;
        const width = t ? t.width : p.width;
        const selected = selectedId === p.id;
        return (
          <div
            key={p.id}
            className={`absolute pointer-events-auto resume-photo ${selected ? 'cursor-move' : 'cursor-pointer'}`}
            style={{ left: `${x}%`, top: `${y}%`, width: `${width}%`, touchAction: 'none' }}
            onPointerDown={(e) => startDrag(e, p, 'move')}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={p.src}
              alt=""
              draggable={false}
              /* height:auto —— 宽度变化时高度始终跟随图片原始宽高比 */
              className="block w-full h-auto select-none"
              style={
                selected
                  ? { outline: '2px solid var(--resume-primary, #2563eb)', outlineOffset: 1 }
                  : undefined
              }
            />
            {selected && (
              <>
                {/* 右下角等比缩放手柄 */}
                <span
                  className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-white border-2 rounded-full cursor-nwse-resize"
                  style={{ borderColor: 'var(--resume-primary, #2563eb)', touchAction: 'none' }}
                  onPointerDown={(e) => startDrag(e, p, 'resize')}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                />
                {/* 删除按钮 */}
                <HoverTip text="删除照片">
                  <button
                    className="absolute -top-2.5 -right-2.5 w-5 h-5 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-[11px] leading-none rounded-full shadow-sm cursor-pointer"
                    aria-label="删除照片"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(p.id);
                    }}
                  >
                    ✕
                  </button>
                </HoverTip>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
