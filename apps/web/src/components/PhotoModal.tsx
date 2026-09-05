import { useEffect, useRef, useState } from 'react';
import { useUI } from '@/store/UIContext';
import { usePhotoSync } from '@/hooks/usePhotoSync';
import { useModalClose } from '@/hooks/useModalClose';
import { HoverTip } from '@/components/HoverTip';
import { useTr } from '@/i18n/LangContext';

/** 证件照尺寸（一寸 295×413，宽高比 ≈ 0.714），框与裁切均按此比例 */
const ID_PHOTO_W = 295;
const ID_PHOTO_H = 413;
/** 照片在页面上的默认宽度（相对页宽百分比） */
const PAGE_WIDTH_PCT = 24;

/** 将上传图片按 object-cover 方式居中裁切为证件照比例，输出 jpeg data URL
 *  （白底填充透明区域；同时统一比例，使页面上的照片与弹窗预览一致） */
function cropToIdPhoto(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = ID_PHOTO_W;
      canvas.height = ID_PHOTO_H;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas unavailable'));
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, ID_PHOTO_W, ID_PHOTO_H);
      const scale = Math.max(ID_PHOTO_W / img.naturalWidth, ID_PHOTO_H / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (ID_PHOTO_W - w) / 2, (ID_PHOTO_H - h) / 2, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}

/** 照片上传弹窗：证件照比例框 + 上传按钮 → 预览 → 确定/取消。
 *  确定后裁切为证件照比例并放到预览第 1 页右上角（可在页面上继续拖动/缩放） */
export function PhotoModal() {
  const { photoModalOpen, togglePhotoModal, addToast } = useUI();
  const { photos, setPhotos } = usePhotoSync();
  const tr = useTr();
  const [src, setSrc] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 每次打开时重置上次的预览图
  useEffect(() => {
    if (photoModalOpen) setSrc(null);
  }, [photoModalOpen]);

  // 统一关闭流程：淡出动画结束后再卸载并重置预览图
  const { closing, close } = useModalClose(photoModalOpen, () => {
    setSrc(null);
    togglePhotoModal();
  });

  if (!photoModalOpen) return null;

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) {
      addToast(tr({ zh: '请选择图片文件', en: 'Please choose an image file' }), 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSrc(String(reader.result));
    reader.onerror = () => addToast(tr({ zh: '图片读取失败', en: 'Failed to read image' }), 'error');
    reader.readAsDataURL(file);
  };

  const confirm = async () => {
    if (!src) return;
    setConfirming(true);
    try {
      const cropped = await cropToIdPhoto(src);
      const photo = {
        id: `ph_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        src: cropped,
        page: 1,
        x: 100 - PAGE_WIDTH_PCT - 3,
        y: 3,
        width: PAGE_WIDTH_PCT,
      };
      // 走 usePhotoSync 同步预览与落库两份状态
      setPhotos([...photos, photo]);
      addToast(tr({ zh: '照片已添加，可在页面上拖动与缩放', en: 'Photo added — drag and resize it on the page' }), 'success');
      close();
    } catch {
      addToast(tr({ zh: '照片处理失败', en: 'Failed to process photo' }), 'error');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label={tr({ zh: '上传照片', en: 'Upload Photo' })}>
      {/* 遮罩：背景变灰聚焦，点击取消 */}
      <div className={`${closing ? 'modal-backdrop-out' : 'ph-backdrop-in'} absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]`} onClick={close} aria-hidden="true" />
      <div className={`${closing ? 'modal-out' : 'ph-modal-in'} relative flex flex-col items-center bg-white border border-gray-200 rounded-2xl shadow-xl px-6 pt-5 pb-6`}>
        {/* 头部 */}
        <div className="w-full flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600">{'// PHOTO'}</p>
          <HoverTip text={tr({ zh: '关闭', en: 'Close' })}>
            <button
              onClick={close}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
              aria-label={tr({ zh: '关闭', en: 'Close' })}
            >
              ✕
            </button>
          </HoverTip>
        </div>

        {/* 证件照比例框：未上传时中间为上传按钮，上传后预览（居中裁切） */}
        <div
          className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center"
          style={{ width: 216, height: 216 * (ID_PHOTO_H / ID_PHOTO_W) }}
        >
          {src ? (
            <button
              className="w-full h-full cursor-pointer group relative"
              onClick={() => fileRef.current?.click()}
              aria-label={tr({ zh: '点击重新选择图片', en: 'Click to choose another image' })}
            >
              <img src={src} alt={tr({ zh: '照片预览', en: 'Photo preview' })} className="w-full h-full object-cover" draggable={false} />
              <span className="absolute inset-x-0 bottom-0 py-1 text-[11px] text-white bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity">
                {tr({ zh: '点击重新选择', en: 'Click to change' })}
              </span>
            </button>
          ) : (
            <button
              className="flex flex-col items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M17 8l-5-5-5 5" />
                <path d="M12 3v12" />
              </svg>
              <span className="text-[13px] font-medium">{tr({ zh: '上传照片', en: 'Upload Photo' })}</span>
              <span className="text-[11px] text-gray-400">{tr({ zh: '一寸比例 295 × 413', en: '1-inch ratio 295 × 413' })}</span>
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = ''; // 允许重复选择同一文件
          }}
        />

        {/* 底部操作：取消 / 确定 */}
        <div className="w-full flex items-center justify-end gap-2 mt-5">
          <button
            onClick={close}
            className="h-8 px-4 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 text-[13px] font-medium transition-colors"
          >
            {tr({ zh: '取消', en: 'Cancel' })}
          </button>
          <button
            onClick={confirm}
            disabled={!src || confirming}
            className="h-8 px-4 rounded-md bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[13px] font-medium transition-colors"
          >
            {confirming ? tr({ zh: '处理中…', en: 'Processing…' }) : tr({ zh: '确定', en: 'Confirm' })}
          </button>
        </div>
      </div>
    </div>
  );
}
