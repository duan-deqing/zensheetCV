import type { User } from '@stylan/shared-types';
import { useTr } from '@/i18n/LangContext';

/** 头像（无头像时回退首字母圆标）。
 *  size: md = 顶栏/导航栏直显（w-6），sm = 折叠菜单项（w-5）；
 *  decorative: 纯展示用途（alt 置空，aria-hidden），用于菜单项等文字已表意的场景 */
export function UserAvatar({
  user,
  size = 'md',
  decorative = false,
}: {
  user: User | null | undefined;
  size?: 'sm' | 'md';
  decorative?: boolean;
}) {
  const tr = useTr();
  const box = size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-[11px]';
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={decorative ? '' : tr({ zh: `${user.name} 的头像`, en: `${user.name}'s avatar` })}
        className={`${box} rounded-full object-cover border border-gray-200`}
      />
    );
  }
  return (
    <span
      className={`${box} rounded-full bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center font-semibold select-none`}
      aria-hidden={decorative ? true : undefined}
    >
      {(user?.name ?? '?').slice(0, 1).toUpperCase()}
    </span>
  );
}
