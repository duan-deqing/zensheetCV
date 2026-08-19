import { useEffect } from 'react';
import { useResumeStore } from '@/store/ResumeContext';
import { useResume } from '@/hooks/useResume';
import { useUI } from '@/store/UIContext';

export function ResumeList() {
  const { resumes, currentResume, setCurrentResume, isLoading } = useResumeStore();
  const { fetchResumes } = useResume();
  const { sidebarOpen } = useUI();

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  if (!sidebarOpen) return null;

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">我的简历</h2>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-8">暂无简历，点击下方创建</p>
        ) : (
          <div className="flex flex-col gap-1">
            {resumes.map((resume) => (
              <button
                key={resume.id}
                onClick={() => setCurrentResume(resume)}
                className={`text-left px-3 py-2.5 rounded-lg transition-colors ${
                  currentResume?.id === resume.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="text-sm font-medium text-gray-900 truncate">{resume.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(resume.updated_at).toLocaleDateString('zh-CN')}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 border-t border-gray-200">
        <button className="w-full btn-secondary text-xs py-2">
          + 新建简历
        </button>
      </div>
    </div>
  );
}
