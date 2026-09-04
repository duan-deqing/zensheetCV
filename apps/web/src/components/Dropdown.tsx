import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useTr } from '@/i18n/LangContext';

export interface DropdownOption<T extends string> {
  value: T;
  /** 选项文案：支持 ReactNode（如「默认」徽章标签） */
  label: ReactNode;
}

/** 通用下拉选择：白色圆角卡片弹层 + 主色 hover + 选中打勾，与全站风格一致；
 *  弹层方向自适应：默认向下展开，下方空间不足且上方更充裕时自动改为向上展开 */
export function Dropdown<T extends string>({
  options,
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = '',
}: {
  options: readonly DropdownOption<T>[];
  value: T | '';
  onChange: (v: T) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const [dir, setDir] = useState<'down' | 'up'>('down');
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  // 展开时按可视区剩余空间决定弹层方向（useLayoutEffect 在绘制前翻转，无闪烁）
  useLayoutEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    const menu = menuRef.current;
    if (!root || !menu) return;
    const rect = root.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setDir(
      spaceBelow < menu.offsetHeight + 8 && spaceAbove > spaceBelow ? 'up' : 'down',
    );
  }, [open, options.length]);

  // 点击外部 / Escape 关闭
  useEffect(() => {
    if (!open) return;
    const handleDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`w-full flex items-center justify-between gap-2 text-[13px] border rounded-md px-2.5 py-2 bg-white transition-colors outline-none ${
          open
            ? 'border-primary-300 ring-2 ring-primary-500/30'
            : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-primary-500/30'
        }`}
      >
        <span className={`truncate ${current ? 'text-gray-700' : 'text-gray-400'}`}>
          {current?.label ?? placeholder ?? tr({ zh: '请选择', en: 'Select' })}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          className={`dropdown-pop absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 max-h-60 overflow-y-auto ${
            dir === 'up' ? 'bottom-full mb-1 dropdown-up' : 'top-full mt-1 dropdown-down'
          }`}
        >
          <style>{`
            @keyframes dropdownIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes dropdownInUp {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .dropdown-pop.dropdown-down { animation: dropdownIn 0.15s ease-out both; }
            .dropdown-pop.dropdown-up { animation: dropdownInUp 0.15s ease-out both; }
            @media (prefers-reduced-motion: reduce) {
              .dropdown-pop.dropdown-down, .dropdown-pop.dropdown-up { animation: none; }
            }
          `}</style>
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 text-left text-[14px] px-3 py-2 transition-colors ${
                  selected
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {selected && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3.5 h-3.5 shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
