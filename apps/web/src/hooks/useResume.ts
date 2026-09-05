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
import { getLang } from '@/i18n/LangContext';

/** IndexedDB 异常不透出底层英文报错（浏览器技术细节），统一映射为当前语言的友好提示 */
function dbError(message: { zh: string; en: string }): string {
  return getLang() === 'en' ? message.en : message.zh;
}

export function useResume() {
  const { setCurrentResume, setResumes, setLoading, setError } = useResumeStore();

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResumes(await listResumes());
    } catch {
      setError(dbError({ zh: '读取简历列表失败，请刷新重试', en: 'Failed to load your resumes — please refresh and retry' }));
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
        setError(getLang() === 'en' ? 'Resume not found or deleted' : '简历不存在或已被删除');
        return null;
      }
      setCurrentResume(found);
      return found;
    } catch {
      setError(dbError({ zh: '读取简历失败，请重试', en: 'Failed to open the resume — please retry' }));
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
    } catch {
      setError(dbError({ zh: '创建简历失败，请重试', en: 'Failed to create the resume — please retry' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [setCurrentResume, setLoading, setError]);

  /** 复制一份简历（内容 / 模板 / 主题原样拷贝），名称追加「副本」 */
  const copyResume = useCallback(async (resume: Resume) => {
    const suffix = getLang() === 'en' ? ' (Copy)' : ' 副本';
    return createResume({
      title: `${resume.title}${suffix}`,
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
        setError(getLang() === 'en' ? 'Resume not found or deleted' : '简历不存在或已被删除');
        return null;
      }
      setCurrentResume(merged);
      return merged;
    } catch {
      setError(dbError({ zh: '保存失败，请重试；若持续失败请勿关闭页面', en: 'Failed to save — please retry and keep this page open' }));
      return null;
    }
  }, [setCurrentResume, setError]);

  const deleteResume = useCallback(async (id: string) => {
    setError(null);
    try {
      await removeResume(id);
      return true;
    } catch {
      setError(dbError({ zh: '删除简历失败，请重试', en: 'Failed to delete the resume — please retry' }));
      return false;
    }
  }, [setError]);

  return { fetchResumes, fetchResume, createResume, copyResume, updateResume, deleteResume };
}
