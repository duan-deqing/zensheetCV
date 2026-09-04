import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HoverTip } from '@/components/HoverTip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { CSSProperties } from 'react';
import type { MarginOption, Resume, ThemeConfig } from '@stylan/shared-types';
import { useResume } from '@/hooks/useResume';
import { useResumeStore } from '@/store/ResumeContext';
import { useEditorDispatch } from '@/store/EditorContext';
import { getTemplateById, getTemplateCss } from '@/templates';
import { normalizeColMarkers, remarkResumeCols } from '@/preview/remarkResumeCols';
import { sampleMarkdown } from '@/sampleResume';
import { useLang, useTr, type Bi } from '@/i18n/LangContext';
import { CONTENT_PADDING_MM, DEFAULT_CONTENT_PADDING, elementFontSizeVars, fontScale, MARGIN_MM, rehypeWrapH2Text, spacingScale, resumeColsCss, resumeFontSizeCss } from '@/preview/previewShared';

/** 每个浏览器最多可持有的简历份数 */
const MAX_RESUMES = 15;

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

/** 线性复制图标：两个叠加的圆角矩形 */
function CopyIcon({ className }: { className?: string }) {
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
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

/** 线性编辑图标：笔写方形 */
function EditIcon({ className }: { className?: string }) {
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
      <path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
    </svg>
  );
}

/** 页脚随缘语录：每次进入页面随机展示一句（英文为意境翻译） */
const QUOTES: Bi[] = [
  { zh: '纸上得来终觉浅，绝知此事要躬行。', en: 'What you read runs shallow — only doing makes it yours.' },
  { zh: '种一棵树最好的时间是十年前，其次是现在。', en: 'The best time to plant a tree was ten years ago. The second best is now.' },
  { zh: '路虽远，行则将至；事虽难，做则必成。', en: 'However long the road, walking takes you there; however hard the task, doing gets it done.' },
  { zh: '不积跬步，无以至千里。', en: 'Great distances are gathered step by step.' },
  { zh: '每一份简历，都是过去对未来的自荐信。', en: 'Every resume is a letter from your past self to your future.' },
  { zh: '山不让尘，川不辞盈。', en: 'Mountains rise by welcoming dust; rivers swell by taking in streams.' },
  { zh: '星光不问赶路人，时光不负有心人。', en: 'The stars never question the traveler, and time rewards a devoted heart.' },
  { zh: '所谓成长，就是把经历酿成能力。', en: 'Growth is brewing experience into ability.' },
  { zh: '机会总是留给有准备的人。', en: 'Chance favors the prepared mind.' },
  { zh: '流水不争先，争的是滔滔不绝。', en: 'Flowing water never races ahead — it wins by simply never stopping.' },
  { zh: '工具善用则益，AI 替你落笔，但路要你自己走过。', en: 'AI can hold the pen for you, but the road is yours to walk.' },
  { zh: '机器可以生成文字，唯有你的人生值得书写。', en: 'Machines can generate words; only your life is worth writing.' },
];

