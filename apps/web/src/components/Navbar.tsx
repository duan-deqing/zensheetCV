import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (isHome) return null;

  return (
    <nav className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <Link to="/" className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors">
        Stylan Resume
      </Link>
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Link to="/editor" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
              编辑器
            </Link>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              退出
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              登录
            </Link>
            <Link to="/register" className="btn-primary text-xs px-4 py-2">
              注册
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
