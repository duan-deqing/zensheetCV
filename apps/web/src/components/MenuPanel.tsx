import type { ReactNode } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useTr } from '@/i18n/LangContext';
import { UserAvatar } from '@/components/UserAvatar';

/** 手机端折叠菜单共享组件：Navbar 与编辑页 TopBar 的折叠菜单同构
 *  （容器 / 菜单项 / 分隔线 / 汉堡触发按钮 / 用户信息项），避免两套平行实现 */

/** 菜单项样式：普通态 / 高亮态（当前激活项）/ 禁用态追加 */
export const menuItemClass =
  'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors';
export const menuItemActiveClass =
  'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm bg-primary-50 text-primary-600 font-medium';
export const menuItemDisabledClass = ' disabled:opacity-40 disabled:hover:bg-transparent';

/** 折叠菜单面板容器：与所属胶囊右对齐，入场动画 nav-menu-pop（animations.css） */
export function MenuPanel({ children }: { children: ReactNode }) {
  return (
    <div
      role="menu"
      className="nav-menu-pop md:hidden absolute right-2 w-60 max-w-[calc(100%-1rem)] top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-[0_16px_44px_rgba(17,24,39,0.12)] py-2 z-40"
    >
      {children}
    </div>
  );
}

/** 菜单内分隔线 */
export function MenuDivider() {
  return <div className="my-1.5 h-px bg-gray-100" aria-hidden="true" />;
}

/** 菜单按钮项：icon + 文案，active 高亮当前功能，disabled 用于保存/导出进行中 */
export function MenuButton({
  icon,
  children,
  onClick,
  active = false,
  disabled = false,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={`${active ? menuItemActiveClass : menuItemClass}${disabled ? menuItemDisabledClass : ''}`}
    >
      {icon}
      {children}
    </button>
  );
}

/** 用户信息菜单项：头像 + 名称，点击打开设置弹窗（Navbar / TopBar 折叠菜单一致） */
export function MenuUserItem({ onSelect }: { onSelect: () => void }) {
  const { user } = useAuth();
  const tr = useTr();
  return (
    <MenuButton
      onClick={onSelect}
      icon={
        <UserAvatar user={user} size="sm" decorative />
      }
    >
      {user?.name || tr({ zh: '用户信息', en: 'User info' })}
    </MenuButton>
  );
}

/** 汉堡 / 关闭切换按钮（手机端折叠菜单触发器），Navbar 与 TopBar 同款 */
export function MenuToggleButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const tr = useTr();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label={open ? tr({ zh: '关闭菜单', en: 'Close menu' }) : tr({ zh: '打开菜单', en: 'Open menu' })}
      className="md:hidden flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
    >
      {open ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      )}
    </button>
  );
}
