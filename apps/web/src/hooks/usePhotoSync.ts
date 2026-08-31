import { useCallback } from 'react';
import { usePreview } from '@/store/PreviewContext';
import { useResumeStore } from '@/store/ResumeContext';
import type { ResumePhoto } from '@stylan/shared-types';

/** 照片更新统一入口：必须同时同步两份状态 ——
 *  PreviewContext.themeConfig（驱动预览渲染）与 ResumeContext（落库/自动保存）。
 *  只调 ResumeContext.updateTheme 会导致照片已保存但预览不显示 */
export function usePhotoSync() {
  const { themeConfig, setThemeConfig } = usePreview();
  const { updateTheme } = useResumeStore();

  const setPhotos = useCallback(
    (photos: ResumePhoto[]) => {
      setThemeConfig({ ...themeConfig, photos });
      updateTheme({ photos });
    },
    [themeConfig, setThemeConfig, updateTheme],
  );

  return { photos: themeConfig.photos ?? [], setPhotos };
}
