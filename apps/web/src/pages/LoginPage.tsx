import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

const FEATURES = [
  { no: '01', label: 'MARKDOWN 编辑', desc: '左侧书写，右侧实时预览' },
  { no: '02', label: 'AI 润色', desc: '逐段打磨表达，匹配关键词' },
  { no: '03', label: 'PDF 导出', desc: '服务端渲染，直接投递' },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login({ email, password });
    if (success) {
      navigate('/editor');
    } else {
      setError('邮箱或密码错误');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white min-h-[calc(100dvh-5rem)]">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 min-h-[calc(100dvh-5rem)]">
        {/* 品牌面板：与主页同语言的编号行，整体垂直居中 */}
        <div className="hidden lg:flex flex-col justify-center py-16 pr-16 border-r border-gray-200">
          <div>
            <p className="fade-up font-mono text-xs uppercase tracking-[0.22em] text-primary-600 mb-5">
              &lt; ACCESS /&gt;
            </p>
            <h2 className="fade-up text-4xl font-bold tracking-tight leading-[1.15] mb-4" style={{ animationDelay: '0.08s' }}>
              回到编辑器，
              <br />
              继续打磨<span className="text-primary-600">简历</span>
            </h2>
            <p className="fade-up text-gray-600 leading-relaxed max-w-[30em]" style={{ animationDelay: '0.16s' }}>
              登录您的 STYLAN RESUME 账户，上次的进度都在。
            </p>
          </div>
          <div className="mt-14 divide-y divide-gray-200">
            {FEATURES.map((f) => (
              <div key={f.no} className="flex items-baseline gap-4 py-4 fade-up" style={{ animationDelay: '0.24s' }}>
                <span className="font-mono text-sm text-primary-600 tabular-nums shrink-0">{f.no}</span>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-900">{f.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 表单 */}
        <div className="flex items-center justify-center py-14 lg:py-16 lg:pl-16">
          <div className="w-full max-w-md">
            <div className="card p-8 fade-up" style={{ animationDelay: '0.12s' }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-6">
                // SIGN IN
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">欢迎回来</h1>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label htmlFor="login-email" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    邮箱
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    密码
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '登录中...' : '登录'}
                </button>
              </form>
              <p className="text-sm text-gray-500 mt-6">
                还没有账户？{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  立即注册
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
