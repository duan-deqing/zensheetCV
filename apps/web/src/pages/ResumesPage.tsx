import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { CSSProperties } from 'react';
import type { MarginOption, Resume, ThemeConfig } from '@stylan/shared-types';
import { useResume } from '@/hooks/useResume';
import { useResumeStore } from '@/store/ResumeContext';
import { useEditorDispatch } from '@/store/EditorContext';
import { getTemplateById, getTemplateCss } from '@/templates';
import { normalizeColMarkers, remarkResumeCols } from '@/preview/remarkResumeCols';
import { CONTENT_PADDING_MM, DEFAULT_CONTENT_PADDING, FONT_SCALE, MARGIN_MM, SPACING_SCALE, resumeColsCss } from '@/preview/previewShared';

/** 线性垃圾桶图标，颜色跟随 currentColor */
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

const DEFAULT_MARKDOWN = '# 姓名\n\n## 工作经历\n\n## 项目经验\n\n## 教育背景\n';

/** 竖直简历纸面缩略图：按该简历保存的模板与主题（主色调/字体/字号/间距）渲染，
 * 与编辑页预览使用同一套 Markdown 管线与变量体系。
 * 注意：<style> 是全局的，每张卡片必须用唯一作用域类，
 * 否则多份模板 CSS 同指 .rp-thumb 会互相覆盖、全部变成最后一张的样式 */
function ResumePaperPreview({ resume }: { resume: Resume }) {
  const templateId = resume.template_id || 'classic';
  // 兼容旧数据：pageMargin 为单值边距字段，现已拆分为 marginX/marginY
  const theme = (resume.theme_config || {}) as ThemeConfig & { pageMargin?: MarginOption };
  const defaults = getTemplateById(templateId).defaultTheme;
  // 简历 id 为 UUID，可安全用作 CSS 类名
  const scopeClass = `rp-thumb-${resume.id}`;
  const scoped = getTemplateCss(templateId).replace(/\.resume-preview/g, `.${scopeClass}`);
  const zoom = 0.55;
  const fs = FONT_SCALE[theme.fontSize ?? defaults.fontSize] ?? 1;
  const sp = SPACING_SCALE[theme.spacing ?? defaults.spacing] ?? 1;
  const normalized = normalizeColMarkers(resume.markdown ?? '');
  return (
    <div className="h-56 overflow-hidden bg-white border-b border-gray-100" aria-hidden="true">
      <style>{scoped}</style>
      <style>{resumeColsCss(`.${scopeClass}`)}</style>
      <div
        className="origin-top-left"
        style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }}
      >
        <div
          className={scopeClass}
          style={
            {
              '--resume-primary': theme.primaryColor ?? defaults.primaryColor,
              fontFamily: theme.fontFamily ?? defaults.fontFamily,
              '--resume-fs': fs,
              '--resume-sp': sp,
            } as CSSProperties
          }
        >
          {/* 每页四周总留白 = 页边距 + 内容边距，与分页预览/导出一致；
              旧数据仅有 pageMargin 单值字段时以其回退 */}
          <div
            style={{
              padding: `${
                (MARGIN_MM[theme.marginY ?? theme.pageMargin ?? 'none'] ?? 0) +
                (CONTENT_PADDING_MM[theme.contentPadding ?? DEFAULT_CONTENT_PADDING] ?? 0)
              }mm ${
                (MARGIN_MM[theme.marginX ?? theme.pageMargin ?? 'none'] ?? 0) +
                (CONTENT_PADDING_MM[theme.contentPadding ?? DEFAULT_CONTENT_PADDING] ?? 0)
              }mm`,
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkResumeCols]}>{normalized}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResumesPage() {
  const { resumes, isLoading, error } = useResumeStore();
  const { fetchResumes, createResume, deleteResume } = useResume();
  const editorDispatch = useEditorDispatch();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleCreate = async () => {
    setCreating(true);
    const resume = await createResume({
      title: '未命名简历',
      markdown: DEFAULT_MARKDOWN,
    });
    setCreating(false);
    if (resume) {
      editorDispatch({ type: 'RESET', payload: resume.markdown });
      navigate(`/editor/${resume.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await deleteResume(id);
    if (ok) fetchResumes();
  };

  const handleEdit = (resume: any) => {
    editorDispatch({ type: 'RESET', payload: resume.markdown });
    navigate(`/editor/${resume.id}`);
  };

  return (
    <div className="bg-white min-h-[calc(100dvh-5rem)]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* 页头：与主页同语言的 mono 眉标 + 计数 */}
        <div className="flex items-end justify-between mb-10 fade-up">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary-600 mb-3">
              &lt; LIBRARY /&gt;
            </p>
            <div className="flex items-baseline gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">我的简历</h1>
              {!isLoading && !error && (
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-400 tabular-nums">
                  {String(resumes.length).padStart(2, '0')} DOCS
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">选择一份简历开始编辑，或创建一份新的简历</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">加载简历失败：{error}</p>
          </div>
        )}

        {isLoading ? (
          /* 骨架屏：形状与最终卡片一致 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-5 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-100 rounded mt-3" />
                <div className="h-3 w-1/4 bg-gray-100 rounded mt-6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume, i) => (
              <div
                key={resume.id}
                className="card overflow-hidden flex flex-col cursor-default hover:shadow-md transition-all duration-300 group fade-up"
                style={{ animationDelay: `${0.08 + i * 0.05}s` }}
              >
                {/* 竖直纸面预览（装饰性，不响应点击） */}
                <ResumePaperPreview resume={resume} />
                <div className="p-4 flex flex-col gap-1.5 flex-1">
                  <h3 className="text-base font-semibold text-gray-900 truncate">{resume.title}</h3>
                  <p className="font-mono text-[11px] text-gray-400 tabular-nums">
                    UPDATED {new Date(resume.updated_at).toLocaleString('zh-CN')}
                  </p>
                  {/* 操作行：开始编辑靠左，删除靠右 */}
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <button
                      onClick={() => handleEdit(resume)}
                      className="inline-flex items-center gap-1 text-xs text-primary-600 font-medium hover:text-primary-700 active:scale-[0.98] transition-all"
                    >
                      开始编辑
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, resume.id)}
                      className="p-1.5 -m-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      title="删除简历"
                      aria-label={`删除 ${resume.title}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* 新建入口：与简历卡同宽同高，虚线边框 + 图标文字提示 */}
            <button
              onClick={handleCreate}
              disabled={creating}
              className="card p-5 min-h-[118px] flex flex-col items-center justify-center gap-3 cursor-pointer border-dashed border-gray-300 bg-gray-50/50 hover:border-primary-400 hover:bg-primary-50/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 fade-up disabled:cursor-wait disabled:opacity-60"
              style={{ animationDelay: `${0.08 + resumes.length * 0.05}s` }}
            >
              {/* mono 标记眉标，与站内 < LIBRARY /> 等语言呼应 */}
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gray-400 group-hover:text-primary-500 transition-colors">
                {'// NEW'}
              </span>
              <span
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono text-2xl leading-none transition-colors ${
                  creating
                    ? 'bg-gray-100 text-gray-400 animate-pulse'
                    : 'bg-white border border-gray-200 text-gray-400 group-hover:border-primary-300 group-hover:bg-primary-50 group-hover:text-primary-600'
                }`}
                aria-hidden="true"
              >
                +
              </span>
              <span className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  {creating ? '创建中...' : resumes.length === 0 ? '新建你的第一份简历' : '新建简历'}
                </span>
                {resumes.length === 0 && !creating && (
                  <span className="text-xs text-gray-400">写下姓名与经历，其余交给模板</span>
                )}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
