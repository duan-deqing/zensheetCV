import { useCallback } from 'react';
import {
  getResume,
  listResumes,
  newResumeId,
  putResume,
  removeResume,
  updateResumeRecord,
} from '@/storage/resumeStore';
import { useResumeStore } from '@/store/ResumeContext';
import { defaultTheme } from '@stylan/shared-types';
import type { ResumeCreate, ResumeUpdate, Resume } from '@stylan/shared-types';

export function useResume() {
  const { setCurrentResume, setResumes, setLoading, setError } = useResumeStore();

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResumes(await listResumes());
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
      const found = await getResume(id);
      if (!found) {
        setError('简历不存在或已被删除');
        return null;
      }
      setCurrentResume(found);
      return found;
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
      const now = new Date().toISOString();
      const resume: Resume = {
        id: newResumeId(),
        user_id: 'local',
        title: data.title,
        markdown: data.markdown,
        template_id: data.template_id ?? 'classic',
        theme_config: data.theme_config ?? defaultTheme,
        created_at: now,
        updated_at: now,
      };
      await putResume(resume);
      setCurrentResume(resume);
      return resume;
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
      const merged = await updateResumeRecord(id, data);
      if (!merged) {
        setError('简历不存在或已被删除');
        return null;
      }
      setCurrentResume(merged);
      return merged;
    } catch (err: any) {
      setError(err.message || 'Failed to update resume');
      return null;
    }
  }, [setCurrentResume, setError]);

  const deleteResume = useCallback(async (id: string) => {
    setError(null);
    try {
      await removeResume(id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete resume');
      return false;
    }
  }, [setError]);

  return { fetchResumes, fetchResume, createResume, copyResume, updateResume, deleteResume };
}
