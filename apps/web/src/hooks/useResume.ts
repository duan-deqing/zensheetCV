import { useCallback } from 'react';
import { apiClient } from '@/api/client';
import { useResumeStore } from '@/store/ResumeContext';
import type { ResumeCreate, ResumeUpdate, Resume } from '@stylan/shared-types';

export function useResume() {
  const { setCurrentResume, setResumes, setLoading, setError } = useResumeStore();

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/resumes');
      setResumes(data.items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  }, [setResumes, setLoading, setError]);

  const fetchResume = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get(`/resumes/${id}`);
      setCurrentResume(data);
      return data as Resume;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resume');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setCurrentResume, setLoading, setError]);

  const createResume = useCallback(async (data: ResumeCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/resumes', data);
      setCurrentResume(response.data);
      return response.data as Resume;
    } catch (err: any) {
      setError(err.message || 'Failed to create resume');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setCurrentResume, setLoading, setError]);

  /** 复制一份简历（内容 / 模板 / 主题原样拷贝），名称追加「副本」 */
  const copyResume = useCallback(async (resume: Resume) => {
    return createResume({
      title: `${resume.title} 副本`,
      markdown: resume.markdown ?? '',
      template_id: resume.template_id,
      theme_config: (resume.theme_config || undefined) as ResumeCreate['theme_config'],
    });
  }, [createResume]);

  const updateResume = useCallback(async (id: string, data: ResumeUpdate) => {
    setError(null);
    try {
      const response = await apiClient.put(`/resumes/${id}`, data);
      setCurrentResume(response.data);
      return response.data as Resume;
    } catch (err: any) {
      setError(err.message || 'Failed to update resume');
      return null;
    }
  }, [setCurrentResume, setError]);

  const deleteResume = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiClient.delete(`/resumes/${id}`);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete resume');
      return false;
    }
  }, [setError]);

  return { fetchResumes, fetchResume, createResume, copyResume, updateResume, deleteResume };
}