/** 从语录中随机取一条（每次刷新 / 进入页面都会重新选择） */
function pickQuote(): Bi {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

/** 竖直简历纸面缩略图：按该简历保存的模板与主题（主色调/字体/字号/行距）渲染，
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
  const fs = fontScale({ fontSize: theme.fontSize ?? defaults.fontSize });
  const sp = spacingScale({
    lineHeight: theme.lineHeight ?? defaults.lineHeight,
    // 旧数据行距存于 spacing 档位字段
    spacing: (theme as { spacing?: unknown }).spacing,
  });
  const normalized = normalizeColMarkers(resume.markdown ?? '');
  return (
    <div className="h-56 overflow-hidden bg-white border-b border-gray-100" aria-hidden="true">
      <style>{scoped}</style>
      <style>{resumeColsCss(`.${scopeClass}`)}</style>
      <style>{resumeFontSizeCss(`.${scopeClass}`)}</style>
      <style>{`.${scopeClass}{${elementFontSizeVars(theme)}}`}</style>
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkResumeCols]}
              rehypePlugins={[rehypeWrapH2Text]}
            >
              {normalized}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResumesPage() {
  const { resumes, isLoading, error } = useResumeStore();
  const { fetchResumes, createResume, copyResume, deleteResume } = useResume();
  const editorDispatch = useEditorDispatch();
  const navigate = useNavigate();
  const { lang } = useLang();
  const tr = useTr();
  const [creating, setCreating] = useState(false);
  // 正在复制中的简历 id（按钮显示进行中状态）
  const [copyingId, setCopyingId] = useState<string | null>(null);
  // 页脚随缘语录：仅组件挂载（进入/刷新页面）时随机取一次
  const [quote] = useState(pickQuote);

  // 简历创建份数上限（本地存储版仅此前置拦截与提示）
  const atLimit = !isLoading && resumes.length >= MAX_RESUMES;

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleCreate = async () => {
    if (atLimit) return;
    setCreating(true);
    const resume = await createResume({
      title: tr({ zh: '未命名简历', en: 'Untitled Resume' }),
      markdown: sampleMarkdown(lang),
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

  const handleCopy = async (e: React.MouseEvent, resume: Resume) => {
    e.stopPropagation();
    if (atLimit) return;
    setCopyingId(resume.id);
    const copy = await copyResume(resume);
    setCopyingId(null);
    if (copy) fetchResumes();
  };

  const handleEdit = (resume: any) => {
    editorDispatch({ type: 'RESET', payload: resume.markdown });
    navigate(`/editor/${resume.id}`);
  };

  return (
    <div className="bg-white min-h-[calc(100dvh-5rem)] pb-14">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* 页头：与主页同语言的 mono 眉标 + 计数 */}
        <div className="flex items-end justify-between mb-10 fade-up">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary-600 mb-3">
              &lt; LIBRARY /&gt;
            </p>
            <div className="flex items-baseline gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{tr({ zh: '我的简历', en: 'My Resumes' })}</h1>
              {!isLoading && !error && (
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-400 tabular-nums">
                  {String(resumes.length).padStart(2, '0')} DOCS
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">{tr({ zh: '选择一份简历开始编辑，或创建一份新的简历', en: 'Pick a resume to start editing, or create a new one' })}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{tr({ zh: `加载简历失败：${error}`, en: `Failed to load resumes: ${error}` })}</p>
          </div>
        )}

        {/* 创建份数已达上限提示（新建与复制均被拦截） */}
        {atLimit && (
          <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-600">
              {tr({
                zh: `最多可创建 ${MAX_RESUMES} 份简历，已达上限；删除不需要的简历后可继续新建或复制。`,
                en: `You can keep up to ${MAX_RESUMES} resumes — the limit is reached. Delete one to create or duplicate more.`,
              })}
            </p>
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
                    UPDATED {new Date(resume.updated_at).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                  </p>
                  {/* 操作行：开始编辑 + 复制靠左（同款文字样式），删除靠右 */}
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(resume)}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 font-medium hover:text-primary-700 active:scale-[0.98] transition-all"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                        {tr({ zh: '开始编辑', en: 'Edit' })}
                      </button>
                      <button
                        onClick={(e) => handleCopy(e, resume)}
                        disabled={copyingId === resume.id}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 font-medium hover:text-primary-700 active:scale-[0.98] transition-all disabled:cursor-wait disabled:opacity-60"
                      >
                        <CopyIcon className={`w-3.5 h-3.5 ${copyingId === resume.id ? 'animate-pulse' : ''}`} />
                        {copyingId === resume.id ? tr({ zh: '复制中...', en: 'Duplicating...' }) : tr({ zh: '复制', en: 'Duplicate' })}
                      </button>
                    </div>
                    <HoverTip text={tr({ zh: '删除简历', en: 'Delete resume' })}>
                      <button
                        onClick={(e) => handleDelete(e, resume.id)}
                        className="p-1.5 -m-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                        aria-label={tr({ zh: `删除 ${resume.title}`, en: `Delete ${resume.title}` })}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </HoverTip>
                  </div>
                </div>
              </div>
            ))}

            {/* 新建入口：与简历卡同宽同高，虚线边框 + 图标文字提示；达上限时禁用 */}
            <button
              onClick={handleCreate}
              disabled={creating || atLimit}
              className="card p-5 min-h-[118px] flex flex-col items-center justify-center gap-3 cursor-pointer border-dashed border-gray-300 bg-gray-50/50 hover:border-primary-400 hover:bg-primary-50/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 fade-up disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none disabled:hover:translate-y-0"
              style={{ animationDelay: `${0.08 + resumes.length * 0.05}s` }}
            >
              {/* mono 标记眉标，与站内 < LIBRARY /> 等语言呼应 */}
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gray-400 group-hover:text-primary-500 transition-colors">
                {atLimit ? '// FULL' : '// NEW'}
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
                  {creating
                    ? tr({ zh: '创建中...', en: 'Creating...' })
                    : atLimit
                      ? tr({ zh: `已达创建上限（${MAX_RESUMES} 份）`, en: `Creation limit reached (${MAX_RESUMES})` })
                      : resumes.length === 0
                        ? tr({ zh: '新建你的第一份简历', en: 'Create your first resume' })
                        : tr({ zh: '新建简历', en: 'New Resume' })}
                </span>
                {atLimit && !creating ? (
                  <span className="text-xs text-gray-400">{tr({ zh: '删除不需要的简历后可继续创建', en: 'Delete a resume to create more' })}</span>
                ) : resumes.length === 0 && !creating ? (
                  <span className="text-xs text-gray-400">{tr({ zh: '写下姓名与经历，其余交给模板', en: 'Write your name and experience — the template does the rest' })}</span>
                ) : null}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 页脚：固定底部，随机语录，每次刷新换一句 */}
      <footer className="fixed bottom-0 inset-x-0 z-10 bg-white/90 backdrop-blur border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3.5 text-center">
          <p className="text-[13px] text-gray-400 tracking-wide">「 {tr(quote)} 」</p>
        </div>
      </footer>
    </div>
  );
}
