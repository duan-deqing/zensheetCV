import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { useUI } from '@/store/UIContext';
import { useLang, useTr } from '@/i18n/LangContext';
import { HoverTip } from '@/components/HoverTip';

const SHOW_THRESHOLD = 80; // 近顶部时始终显示
const HIDE_DELTA = 4; // 忽略微小抖动

/** 导航线性图标基类：14px 描边风格，颜色跟随 currentColor */
function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 shrink-0"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function HomeIcon() {
  return (
    <NavIcon>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </NavIcon>
  );
}

function FileTextIcon() {
  return (
    <NavIcon>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </NavIcon>
  );
}

function BookIcon() {
  return (
    <NavIcon>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </NavIcon>
  );
}

function GlobeIcon() {
  return (
    <NavIcon>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </NavIcon>
  );
}

export function Navbar() {
  const { user } = useAuth();
  const { toggleUserModal } = useUI();
  const { lang, setLang } = useLang();
  const tr = useTr();
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
    `inline-flex items-center gap-1.5 text-sm transition-colors ${
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
        aria-label={tr({ zh: '主导航', en: 'Main navigation' })}
        aria-hidden={hidden}
      >
        {/* 最大宽度与页面 section 一致（max-w-7xl），两侧留白对齐 */}
        <div className="w-full max-w-7xl h-14 flex items-center justify-between rounded-full border border-gray-200/80 bg-white/85 backdrop-blur-md shadow-[0_16px_44px_rgba(17,24,39,0.10)] px-6">
          <div className="flex items-center gap-8 min-w-0">
            <Link
              to="/"
              className="text-[15px] font-extrabold uppercase tracking-tight text-gray-900 shrink-0"
            >
              ZENSHEET{' '}
              <span className="text-primary-600">{tr({ zh: '· 简历', en: '· Resume' })}</span>
            </Link>
            <div className="hidden md:flex items-center gap-7">
              <Link to="/" className={linkClass('/')}>
                <HomeIcon />
                {tr({ zh: '首页', en: 'Home' })}
              </Link>
              <Link to="/resumes" className={linkClass('/resumes')}>
                <FileTextIcon />
                {tr({ zh: '我的简历', en: 'My Resumes' })}
              </Link>
              <Link to="/docs" className={linkClass('/docs')}>
                <BookIcon />
                {tr({ zh: '文档', en: 'Docs' })}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* 语言切换：中 / EN，位于用户信息左侧；悬浮提示与编辑器页面统一（HoverTip 气泡） */}
            <HoverTip text={lang === 'zh' ? 'Switch to English' : '切换为中文'}>
              <button
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors px-2 h-8 rounded-full hover:bg-gray-100"
                aria-label={lang === 'zh' ? 'Switch to English' : '切换为中文'}
              >
                <GlobeIcon />
                <span className="hidden sm:inline font-mono text-[12px] tracking-wide">
                  {lang === 'zh' ? 'EN' : '中'}
                </span>
              </button>
            </HoverTip>
            {/* 头像 + 用户名，点击打开设置弹窗，与编辑页 TopBar 同构 */}
            <button
              onClick={toggleUserModal}
              className="flex items-center gap-2 group px-1"
              aria-haspopup="dialog"
              aria-label={tr({ zh: '用户信息', en: 'User' })}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={tr({ zh: `${user?.name ?? '用户'} 的头像`, en: `Avatar of ${user?.name ?? 'user'}` })}
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
          </div>
        </div>
      </nav>
    </>
  );
}
