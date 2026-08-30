import { useEffect, useRef, useState } from 'react';

export type StatusKind = 'success' | 'error';

export interface ButtonStatusState {
  kind: StatusKind;
  text: string;
  seq: number;
}

const HIDE_DELAY_MS = 2200;
const EXIT_MS = 180;

/** 按钮级提示状态：show() 触发气泡，停留后先播放缩回淡出再卸载 */
export function useButtonStatus() {
  const [status, setStatus] = useState<ButtonStatusState | null>(null);
  const [exiting, setExiting] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);
  const exitTimer = useRef<number | undefined>(undefined);

  const show = (kind: StatusKind, text: string) => {
    window.clearTimeout(exitTimer.current);
    setExiting(false);
    setStatus((s) => ({ kind, text, seq: (s?.seq ?? 0) + 1 }));
  };

  useEffect(() => {
    if (!status) return;
    hideTimer.current = window.setTimeout(() => setExiting(true), HIDE_DELAY_MS);
    return () => window.clearTimeout(hideTimer.current);
  }, [status]);

  useEffect(() => {
    if (!exiting) return;
    exitTimer.current = window.setTimeout(() => setStatus(null), EXIT_MS);
    return () => window.clearTimeout(exitTimer.current);
  }, [exiting]);

  return { status, exiting, show };
}

/** 按钮结果气泡：placement 决定悬浮位置，入场 pop、离场缩回淡出 */
export function ButtonStatus({
  status,
  exiting = false,
  placement = 'top',
}: {
  status: ButtonStatusState | null;
  exiting?: boolean;
  placement?: 'top' | 'left';
}) {
  if (!status) return null;
  const anim = exiting
    ? placement === 'left'
      ? 'status-pop-left-out'
      : 'status-pop-out'
    : placement === 'left'
      ? 'status-pop-left'
      : 'status-pop';
  const ok = status.kind === 'success';
  const bubble = (
    <span
      key={status.seq}
      role="status"
      className={`${anim} inline-flex items-center gap-1.5 h-7 px-3 rounded-full border text-xs font-medium shadow-lg whitespace-nowrap ${
        ok
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      <span className="font-mono" aria-hidden="true">{ok ? '✓' : '✕'}</span>
      {status.text}
    </span>
  );
  if (placement === 'left') {
    return (
      <span className="absolute right-full top-0 bottom-0 flex items-center pr-2.5 pointer-events-none">
        {bubble}
      </span>
    );
  }
  return (
    <span className="absolute bottom-full right-0 mb-2.5 pointer-events-none">
      {bubble}
    </span>
  );
}
