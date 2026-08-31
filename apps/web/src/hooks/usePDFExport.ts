import { useCallback, useState } from 'react';
import { apiClient } from '@/api/client';
import { useResumeStore } from '@/store/ResumeContext';

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentResume } = useResumeStore();

  const exportPDF = useCallback(async (html: string, css: string, marginXMM = 0, marginYMM = 0) => {
    if (!currentResume) {
      setError('No resume selected');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const { data } = await apiClient.post('/pdf/generate', {
        resume_id: currentResume.id,
        html,
        css,
        margin_x_mm: marginXMM,
        margin_y_mm: marginYMM,
      });

      // download_url 为 /api/v1/pdf/download/...，apiClient 的 baseURL 已含 /api/v1，需去掉前缀
      const downloadPath = String(data.download_url).replace(/^\/api\/v1/, '');
      const response = await apiClient.get(downloadPath, { responseType: 'blob' });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentResume.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err: any) {
      setError(err.message || 'PDF export failed');
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [currentResume]);

  return { exportPDF, isExporting, error };
}
