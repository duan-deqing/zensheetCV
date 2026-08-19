import { useCallback, useState } from 'react';
import { apiClient } from '@/api/client';
import { useResumeStore } from '@/store/ResumeContext';

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentResume } = useResumeStore();

  const exportPDF = useCallback(async (html: string, css: string) => {
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
      });

      const response = await apiClient.get(data.download_url, { responseType: 'blob' });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentResume.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'PDF export failed');
    } finally {
      setIsExporting(false);
    }
  }, [currentResume]);

  return { exportPDF, isExporting, error };
}
