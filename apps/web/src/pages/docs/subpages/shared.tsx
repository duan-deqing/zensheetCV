import { createContext, useContext } from 'react';
import { Link } from 'react-router-dom';

/* ============ 跨文档跳转：文档页内为路由链接，编辑器抽屉内为切换 Tab ============ */

/** 抽屉内容器：提供时，文档间链接切换抽屉 Tab 而非路由跳转 */
export const DrawerNavContext = createContext<((to: string) => void) | null>(null);

/** 文档间跳转链接：在编辑器抽屉中渲染时切换抽屉 Tab，否则按路由跳转 */
export function DocPageLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  const nav = useContext(DrawerNavContext);
  if (nav) {
    return (
      <button type="button" onClick={() => nav(to)} className={className}>
        {children}
      </button>
    );
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}
