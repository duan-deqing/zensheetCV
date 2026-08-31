import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { useUI } from '@/store/UIContext';

const SHOW_THRESHOLD = 80; // 近顶部时始终显示
const HIDE_DELTA = 4; // 忽略微小抖动

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { toggleUserModal } = useUI();
  const { pathname } = useLocation();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // 路由切换时恢复显示
  useEffect(() => {
    setHidden(false);
    lastY.current = window.scrollY;
  }, [pathname]);

  // rAF 节流的滚动方向检测：向下滚动收起，向上滚动显示
  // 仅在 hidden 状态翻转时触发重渲染，滚动帧本身不更新 React 状态
  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < SHOW_THRESHOLD) {
        setHidden(false);
      } else if (delta > HIDE_DELTA) {
        setHidden(true);
      } else if (delta < -HIDE_DELTA) {
        setHidden(false);
      }
      lastY.current = y;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 编辑器页面使用自己的 TopBar 作为唯一头部，隐藏全局导航栏
  // 注意：早退必须放在所有 hooks 之后，保证路由切换时 hook 数量一致
  if (pathname.startsWith('/editor')) return null;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const linkClass = (path: string) =>
    `text-sm transition-colors ${
      isActive(path) ? 'text-primary-600 font-medium' : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <>
      {/* 浮动胶囊不占文档流，用占位块避免遮挡页面内容 */}
      <div className="h-20" aria-hidden="true" />
      <nav
        className={`fixed top-4 inset-x-0 z-40 flex justify-center px-6 will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          hidden ? '-translate-y-[130%]' : 'translate-y-0'
        }`}
        aria-label="主导航"
        aria-hidden={hidden}
      >
        {/* 最大宽度与页面 section 一致（max-w-7xl），两侧留白对齐 */}
        <div className="w-full max-w-7xl h-14 flex items-center justify-between rounded-full border border-gray-200/80 bg-white/85 backdrop-blur-md shadow-[0_16px_44px_rgba(17,24,39,0.10)] px-6">
          <div className="flex items-center gap-8 min-w-0">
            <Link
              to="/"
              className="text-[15px] font-extrabold uppercase tracking-tight text-gray-900 shrink-0"
            >
              ZENSHEET<span className="text-primary-600">·禅笺</span>
            </Link>
            <div className="hidden md:flex items-center gap-7">
              <Link to="/" className={linkClass('/')}>
                首页
              </Link>
              {isAuthenticated && (
                <Link to="/resumes" className={linkClass('/resumes')}>
                  我的简历
                </Link>
              )}
              <Link to="/docs" className={linkClass('/docs')}>
                文档
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                {/* 头像 + 用户名，点击打开设置弹窗，与编辑页 TopBar 同构 */}
                <button
                  onClick={toggleUserModal}
                  className="flex items-center gap-2 group px-1"
                  aria-haspopup="dialog"
                  aria-label="用户信息"
                >
                  {user?.avatar ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || ''}${user.avatar}`}
                      alt={`${user?.name ?? '用户'} 的头像`}
                      className="w-6 h-6 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <span
                      className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center text-[11px] font-semibold select-none"
                      aria-hidden="true"
                    >
                      {(user?.name ?? '?').slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden sm:inline text-sm text-gray-700 group-hover:text-primary-600 transition-colors truncate max-w-[10rem]">
                    {user?.name}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-2"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <span className="hidden sm:block w-px h-5 bg-gray-200" aria-hidden="true" />
                <Link to="/login" className={`${linkClass('/login')} px-2`}>
                  登录
                </Link>
                <Link
                  to="/register"
                  className={`h-9 inline-flex items-center px-4 rounded-full border font-semibold text-sm active:scale-[0.98] transition-all ${
                    isActive('/register')
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white'
                  }`}
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
