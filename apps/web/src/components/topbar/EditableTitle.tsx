import { useEffect, useRef, useState } from 'react';
import { useResumeStore } from '@/store/ResumeContext';
import { useResume } from '@/hooks/useResume';
import { HoverTip } from '@/components/HoverTip';
import { useTr } from '@/i18n/LangContext';
import type { StatusKind } from '@/components/ButtonStatus';
import { PencilIcon } from '@/components/topbar/icons';

/** 估算文本显示宽度：中文等全角字符约 1em，英文/数字约 0.55em */
function textWidth(s: string) {
  return [...s].reduce((w, c) => w + (c.charCodeAt(0) > 0x2e80 ? 1 : 0.55), 0);
}

const TITLE_EDIT_MS = 160; // 退出动画时长，需与 animations.css 中 titleEditOut 保持一致

/** 可编辑简历标题：点击进入行内编辑，Enter/失焦保存，Esc 取消；
 *  进入/退出编辑态均带过渡动画（退出先播淡出，动画结束后再切回名称按钮） */
export function EditableTitle({ onNotify }: { onNotify: (kind: StatusKind, text: string) => void }) {
  const { currentResume } = useResumeStore();
  const { updateResume } = useResume();
  const [editing, setEditing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const closingRef = useRef(false);
  const tr = useTr();

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (!currentResume) {
    return <h1 className="text-sm font-semibold text-gray-900 truncate">{tr({ zh: '编辑简历', en: 'Edit Resume' })}</h1>;
  }

  /** 退出编辑态：先播淡出动画，结束后切回名称按钮（Enter 提交与 Esc 取消共用；closingRef 防止动画期间重复触发） */
  const exitEditing = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(() => {
      closingRef.current = false;
      setClosing(false);
      setEditing(false);
    }, TITLE_EDIT_MS);
  };

  /** 保存并退出：退出动画与保存请求并行，不阻塞过渡 */
  const commit = () => {
    exitEditing();
    const next = draft.trim();
    if (!next || next === currentResume.title) {
      if (!next) onNotify('error', tr({ zh: '名称不能为空', en: 'Name cannot be empty' }));
      return;
    }
    void updateResume(currentResume.id, { title: next }).then((result) =>
      onNotify(
        result ? 'success' : 'error',
        result ? tr({ zh: '重命名成功', en: 'Renamed' }) : tr({ zh: '重命名失败', en: 'Rename failed' }),
      ),
    );
  };

  return (
    <>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => { if (!closingRef.current) commit(); }}
          onKeyDown={(e) => {
            if (closingRef.current) return; // 退出动画期间忽略输入事件
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') exitEditing();
          }}
          className={`text-sm font-semibold text-gray-900 bg-white border-b border-primary-400 outline-none px-0.5 py-0 transition-[width] duration-150 ease-out ${
            closing ? 'title-edit-out' : 'title-edit-in'
          }`}
          style={{ width: `${Math.min(Math.max(textWidth(draft) + 0.5, 10), 20)}em` }}
          maxLength={60}
          aria-label={tr({ zh: '简历名称', en: 'Resume name' })}
        />
      ) : (
        <HoverTip text={tr({ zh: '点击修改名称', en: 'Click to rename' })}>
          <button
            type="button"
            onClick={() => {
              setDraft(currentResume.title);
              setEditing(true);
            }}
            className="title-edit-in group flex items-center gap-1.5 min-w-0 text-sm font-semibold text-gray-900 hover:text-primary-700 transition-colors"
          >
            <span className="truncate">{currentResume.title}</span>
            <PencilIcon />
          </button>
        </HoverTip>
      )}
    </>
  );
}
